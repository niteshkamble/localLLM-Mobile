import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

// Mock chat history data - in real app, this would come from a store/database
const mockChatHistory: ChatHistory[] = [
  {
    id: '1',
    title: 'Fun Development Chat',
    lastMessage: 'How can I improve my code?',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: '2',
    title: 'Learning React Native',
    lastMessage: 'What are the best practices?',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: '3',
    title: 'Project Discussion',
    lastMessage: 'Let\'s discuss the architecture',
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
  },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleChatSelect = (chatId: string) => {
    // TODO: Load chat history for this chat
    props.navigation.navigate('index');
  };

  const handleNewChat = () => {
    // TODO: Create new chat
    props.navigation.navigate('index');
  };

  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat History</Text>
        <TouchableOpacity 
          style={styles.newChatButton}
          onPress={handleNewChat}
        >
          <FontAwesome name="plus" size={16} color="#1976d2" />
          <Text style={styles.newChatText}>New Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chatList}>
        {mockChatHistory.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => handleChatSelect(chat.id)}
          >
            <View style={styles.chatIcon}>
              <FontAwesome name="comment" size={20} color="#1976d2" />
            </View>
            <View style={styles.chatContent}>
              <Text style={styles.chatTitle} numberOfLines={1}>
                {chat.title}
              </Text>
              <Text style={styles.chatPreview} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
              <Text style={styles.chatTime}>{formatTime(chat.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label="Download Models"
          icon={({ color, size }) => (
            <FontAwesome name="download" size={size} color={color} />
          )}
          onPress={() => router.push('/(tabs)')}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
  },
  newChatText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 15,
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
    padding: 12,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
});
