import { ChatMessage } from '@/constants/Type';
import { create } from 'zustand';


interface ChatStoreState {
    messages: ChatMessage[];
    isGenerating: boolean;

    // Actions
    addMessage: (message: ChatMessage) => void;
    updateMessage: (id: string, content: string, metadata?: ChatMessage['metadata']) => void;
    clearMessages: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
    messages: [],
    isGenerating: false,

    addMessage: (message: ChatMessage) =>
        set((state: ChatStoreState) => ({
            messages: [...state.messages, message]
        })),

    clearMessages: () =>
        set({ messages: [] }),

    setIsGenerating: (isGenerating: boolean) =>
        set({ isGenerating: isGenerating }),

    updateMessage: (id: string, content: string, metadata?: ChatMessage['metadata']) =>
        set((state: ChatStoreState) => ({
            messages: state.messages.map((msg) => 
                msg.id === id ? { ...msg, content, ...(metadata && { metadata }) } : msg
            )
        })),
}))