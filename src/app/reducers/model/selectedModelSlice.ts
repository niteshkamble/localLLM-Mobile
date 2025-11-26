import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectedModel {
    fileName: string;
    filePath: string;
    size: number;
    modelFormat?: string;
    modelId?: string; // Optional: Hugging Face model ID
}

export interface Chat {
    id: string;
    title: string;
    modelId: string; // Model file path or ID used for this chat
    createdAt: string;
    updatedAt: string;
    messageCount?: number;
}

export interface SelectedModelState {
    selectedModel: SelectedModel | null;
    chats: Chat[];
    currentChatId: string | null;
}

const initialState: SelectedModelState = {
    selectedModel: null,
    chats: [],
    currentChatId: null,
};

export const selectedModelSlice = createSlice({
    name: 'selectedModel',
    initialState,
    reducers: {
        setSelectedModel: (state, action: PayloadAction<SelectedModel>) => {
            state.selectedModel = action.payload;
        },
        clearSelectedModel: (state) => {
            state.selectedModel = null;
        },
        addChat: (state, action: PayloadAction<Chat>) => {
            state.chats.push(action.payload);
            state.currentChatId = action.payload.id;
        },
        updateChat: (state, action: PayloadAction<{ id: string; updates: Partial<Chat> }>) => {
            const chat = state.chats.find(c => c.id === action.payload.id);
            if (chat) {
                Object.assign(chat, action.payload.updates);
                chat.updatedAt = new Date().toISOString();
            }
        },
        deleteChat: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter(c => c.id !== action.payload);
            if (state.currentChatId === action.payload) {
                state.currentChatId = state.chats.length > 0 ? state.chats[0].id : null;
            }
        },
        setCurrentChat: (state, action: PayloadAction<string | null>) => {
            state.currentChatId = action.payload;
        },
        clearAllChats: (state) => {
            state.chats = [];
            state.currentChatId = null;
        },
    },
});

export const {
    setSelectedModel,
    clearSelectedModel,
    addChat,
    updateChat,
    deleteChat,
    setCurrentChat,
    clearAllChats,
} = selectedModelSlice.actions;

export default selectedModelSlice.reducer;

