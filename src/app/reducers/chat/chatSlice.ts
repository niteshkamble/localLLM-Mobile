import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
}

export interface ChatState {
    conversation: ChatMessage[];
    userInput: string;
    isGenerating: boolean;
    currentPage: 'conversation' | 'settings';
    isDownloading: boolean;
    generationProgress: number; // 0-100
    tokensGenerated: number;
    estimatedTotalTokens: number;
}

const initialState: ChatState = {
    conversation: [
        {
            role: 'system',
            content: 'You are a helpful assistant.',
            timestamp: new Date().toISOString(),
        },
    ],
    userInput: '',
    isGenerating: false,
    currentPage: 'conversation',
    isDownloading: false,
    generationProgress: 0,
    tokensGenerated: 0,
    estimatedTotalTokens: 0,
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.conversation.push({
                ...action.payload,
                timestamp: action.payload.timestamp || new Date().toISOString(),
            });
        },
        setUserInput: (state, action: PayloadAction<string>) => {
            state.userInput = action.payload;
        },
        clearUserInput: (state) => {
            state.userInput = '';
        },
        setIsGenerating: (state, action: PayloadAction<boolean>) => {
            state.isGenerating = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<'conversation' | 'settings'>) => {
            state.currentPage = action.payload;
        },
        clearConversation: (state) => {
            state.conversation = [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.',
                    timestamp: new Date().toISOString(),
                },
            ];
        },
        setDownloading: (state, action: PayloadAction<boolean>) => {
            state.isDownloading = action.payload;
        },
        setGenerationProgress: (state, action: PayloadAction<number>) => {
            state.generationProgress = Math.min(100, Math.max(0, action.payload));
        },
        setTokensGenerated: (state, action: PayloadAction<number>) => {
            state.tokensGenerated = action.payload;
            // Calculate progress if we have estimated total
            if (state.estimatedTotalTokens > 0) {
                state.generationProgress = Math.min(
                    100,
                    Math.round((state.tokensGenerated / state.estimatedTotalTokens) * 100)
                );
            }
        },
        setEstimatedTotalTokens: (state, action: PayloadAction<number>) => {
            state.estimatedTotalTokens = action.payload;
            // Recalculate progress
            if (state.tokensGenerated > 0 && action.payload > 0) {
                state.generationProgress = Math.min(
                    100,
                    Math.round((state.tokensGenerated / action.payload) * 100)
                );
            }
        },
        resetGenerationProgress: (state) => {
            state.generationProgress = 0;
            state.tokensGenerated = 0;
            state.estimatedTotalTokens = 0;
        },
        updateLastMessage: (state, action: PayloadAction<string>) => {
            // Update the last message in conversation (should be assistant message)
            const lastIndex = state.conversation.length - 1;
            if (lastIndex >= 0 && state.conversation[lastIndex].role === 'assistant') {
                state.conversation[lastIndex].content = action.payload;
            }
        },
    },
});

export const {
    addMessage,
    setUserInput,
    clearUserInput,
    setIsGenerating,
    setCurrentPage,
    clearConversation,
    setDownloading,
    setGenerationProgress,
    setTokensGenerated,
    setEstimatedTotalTokens,
    resetGenerationProgress,
    updateLastMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

