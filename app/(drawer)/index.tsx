import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { router } from 'expo-router';
import * as SQLite from "expo-sqlite";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChatMessageBubble } from '@/components/Chat/ChatMessageBubble';
import { EmptyChat } from '@/components/Chat/EmptyChat';
import { ChatMessage } from '@/constants/Type';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { getLocalPathFromUri } from '../services/FileSys';
import { useAppStore } from '../store/useAppStore';
import { useChatStore } from '../store/useChatStore';


export default function ChatScreen() {
  const db = SQLite.openDatabaseSync("models.db");
  useDrizzleStudio(db);
  const [inputText, setInputText] = useState('');

  // App Store (model and llama context)
  const selectedModel = useAppStore((state) => state.selectedModel);
  const llamaContext = useAppStore((state) => state.llamaContext);
  const initLlamaContext = useAppStore((state) => state.initLlamaContext);
  const progress = useAppStore((state) => state.initProgress);
  const releaseLlamaContext = useAppStore((state) => state.releaseLlamaContext);

  // Chat Store (messages and isGenerating)
  const messages = useChatStore((state) => state.messages);
  const isGenerating = useChatStore((state) => state.isGenerating);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const setIsGenerating = useChatStore((state) => state.setIsGenerating);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    useAppStore.getState().getSelectedModel();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };
    // Add user message to chat store
    addMessage(userMessage);
    setInputText('');
    // keyboard should be closed
    Keyboard.dismiss();
    setIsGenerating(true);

    try {
      const modelPath = getLocalPathFromUri(selectedModel?.filePath || '');
      let context = llamaContext;

      if (!context) {
        console.log('Initializing Llama context...');
        context = await initLlamaContext(modelPath);
      }

      if (!context) {
        throw new Error('Failed to initialize Llama context');
      }

      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      addMessage(assistantMessage);

      // Building prompt with conversation history (chat history)
      const conversationHistory = messages
        .slice(-10) // keeping last 10 messages for context (chat history)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Llama'}: ${msg.content}`)
        .join('\n\n');

      const prompt = conversationHistory
        ? `This is a conversation between User and Llama, a friendly chatbot. Llama responds concisely in one message.

${conversationHistory}

User: ${userMessage.content}
Llama:`
        : `This is a conversation between User and Llama, a friendly chatbot. Llama responds concisely in one message.

User: ${userMessage.content}
Llama:`;

      // Stream the response
      let streamedText = '';
      const response = await context.completion({
        prompt,
        n_predict: 150,  // Reduced to prevent long hallucinations
        stop: [
          '\nUser:', '\nuser:', '\nUSER:',  // Stop on newline + User:
          '\n\nUser:', '\n\nuser:',          // Stop on double newline + User:
          'User:', 'user:',                   // Stop on User: without newline
          '\nLlama:', '\nllama:',            // Also stop if it tries to continue as Llama
          '<|endoftext|>',                    // End of text token
          '<|im_end|>',                       // Instruction end token
        ],
    }, (token) => {
        // This callback receives each token 
        streamedText += token.token;
        
        // Check if we accidentally generated conversation patterns
        const hasUserPattern = /\n+(User|user):/i.test(streamedText);
        const hasLlamaPattern = /\n+(Llama|llama):/i.test(streamedText);
        
        if (hasUserPattern || hasLlamaPattern) {
          // Stop updating if we detect conversation leak
          const cleanText = streamedText.split(/\n+(User|user|Llama|llama):/i)[0].trim();
          updateMessage(assistantMessageId, cleanText);
        } else {
          updateMessage(assistantMessageId, streamedText);
        }
      });

      // Clean up the response - remove any leaked conversation patterns
      let finalResponse = response.text.trim();
      
      // Remove any text after "User:" or "Llama:" appears (in case stop didn't work)
      const userIndex = finalResponse.search(/\n+(User|user|USER):/i);
      if (userIndex !== -1) {
        finalResponse = finalResponse.substring(0, userIndex).trim();
      }
      
      const llamaIndex = finalResponse.search(/\n+(Llama|llama|LLAMA):/i);
      if (llamaIndex !== -1) {
        finalResponse = finalResponse.substring(0, llamaIndex).trim();
      }
      
      // Updating with final response and metadata
      const speed = response.timings.predicted_per_second;
      const tokenCount = response.tokens_predicted;
      
      updateMessage(assistantMessageId, finalResponse, {
        speed,
        tokenCount,
        model: selectedModel?.fileName,
      });

      console.log('Final response:', finalResponse);
      console.log('Tokens predicted:', tokenCount);
      console.log('Speed:', speed.toFixed(2), 'tokens/sec');
    } catch (error) {
      console.error('Error generating response:', error);
      // Add error message to chat store
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error generating a response.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, isGenerating, messages, selectedModel?.filePath, llamaContext, initLlamaContext, addMessage, updateMessage, setIsGenerating]);

  const handleSend = useCallback(() => {
    sendMessage();
  }, [sendMessage]);

  const handleRefresh = useCallback(() => {
    router.push('/modal');
  }, []);

  const isInputEmpty = useMemo(() => inputText.trim() === '', [inputText]);
  const isSendDisabled = useMemo(() => isInputEmpty || isGenerating, [isInputEmpty, isGenerating]);


  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    return <ChatMessageBubble message={item} />;
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >

      <FlatList<ChatMessage>
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.messagesList}
        inverted={false}
        ListEmptyComponent={EmptyChat}
      />

      <View >
        <Text style={styles.modelname}>
          Model: {selectedModel?.fileName || 'No model selected. Please select a model by clicking the refresh button.'}
        </Text>
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <FontAwesome name="refresh" size={20} color="grey" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, isSendDisabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isSendDisabled}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#222" />
            ) : (
            <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  modelname: {
    fontSize: 12,
    color: 'grey',
    alignSelf: 'center',
    marginHorizontal: 12,
  },
  refreshButton: {
    marginRight: 8,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
