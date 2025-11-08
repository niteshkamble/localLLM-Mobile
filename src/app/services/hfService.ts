import { HuggingfaceModel } from "../../utils/types";
import RNFS from 'react-native-fs';

export const getModelsFromHuggingfaceAPI = async (): Promise<HuggingfaceModel[]> => {
    try {
        const response = await fetch('https://huggingface.co/api/models');
        console.log('Huggingface API response:', response);
        const data = await response.json();
        console.log('Huggingface API data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching models from Huggingface API:', error);
        throw error;
    }
}

// export const downloadModelAPI = async (id: string, modelId: string): Promise<Response> => {
//     try {
//         const response = await fetch(`https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`);
//         return response;
//     } catch (error) {
//         throw error;
//     }
// }

export interface DownloadProgress {
    bytesWritten: number;
    contentLength: number;
    jobId: number;
}

export interface DownloadResult {
    jobId: number;
    statusCode: number;
    bytesWritten: number;
}

/**
 * Extracts model information from a Hugging Face URL
 */
export const extractModelInfoFromUrl = (url: string): { modelId: string; fileName: string } => {
    try {
        // Parse URL: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
        const urlParts = url.split('/');
        const resolveIndex = urlParts.findIndex(part => part === 'resolve');
        
        if (resolveIndex === -1 || resolveIndex < 3) {
            throw new Error('Invalid Hugging Face URL format');
        }
        
        // Extract modelId (e.g., "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF")
        const modelId = urlParts.slice(3, resolveIndex).join('/');
        
        // Extract fileName (e.g., "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
        const fileName = urlParts[urlParts.length - 1];
        
        return { modelId, fileName };
    } catch (error) {
        throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const downloadModel = async (
    id: string,
    modelId: string,
    onProgress?: (progress: DownloadProgress) => void,
    downloadUrl?: string // Optional direct URL
): Promise<DownloadResult> => {
    let downloadJob: any = null;
    let filePath: string = '';

    try {
        let finalUrl: string;
        let fileName: string;
        
        if (downloadUrl) {
            // Extract info from provided URL
            const modelInfo = extractModelInfoFromUrl(downloadUrl);
            finalUrl = downloadUrl;
            fileName = modelInfo.fileName;
        } else {
            // Use default URL for now
            finalUrl = 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';
            const modelInfo = extractModelInfoFromUrl(finalUrl);
            fileName = modelInfo.fileName;
        }
        
        // Create safe filename
        const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        filePath = `${RNFS.DocumentDirectoryPath}/${safeFileName}`;

        // Check if file already exists
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
            const fileInfo = await RNFS.stat(filePath);
            // If file exists and is complete, return success
            if (fileInfo.size > 0) {
                throw new Error('File already exists. Delete it first to re-download.');
            }
            // If file exists but is empty/corrupted, delete it
            await RNFS.unlink(filePath);
        }

        // Download file with progress tracking
        downloadJob = RNFS.downloadFile({
            fromUrl: finalUrl,
            toFile: filePath,
            background: true, // Allow download to continue in background
            discretionary: false, // Don't defer download
            cacheable: false, // Don't cache
            progress: (res: DownloadProgress) => {
                // Call progress callback - throttling is handled in Redux slice
                if (onProgress) {
                    onProgress(res);
                }
            },
        });

        // Wait for download to complete
        const result = await downloadJob.promise;

        // Check if download was successful
        if (result.statusCode !== 200) {
            // Clean up partial file on error
            await cleanupPartialFile(filePath);
            throw new Error(`Download failed with status code: ${result.statusCode}`);
        }

        // Verify file was downloaded completely
        const fileInfo = await RNFS.stat(filePath);
        if (fileInfo.size === 0) {
            await cleanupPartialFile(filePath);
            throw new Error('Downloaded file is empty');
        }

        return {
            jobId: result.jobId,
            statusCode: result.statusCode,
            bytesWritten: result.bytesWritten,
        };
    } catch (error) {
        // Clean up on any error
        if (filePath) {
            await cleanupPartialFile(filePath).catch(() => {
                // Ignore cleanup errors
            });
        }

        // Enhanced error handling
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unknown error occurred during download');
    }
};

// Helper function to clean up partial downloads
const cleanupPartialFile = async (filePath: string): Promise<void> => {
    try {
        if (await RNFS.exists(filePath)) {
            await RNFS.unlink(filePath);
        }
    } catch (cleanupError) {
        console.error('Error cleaning up failed download:', cleanupError);
        // Don't throw - cleanup errors shouldn't mask the original error
    }
};