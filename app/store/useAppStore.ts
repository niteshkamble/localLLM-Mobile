import { DownloadedModel } from '@/constants/Type';
import { LlamaContext, initLlama } from 'llama.rn';
import { create } from 'zustand';
import { getSelectedModel, setSelectedModel } from '../services/database';

interface AppStoreState {
    isAppLoading: boolean;
    appError: string | null;
    setIsAppLoading: (isAppLoading: boolean) => void;
    setAppError: (appError: string | null) => void;

    selectedModel: DownloadedModel | null;
    getSelectedModel: () => Promise<void>;
    setSelectedModel: (modelId: string) => Promise<void>;

    llamaContext: LlamaContext | null;
    initLlamaContext: (modelPath: string) => Promise<LlamaContext>;
    initProgress: number;
    releaseLlamaContext: () => Promise<void>;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
    isAppLoading: false,
    appError: null,
    selectedModel: null,
    setIsAppLoading: (isAppLoading: boolean) => set({ isAppLoading }),
    setAppError: (appError: string | null) => set({ appError }),

    setSelectedModel: async (modelId: string) => {
        set({ isAppLoading: true, appError: null });
        try {
            await setSelectedModel(modelId);
            const selectedModel = await getSelectedModel();
            set({ selectedModel });
        } catch (error) {
            set({ appError: error instanceof Error ? error.message : 'Failed to set selected model.' });
        } finally {
            set({ isAppLoading: false });
        }
    },

    getSelectedModel: async () => {
        set({ isAppLoading: true, appError: null });
        try {
            const selectedModel = await getSelectedModel();
            set({ selectedModel });
        } catch (error) {
            set({ appError: error instanceof Error ? error.message : 'Failed to get selected model.' });
        } finally {
            set({ isAppLoading: false });
        }
    },


    llamaContext: null,
    initProgress: 0,
    initLlamaContext: async (modelPath: string): Promise<LlamaContext> => {
        // Check if context already exists
        const existingContext = get().llamaContext;
        if (existingContext) {
            console.log('Llama context already initialized, returning existing context');
            return existingContext;
        }

        // Create new context if it doesn't exist
        set({ isAppLoading: true, appError: null, initProgress: 0 });
        try {
            console.log('Initializing new Llama context with model:', modelPath);
            const context = await initLlama({
                model: modelPath
            }, (progress) => {
                set({ initProgress: progress });
                console.log('Llama initialization progress:', progress);
            });
            
            set({ llamaContext: context, initProgress: 100 });
            console.log('Llama context initialized successfully');
            return context;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Llama context';
            console.error('Error initializing Llama context:', errorMessage);
            set({ appError: errorMessage, llamaContext: null, initProgress: 0 });
            throw error;
        } finally {
            set({ isAppLoading: false });
        }
    },

    releaseLlamaContext: async (): Promise<void> => {
        const context = get().llamaContext;
        if (context) {
            try {
                console.log('Releasing Llama context');
                await context.release();
                set({ llamaContext: null, initProgress: 0 });
                console.log('Llama context released successfully');
            } catch (error) {
                console.error('Error releasing Llama context:', error);
                throw error;
            }
        }
    },

}));