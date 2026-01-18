import { Text } from '@/components/Themed';
import { ChatMessage } from '@/constants/Type';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        
        {/* Show metadata for assistant messages */}
        {!isUser && message.metadata && (
          <View style={styles.metadataContainer}>
            {message.metadata.speed && (
              <Text style={styles.metadataText}>
                ⚡ {message.metadata.speed.toFixed(1)} tokens/sec
              </Text>
            )}
            {/* {message.metadata.tokenCount && (
              <Text style={styles.metadataText}>
                {message.metadata.tokenCount} tokens
              </Text>
            )} */}
          </View>
        )}
        
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  metadataContainer: {
    flexDirection: 'row',
    gap: 8,
    // marginTop: 6,
    paddingTop: 6,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    // borderTopWidth: 1,
    // borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  metadataText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
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
});
