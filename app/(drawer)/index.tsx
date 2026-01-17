import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import type { MessageType } from '@flyerhq/react-native-chat-ui';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { router } from 'expo-router';
import * as SQLite from "expo-sqlite";
import { useEffect, useRef, useState } from 'react';

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { getLocalPathFromUri } from '../services/FileSys';
import { useAppStore } from '../store/useAppStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const db = SQLite.openDatabaseSync("models.db");
  useDrizzleStudio(db);
  const [inputText, setInputText] = useState('');
  const selectedModel = useAppStore((state) => state.selectedModel);
  console.log('selectedModel', selectedModel);
  const llamaContext = useAppStore((state) => state.llamaContext);
  const initLlamaContext = useAppStore((state) => state.initLlamaContext);
  const progress = useAppStore((state) => state.initProgress);
  const releaseLlamaContext = useAppStore((state) => state.releaseLlamaContext);
  const messagesRef = useRef<MessageType.Any[]>([])


  useEffect(() => {
    useAppStore.getState().getSelectedModel();
  }, []);

  const testChat = async () => {
    console.log('selectedModel?.filePath', selectedModel?.filePath);
    console.log('getLocalPathFromUri(selectedModel?.filePath || "")', getLocalPathFromUri(selectedModel?.filePath || ""));
    if (!llamaContext) {
      await initLlamaContext(getLocalPathFromUri(selectedModel?.filePath || ''));
    };
    if (!llamaContext) return;
    const response = await llamaContext.completion({
      prompt: 'This is a conversation between user and llama, a friendly chatbot. respond in simple markdown.\n\nUser: Hello!\nLlama:',
      n_predict: 100,
    }, (token) => {
      console.log('token', token);
    });
    console.log('response', response);
  }

  const handleSend = () => {
    testChat();
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >

      <FlatList
        data={[]}
        renderItem={() => { }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      <View >
        <Text style={styles.modelname}> Model: {selectedModel?.fileName || 'No model selected. Please select a model by clicking the refresh button.'}</Text>
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => { router.push('/modal') }} style={styles.refreshButton}>
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
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
          >
            <Text style={styles.sendButtonText}>Send</Text>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#1976d2',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#fff',
  },
  assistantTimestamp: {
    color: '#666',
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
