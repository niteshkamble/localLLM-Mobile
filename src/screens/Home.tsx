import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
    Text, 
    View, 
    StyleSheet, 
    ActivityIndicator, 
    Alert, 
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store/store';
import { 
    addMessage, 
    setUserInput, 
    clearUserInput, 
    setIsGenerating,
    clearConversation,
    setGenerationProgress,
    setTokensGenerated,
    setEstimatedTotalTokens,
    resetGenerationProgress,
    updateLastMessage,
    ChatMessage,
} from '../app/reducers/chat/chatSlice';
import RNFS from 'react-native-fs';
import { initLlama, releaseAllLlama } from 'llama.rn';

const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    const selectedModel = useSelector((state: RootState) => state.selectedModel.selectedModel);
    const { 
        conversation, 
        userInput, 
        isGenerating, 
        currentPage, 
        isDownloading,
        generationProgress,
        tokensGenerated,
        estimatedTotalTokens,
    } = useSelector((state: RootState) => state.chat);
    const [context, setContext] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Load model when selectedModel changes
    useEffect(() => {
        let isMounted = true;

        const loadModel = async (modelPath: string) => {
            try {
                setIsLoading(true);

                // Ensure the model file exists before attempting to load it
                const fileExists = await RNFS.exists(modelPath);
                if (!fileExists) {
                    if (isMounted) {
                        Alert.alert('Error Loading Model', 'The model file does not exist.');
                        setIsLoading(false);
                    }
                    return false;
                }

                // Release any existing model context first
                setContext((prevContext: any) => {
                    if (prevContext) {
                        releaseAllLlama().catch(console.error);
                    }
                    return null;
                });
                dispatch(clearConversation());

                // Initialize the llama model
                const llamaContext = await initLlama({
                    model: modelPath,
                    use_mlock: true,
                    n_ctx: 2048,
                    n_gpu_layers: 1,
                });

                if (isMounted) {
                    console.log('llamaContext', llamaContext);
                    setContext(llamaContext);
                    setIsModelLoaded(true);
                    setIsLoading(false);
                    Alert.alert('Success', 'Model loaded successfully!');
                }
                return true;
            } catch (error) {
                console.error('Error loading model:', error);
                if (isMounted) {
                    Alert.alert(
                        'Error Loading Model',
                        error instanceof Error ? error.message : 'An unknown error occurred.'
                    );
                    setIsLoading(false);
                    setIsModelLoaded(false);
                }
                return false;
            }
        };

        if (selectedModel?.filePath) {
            console.log('Loading model from path:', selectedModel.filePath);
            loadModel(selectedModel.filePath);
        } else {
            // Clear context if no model is selected
            setContext((prevContext: any) => {
                if (prevContext) {
                    releaseAllLlama().catch(console.error);
                }
                return null;
            });
            dispatch(clearConversation());
            setIsModelLoaded(false);
        }

        return () => {
            isMounted = false;
        };
    }, [selectedModel?.filePath, dispatch]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (context) {
                releaseAllLlama().catch(console.error);
            }
        };
    }, [context]);

    const handleUnloadModel = useCallback(async () => {
        try {
            setContext((prevContext: any) => {
                if (prevContext) {
                    releaseAllLlama().catch(console.error);
                }
                return null;
            });
            dispatch(clearConversation());
            setIsModelLoaded(false);
            Alert.alert('Success', 'Model unloaded successfully!');
        } catch (error) {
            console.error('Error unloading model:', error);
            Alert.alert(
                'Error Unloading Model',
                error instanceof Error ? error.message : 'An unknown error occurred.'
            );
        }
    }, [dispatch]);

    // Handle sending messages
    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim() || !context || isGenerating) {
            return;
        }

        const userMessage: ChatMessage = {
            role: 'user',
            content: userInput.trim(),
        };

        // Add user message to conversation
        dispatch(addMessage(userMessage));
        dispatch(clearUserInput());
        dispatch(setIsGenerating(true));
        dispatch(resetGenerationProgress());
        dispatch(setEstimatedTotalTokens(512)); // Set max tokens

        // Create a placeholder assistant message that we'll update
        const placeholderMessage: ChatMessage = {
            role: 'assistant',
            content: '',
        };
        dispatch(addMessage(placeholderMessage));

        let progressInterval: ReturnType<typeof setInterval> | null = null;

        try {
            // Build prompt from conversation history
            const prompt = conversation
                .slice(1) // Skip system message
                .concat(userMessage)
                .map((msg) => {
                    if (msg.role === 'user') {
                        return `User: ${msg.content}`;
                    } else if (msg.role === 'assistant') {
                        return `Assistant: ${msg.content}`;
                    }
                    return '';
                })
                .join('\n\n') + '\n\nAssistant:';

            let responseContent = '';

            // Start progress simulation
            let simulatedProgress = 0;
            progressInterval = setInterval(() => {
                simulatedProgress = Math.min(simulatedProgress + 2, 95); // Cap at 95% until done
                dispatch(setGenerationProgress(simulatedProgress));
            }, 300); // Update every 300ms

            // Generate response using llama.rn context
            if (context && typeof context.completion === 'function') {
                try {
                    const response = await context.completion({
                        prompt: prompt,
                        n_predict: 512,
                        temperature: 0.7,
                        top_p: 0.9,
                        top_k: 40,
                    });
                    responseContent = response?.content || response?.text || 'No response generated.';
                } catch (apiError) {
                    console.error('Completion API error:', apiError);
                    throw apiError;
                }
            } else if (context) {
                // Fallback message
                responseContent = 'Model loaded but completion API not available. Please check llama.rn documentation.';
            } else {
                responseContent = 'Model context not available.';
            }

            // Clear progress interval and set to 100%
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            dispatch(setGenerationProgress(100));

            // Update the assistant message with final content
            dispatch(updateLastMessage(responseContent));
        } catch (error) {
            console.error('Error generating response:', error);
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`,
            };
            dispatch(updateLastMessage(errorMessage.content));
        } finally {
            dispatch(setIsGenerating(false));
            dispatch(resetGenerationProgress());
        }
    }, [userInput, context, isGenerating, conversation, dispatch]);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        if (scrollViewRef.current && conversation.length > 1) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [conversation.length]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Home</Text>
                {selectedModel && (
                    <View style={styles.modelInfo}>
                        <Text style={styles.modelLabel}>Selected Model:</Text>
                        <Text style={styles.modelName} numberOfLines={1}>
                            {selectedModel.fileName}
                        </Text>
                        <Text style={styles.modelPath} numberOfLines={2}>
                            {selectedModel.filePath}
                        </Text>
                    </View>
                )}
            </View>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading model...</Text>
                </View>
            )}

            {!selectedModel && !isLoading && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No model selected. Please select a model from the download screen.
                    </Text>
                </View>
            )}

            {isModelLoaded && context && (
                <>
                    <View style={styles.modelLoadedContainer}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>✓ Model Loaded</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.unloadButton}
                            onPress={handleUnloadModel}
                        >
                            <Text style={styles.unloadButtonText}>Unload Model</Text>
                        </TouchableOpacity>
                    </View>

                    {currentPage === 'conversation' && !isDownloading && (
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.chatContainer}
                            contentContainerStyle={styles.chatContent}
                        >
                            <Text style={styles.greetingText}>
                                🦙 Welcome! The Llama is ready to chat. Ask away! 🎉
                            </Text>
                            {conversation.slice(1).map((msg, index) => (
                                <View key={index} style={styles.messageWrapper}>
                                    <View
                                        style={[
                                            styles.messageBubble,
                                            msg.role === 'user'
                                                ? styles.userBubble
                                                : styles.llamaBubble,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.messageText,
                                                msg.role === 'user' && styles.userMessageText,
                                            ]}
                                        >
                                            {msg.content}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            {isGenerating && (
                                <View style={styles.messageWrapper}>
                                    <View style={[styles.messageBubble, styles.llamaBubble]}>
                                        <View style={styles.progressContainer}>
                                            <View style={styles.progressBarContainer}>
                                                <View 
                                                    style={[
                                                        styles.progressBar, 
                                                        { width: `${generationProgress}%` }
                                                    ]} 
                                                />
                                            </View>
                                            <Text style={styles.progressText}>
                                                {generationProgress}% - Thinking...
                                            </Text>
                                            {tokensGenerated > 0 && estimatedTotalTokens > 0 && (
                                                <Text style={styles.tokenText}>
                                                    {tokensGenerated} / {estimatedTotalTokens} tokens
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    )}

                    {currentPage === 'conversation' && (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type your message..."
                                placeholderTextColor="#94A3B8"
                                value={userInput}
                                onChangeText={(text) => dispatch(setUserInput(text))}
                                multiline
                                editable={!isGenerating}
                            />
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!userInput.trim() || isGenerating) && styles.sendButtonDisabled
                                    ]}
                                    onPress={handleSendMessage}
                                    disabled={!userInput.trim() || isGenerating}
                                >
                                    <Text style={styles.buttonText}>
                                        {isGenerating ? 'Generating...' : 'Send'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    modelInfo: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    modelLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    modelName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    modelPath: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    modelLoadedContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statusBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    unloadButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    unloadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    chatContainer: {
        flex: 1,
        marginTop: 16,
        marginBottom: 16,
    },
    chatContent: {
        paddingBottom: 16,
    },
    greetingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
    },
    messageWrapper: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: '#007AFF',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    llamaBubble: {
        backgroundColor: '#E5E7EB',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: '#000',
        lineHeight: 20,
    },
    userMessageText: {
        color: '#fff',
    },
    inputContainer: {
        backgroundColor: '#fff',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        maxHeight: 100,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    progressContainer: {
        width: '100%',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    tokenText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});

export default Home;