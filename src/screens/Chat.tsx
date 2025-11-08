import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootDrawerParamList } from '../../App';

type ChatScreenRouteProp = RouteProp<RootDrawerParamList, 'Chat'>;

const Chat: React.FC = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat: {chatId}</Text>
      <Text style={styles.subtitle}>Chat screen content will go here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default Chat;

