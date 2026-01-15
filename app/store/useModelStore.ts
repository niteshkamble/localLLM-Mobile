import { HF_MODEL_FORMATS } from '@/constants/Static';
import { DownloadedModel, HuggingfaceModelAPIResponse } from '@/constants/Type';
import { File } from 'expo-file-system';
import { create } from 'zustand';
import { addDownloadedModel, getAllDownloadedModels } from '../services/database';
import { downloadHFModel as downloadHFModelAPI, fetchAvailableGGUFsModels } from '../services/hfAPI';

interface ModelStoreState {
    isLocalModelLoading: boolean;
    localModels: DownloadedModel[];
    localError: string | null;
    getLocalModels: () => Promise<void>;

    isHFModelLoading: boolean;
    hfModelsData: HuggingfaceModelAPIResponse | null;
    hfError: string | null;
    getHFModels: () => Promise<void>;

    isHFModelDownloading: boolean;
    hfModelDownloadFileName: string | null;
    hfModelDownloadError: string | null;
    hfModelDownloadProgress: number;
    downloadAbortController: AbortController | null;
    downloadHFModel: (repoPath: string, ggufFileName: string) => Promise<void>;
    cancelDownload: () => void;
}

export const useModelStore = create<ModelStoreState>((set) => ({
    //local tracking
    isLocalModelLoading: false,
    localModels: [] as DownloadedModel[],
    localError: null,
    getLocalModels: async () => {
        set({ isLocalModelLoading: true, localError: null });
        try {
            const models = await getAllDownloadedModels();
            set({ localModels: models });
        } catch (error) {
            set({ localError: error instanceof Error ? error.message : 'Failed to load local models.' });
        } finally {
            set({ isLocalModelLoading: false });
        }
    },

    //HF tracking
    isHFModelLoading: false,
    hfModelsData: null as HuggingfaceModelAPIResponse | null,
    hfError: null,
    getHFModels: async () => {
        set({ isHFModelLoading: true, hfError: null });
        try {
            const data = await fetchAvailableGGUFsModels(HF_MODEL_FORMATS.LLAMA_3_2_1B_INSTRUCT);
            set({ hfModelsData: data ? data : null });
        } catch (error) {
            set({ hfError: error instanceof Error ? error.message : 'Failed to load Hugging Face models.' });
        } finally {
            set({ isHFModelLoading: false });
        }
    },

    //HF model downloading tracking
    isHFModelDownloading: false,
    hfModelDownloadFileName: null as string | null,
    hfModelDownloadError: null as string | null,
    hfModelDownloadProgress: 0,
    downloadAbortController: null as AbortController | null,
    downloadHFModel: async (repoPath: string, ggufFileName: string) => {
        // Create AbortController for this download
        const abortController = new AbortController();
        
        set({ 
            isHFModelDownloading: true, 
            hfModelDownloadError: null as string | null, 
            hfModelDownloadProgress: 0,
            hfModelDownloadFileName: ggufFileName,
            downloadAbortController: abortController
        });
        
        try {
            // Download with progress callback and abort signal
            const filePath = await downloadHFModelAPI(
                repoPath, 
                ggufFileName,
                (progress) => {
                    set({ hfModelDownloadProgress: progress });
                },
                abortController.signal
            );
            
            // Check if download was aborted
            if (abortController.signal.aborted) {
                return;
            }
            
            // Get file info to get size using new API
            const downloadedFile = new File(filePath);
            const fileInfo = await downloadedFile.info();
            if (!fileInfo.exists || fileInfo.size === undefined || fileInfo.size === null) {
                throw new Error('Downloaded file info not available');
            }
            
            // Create model ID from repo path and filename
            const modelId = `${repoPath}/${ggufFileName}`;
            
            // Add to database
            await addDownloadedModel({
                modelId: modelId,
                fileName: ggufFileName,
                filePath: filePath,
                size: fileInfo.size || 0,
                format: 'gguf',
                downloadedAt: new Date().toISOString(),
                status: 'completed'
            });
            
            // Refresh local models list
            const models = await getAllDownloadedModels();
            set({ localModels: models });
            
            // Reset progress on success
            set({ hfModelDownloadProgress: 100 });
        } catch (error) {
            // Don't set error if download was aborted
            if (abortController.signal.aborted) {
                set({ 
                    isHFModelDownloading: false,
                    hfModelDownloadProgress: 0,
                    downloadAbortController: null
                });
                return;
            }
            
            const errorMessage = error instanceof Error ? error.message : 'Failed to download Hugging Face model.';
            set({ hfModelDownloadError: errorMessage });
            set({ hfModelDownloadProgress: 0 });
            throw error;
        } finally {
            // Only reset if not aborted (aborted case is handled above)
            if (!abortController.signal.aborted) {
                set({ 
                    isHFModelDownloading: false,
                    downloadAbortController: null
                });
            }
        }
    },
    cancelDownload: () => {
        set((state) => {
            if (state.downloadAbortController) {
                state.downloadAbortController.abort();
                return {
                    isHFModelDownloading: false,
                    hfModelDownloadProgress: 0,
                    downloadAbortController: null,
                    hfModelDownloadError: 'Download cancelled by user'
                };
            }
            return state;
        });
    },
}));