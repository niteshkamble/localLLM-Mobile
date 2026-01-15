import { create } from 'zustand';

interface ModelStoreState {
    isLoading: boolean;
    areModelDownloaded: boolean;
    error: string | null;
    setIsLoading: (isLoading: boolean) => void;
    setAreModelDownloaded: (areModelDownloaded: boolean) => void;
    setError: (error: string | null) => void;
}

export const useModelStore = create<ModelStoreState>((set) => ({
    isLoading: false,
    areModelDownloaded: false,
    error: null,
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setAreModelDownloaded: (areModelDownloaded: boolean) => set({ areModelDownloaded }),
    setError: (error: string | null) => set({ error }),
}));