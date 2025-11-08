import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';

interface DrawerItem {
  label: string;
  icon: string;
  screenName: string;
}

interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  staticItems: DrawerItem[];
  chats: Chat[];
  onNewChat?: (chat: Chat) => void;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  staticItems,
  chats,
  navigation,
  onNewChat,
}) => {
  const handleNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: `New Chat ${chats.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    if (onNewChat) {
      onNewChat(newChat);
    }
    navigation.navigate('Chat', { chatId: newChat.id });
  };

  return (
    <DrawerContentScrollView style={styles.container}>
      {/* Static Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menu</Text>
        {staticItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.drawerItem}
            onPress={() => navigation.navigate(item.screenName as never)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chats Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chats</Text>
          <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
            <Text style={styles.newChatText}>+ New Chat</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.chatsList}>
          {chats.length === 0 ? (
            <Text style={styles.emptyText}>No chats yet</Text>
          ) : (
            chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.chatItem}
                onPress={() => navigation.navigate('Chat', { chatId: chat.id })}
              >
                <Text style={styles.icon}>#</Text>
                <Text style={styles.chatTitle} numberOfLines={1}>
                  {chat.title}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#000',
  },
  chatTitle: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  chatsList: {
    maxHeight: 400,
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  newChatButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newChatText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default CustomDrawerContent;

