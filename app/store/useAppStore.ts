import { DownloadedModel } from '@/constants/Type';
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
}

export const useAppStore = create<AppStoreState>((set) => ({
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
}));