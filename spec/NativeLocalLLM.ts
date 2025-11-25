import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Native module interface for MLC LLM integration
 * Handles model management, chat inference, and model operations
 */
export interface Spec extends TurboModule {
    // ============================================
    // Model Management Methods
    // ============================================
    
    /**
     * Install/download a model from Hugging Face or local path
     * @param modelId - Hugging Face model ID (e.g., "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF")
     * @param modelPath - Optional local path to model file (for already downloaded models)
     * @returns Promise that resolves when model is installed and ready
     */
    installModel(modelId: string, modelPath?: string): Promise<void>;
    
    /**
     * List all installed models
     * @returns Array of model IDs that are installed and ready to use
     */
    listInstalledModels(): Promise<string[]>;
    
    /**
     * Delete/remove an installed model
     * @param modelId - Model ID to remove
     */
    deleteModel(modelId: string): Promise<void>;
    
    /**
     * Get model information (size, format, etc.)
     * @param modelId - Model ID to query
     * @returns Model metadata as JSON string
     */
    getModelInfo(modelId: string): Promise<string>;
    
    /**
     * Check if a model is installed
     * @param modelId - Model ID to check
     * @returns true if model is installed and ready
     */
    isModelInstalled(modelId: string): Promise<boolean>;
    
    // ============================================
    // Model Loading & Inference Methods
    // ============================================
    
    /**
     * Load a model into memory for inference
     * @param modelId - Model ID to load
     * @returns Promise that resolves when model is loaded and ready for inference
     */
    loadModel(modelId: string): Promise<void>;
    
    /**
     * Unload the currently loaded model from memory
     * Frees up memory when switching models or when done with inference
     */
    unloadModel(): Promise<void>;
    
    /**
     * Get the currently loaded model ID
     * @returns Model ID of the currently loaded model, or null if none loaded
     */
    getLoadedModel(): Promise<string | null>;
    
    /**
     * Generate a response from the loaded model
     * @param prompt - User's input prompt
     * @param options - Optional generation parameters
     * @returns Generated text response
     */
    generateResponse(
        prompt: string,
        options?: GenerationOptions
    ): Promise<string>;
    
    /**
     * Generate a streaming response (for real-time chat experience)
     * @param prompt - User's input prompt
     * @param options - Optional generation parameters
     * @param onToken - Callback function called for each generated token
     * @returns Promise that resolves when generation is complete
     */
    generateResponseStream(
        prompt: string,
        options?: GenerationOptions,
        onToken?: (token: string) => void
    ): Promise<string>;
    
    // ============================================
    // Chat Management Methods
    // ============================================
    
    /**
     * Create a new chat session
     * @param modelId - Model ID to use for this chat
     * @param title - Optional chat title (auto-generated if not provided)
     * @returns Chat ID of the newly created chat
     */
    createChat(modelId: string, title?: string): Promise<string>;
    
    /**
     * Send a message in a chat and get response
     * @param chatId - Chat ID
     * @param message - User's message
     * @param options - Optional generation options
     * @returns Assistant's response
     */
    sendMessage(
        chatId: string,
        message: string,
        options?: GenerationOptions
    ): Promise<string>;
    
    /**
     * Send a message with streaming response
     * @param chatId - Chat ID
     * @param message - User's message
     * @param options - Optional generation options
     * @param onToken - Callback for each token
     * @returns Full assistant response
     */
    sendMessageStream(
        chatId: string,
        message: string,
        options?: GenerationOptions,
        onToken?: (token: string) => void
    ): Promise<string>;
    
    /**
     * Get all messages in a chat
     * @param chatId - Chat ID
     * @returns Array of messages (JSON string)
     */
    getChatMessages(chatId: string): Promise<string>;
    
    /**
     * Get chat history (list of all chats)
     * @returns Array of chat summaries (JSON string)
     */
    getChatHistory(): Promise<string>;
    
    /**
     * Update chat title
     * @param chatId - Chat ID
     * @param title - New title
     */
    updateChatTitle(chatId: string, title: string): Promise<void>;
    
    /**
     * Delete a chat and all its messages
     * @param chatId - Chat ID to delete
     */
    deleteChat(chatId: string): Promise<void>;
    
    /**
     * Clear all messages in a chat (keep the chat, just clear messages)
     * @param chatId - Chat ID
     */
    clearChat(chatId: string): Promise<void>;
}

/**
 * Generation options for model inference
 */
export interface GenerationOptions {
    /** Maximum number of tokens to generate */
    maxTokens?: number;
    /** Temperature for sampling (0.0 to 2.0, higher = more creative) */
    temperature?: number;
    /** Top-p (nucleus) sampling parameter */
    topP?: number;
    /** Top-k sampling parameter */
    topK?: number;
    /** Stop sequences (array of strings that stop generation) */
    stopSequences?: string[];
    /** System prompt/instruction */
    systemPrompt?: string;
    /** Enable streaming (for real-time token generation) */
    stream?: boolean;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

/**
 * Chat structure
 */
export interface Chat {
    id: string;
    title: string;
    modelId: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
}

/**
 * Model information structure
 */
export interface ModelInfo {
    modelId: string;
    size: number; // in bytes
    format: string; // e.g., "gguf", "safetensors"
    quantization: string; // e.g., "Q4_K_M"
    installed: boolean;
    installedAt?: string;
    path?: string;
}

// Export the module registry
export default TurboModuleRegistry.getEnforcing<Spec>('NativeLocalLLM');