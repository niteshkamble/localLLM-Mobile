import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HuggingfaceModel } from "../../../utils/types";
import { downloadModel as downloadModelAPI, DownloadProgress } from "../../services/hfService";

export interface DownloadState {
    isDownloading: boolean;
    progress: number; // Percentage 0-100
    downloadedSize: number; // Bytes downloaded
    totalSize: number; // Total bytes to download
    currentModel: HuggingfaceModel | null;
    error: string | null;
    downloadSpeed: number; // Bytes per second
    timeRemaining: number; // Seconds remaining
}

const initialState: DownloadState = {
    isDownloading: false,
    progress: 0,
    downloadedSize: 0,
    totalSize: 0,
    currentModel: null,
    error: null,
    downloadSpeed: 0,
    timeRemaining: 0,
};

// Track progress updates per download to prevent memory leaks
const downloadTrackers = new Map<string, {
    lastProgressUpdate: { bytes: number; time: number } | null;
    lastReduxUpdate: { bytes: number; time: number } | null;
    lastSpeedUpdate: { bytes: number; time: number } | null;
}>();

const REDUX_UPDATE_THROTTLE = 1000; // Update Redux every 1s to reduce lag
const SPEED_UPDATE_THROTTLE = 2000; // Update speed every 2s for smoother display
const MIN_BYTES_UPDATE = 5 * 1024 * 1024; // Only update every 5MB to reduce updates

export const downloadModel = createAsyncThunk(
    'hfModelDownload/downloadModel',
    async (model: HuggingfaceModel, { dispatch, rejectWithValue }) => {
        const downloadId = model.id;
        
        // Initialize tracker for this download
        if (!downloadTrackers.has(downloadId)) {
            downloadTrackers.set(downloadId, {
                lastProgressUpdate: null,
                lastReduxUpdate: null,
                lastSpeedUpdate: null,
            });
        }
        
        const tracker = downloadTrackers.get(downloadId)!;

        try {
            // Reset progress tracking
            tracker.lastProgressUpdate = null;
            tracker.lastReduxUpdate = null;
            tracker.lastSpeedUpdate = null;

            // Require downloadUrl from model - only download supported models
            const downloadUrl = (model as any).downloadUrl;
            
            if (!downloadUrl) {
                throw new Error('Download URL is required. Please select a supported model.');
            }
            
            const result = await downloadModelAPI(model.id, model.modelId, (progress: DownloadProgress) => {
                const currentTime = Date.now();
                const currentBytes = progress.bytesWritten;
                
                // Throttled speed calculation (every 1 second)
                if (tracker.lastSpeedUpdate) {
                    const timeDiff = (currentTime - tracker.lastSpeedUpdate.time) / 1000;
                    
                    if (timeDiff >= SPEED_UPDATE_THROTTLE / 1000) {
                        const bytesDiff = currentBytes - tracker.lastSpeedUpdate.bytes;
                        
                        if (bytesDiff > 0) {
                            const speed = bytesDiff / timeDiff; // bytes per second
                            
                            // Dispatch speed update
                            dispatch(updateDownloadSpeed(speed));
                            
                            // Calculate time remaining
                            const remainingBytes = progress.contentLength - currentBytes;
                            if (speed > 0 && remainingBytes > 0) {
                                const timeRemaining = remainingBytes / speed;
                                dispatch(updateTimeRemaining(timeRemaining));
                            }
                        }
                        
                        tracker.lastSpeedUpdate = {
                            bytes: currentBytes,
                            time: currentTime,
                        };
                    }
                } else {
                    // First speed update - initialize
                    tracker.lastSpeedUpdate = {
                        bytes: currentBytes,
                        time: currentTime,
                    };
                }
                
                // Update progress tracking
                tracker.lastProgressUpdate = {
                    bytes: currentBytes,
                    time: currentTime,
                };

                // Throttled Redux progress updates (every 1s or 5MB) - optimized to reduce lag
                const shouldUpdateRedux = !tracker.lastReduxUpdate || 
                    (currentTime - tracker.lastReduxUpdate.time >= REDUX_UPDATE_THROTTLE) ||
                    (currentBytes - tracker.lastReduxUpdate.bytes >= MIN_BYTES_UPDATE);

                if (shouldUpdateRedux) {
                    // Dispatch update - throttling already reduces frequency
                    dispatch(updateProgress({
                        downloadedSize: progress.bytesWritten,
                        totalSize: progress.contentLength,
                    }));
                    tracker.lastReduxUpdate = {
                        bytes: currentBytes,
                        time: currentTime,
                    };
                }
            }, downloadUrl);

            // Clean up tracker on completion
            downloadTrackers.delete(downloadId);

            return { model, result };
        } catch (error) {
            // Clean up tracker on error
            downloadTrackers.delete(downloadId);
            
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to download model'
            );
        }
    }
);

export const hfModelDownloadSlice = createSlice({
    name: 'hfModelDownload',
    initialState,
    reducers: {
        updateProgress: (state, action: PayloadAction<{ downloadedSize: number; totalSize: number }>) => {
            state.downloadedSize = action.payload.downloadedSize;
            state.totalSize = action.payload.totalSize;
            
            // Calculate percentage, handle division by zero
            if (action.payload.totalSize > 0) {
                state.progress = Math.min(
                    100,
                    Math.round((action.payload.downloadedSize / action.payload.totalSize) * 100)
                );
            }
        },
        updateDownloadSpeed: (state, action: PayloadAction<number>) => {
            state.downloadSpeed = action.payload;
        },
        updateTimeRemaining: (state, action: PayloadAction<number>) => {
            state.timeRemaining = Math.max(0, Math.round(action.payload));
        },
        resetDownload: (state) => {
            state.isDownloading = false;
            state.progress = 0;
            state.downloadedSize = 0;
            state.totalSize = 0;
            state.currentModel = null;
            state.error = null;
            state.downloadSpeed = 0;
            state.timeRemaining = 0;
        },
        cancelDownload: (state) => {
            state.isDownloading = false;
            state.error = 'Download cancelled';
            // Note: Actual cancellation of RNFS download would need to be handled separately
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(downloadModel.pending, (state, action) => {
                state.isDownloading = true;
                state.progress = 0;
                state.downloadedSize = 0;
                state.totalSize = 0;
                state.currentModel = action.meta.arg;
                state.error = null;
                state.downloadSpeed = 0;
                state.timeRemaining = 0;
            })
            .addCase(downloadModel.fulfilled, (state) => {
                state.isDownloading = false;
                state.progress = 100;
                state.error = null;
                // Keep currentModel for reference, can be cleared with resetDownload
            })
            .addCase(downloadModel.rejected, (state, action) => {
                state.isDownloading = false;
                state.error = action.payload as string;
                state.downloadSpeed = 0;
                state.timeRemaining = 0;
            });
    },
});

export const { updateProgress, updateDownloadSpeed, updateTimeRemaining, resetDownload, cancelDownload } = 
    hfModelDownloadSlice.actions;

export default hfModelDownloadSlice.reducer;