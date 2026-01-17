import { HF_API_MODELS_URL, HF_MODEL_FORMATS, HF_TO_GGUF, MODELS_DIRECTORY } from "@/constants/Static";
import { GGUFFile, HuggingfaceModelAPIResponse } from "@/constants/Type";
import axios from "axios";
import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';

const fetchAvailableGGUFsModels = async (modelFormat: HF_MODEL_FORMATS): Promise<HuggingfaceModelAPIResponse | undefined> => {
    try {
        const repoPath = HF_TO_GGUF[modelFormat];
        if (!repoPath) {
            throw new Error(`No repository path found for model format: ${modelFormat}`);
        }

        const response = await axios.get(`${HF_API_MODELS_URL}/${repoPath}`);
        console.log('HF API response', response);


        if (!response.data?.siblings) {
            throw new Error('Invalid API response format');
        }

        //getting siblings from the response and filtering out the files that do not end with .gguf
        const siblings = response.data.siblings.filter((file: GGUFFile) =>
            file.rfilename.endsWith('.gguf'),
        );

        return {
            data: {
                ...response.data,
                siblings: siblings,
            },
            status: response.status,
            statusText: response.statusText,
        } as HuggingfaceModelAPIResponse;

    } catch (error) {
        console.error('Error fetching available GGUFs:', error);
        throw new Error('Failed to fetch available GGUFs models list');
    }
}

const downloadHFModel = async (
    repoPath: string,
    ggufFileName: string,
    onProgress?: (progress: number) => void,
    abortSignal?: AbortSignal
): Promise<string> => {
    try {
        const downloadUrl = `https://huggingface.co/${repoPath}/resolve/main/${ggufFileName}`;

        const modelsDirectory = new Directory(Paths.document, MODELS_DIRECTORY);

        if (!modelsDirectory.exists) {
            modelsDirectory.create({
                intermediates: true,
                idempotent: true
            });
        }

        const destinationFile = new File(modelsDirectory, ggufFileName);

        if (destinationFile.exists) {
            throw new Error('File already exists.');
        }

        // Check if already aborted
        if (abortSignal?.aborted) {
            throw new Error('Download aborted.');
        }

        // Use legacy FileSystem API's createDownloadResumable for proper progress tracking
        const fileUri = destinationFile.uri;
        
        const downloadResumable = FileSystemLegacy.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            (downloadProgress) => {
                if (abortSignal?.aborted) {
                    return;
                }
                
                const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
                
                if (totalBytesExpectedToWrite > 0) {
                    const progress = Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100);
                    if (onProgress) {
                        onProgress(progress);
                    }
                } else if (onProgress) {
                    // Indeterminate progress - show based on bytes written
                    const estimatedProgress = Math.min(Math.round(totalBytesWritten / 10000000 * 50), 50);
                    onProgress(estimatedProgress);
                }
            }
        );

        // Check if aborted before starting download
        if (abortSignal?.aborted) {
            throw new Error('Download aborted.');
        }

        // Start download
        const result = await downloadResumable.downloadAsync();

        // Check if aborted after download
        if (abortSignal?.aborted) {
            // Clean up partial file
            if (destinationFile.exists) {
                try {
                    destinationFile.delete();
                } catch (e) {
                    console.error('Error deleting partial file:', e);
                }
            }
            throw new Error('Download aborted.');
        }

        if (!result) {
            throw new Error('Download failed - no result returned.');
        }

        // Verify file was downloaded
        if (!destinationFile.exists) {
            throw new Error('Downloaded file not found.');
        }

        // Final progress update
        if (onProgress) {
            onProgress(100);
        }

        return destinationFile.uri;
    } catch (error) {
        console.error('Error downloading HF model:', error);
        throw error instanceof Error ? error : new Error('Failed to download model.');
    }
}

export { downloadHFModel, fetchAvailableGGUFsModels };

