import { useEffect, useState } from 'react';
import {StatusBar, useColorScheme } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './src/app/store/store';
import { createModelTable } from './src/app/database/modelDatabase';
import { getModelsFromHuggingface } from './src/app/reducers/model/hfModelSlice';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import Home from './src/screens/Home';
import LocalLLM from './src/screens/LocalLLM';
import Chat from './src/screens/Chat';
import HFllms from './src/screens/HFllms';
import { Chat as ChatType } from './src/utils/types';

export type RootDrawerParamList = {
  Home: undefined;
  LocalLLM: undefined;
  HFllms: undefined;
  Chat: { chatId: string };
};

const Drawer = createDrawerNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await createModelTable();
      } catch (error) {
        console.error('Failed to create model table:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />  
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [chats, setChats] = useState<ChatType[]>([]);
  // Static drawer items
  const staticItems = [
    {
      label: 'Home',
      icon: '#',
      screenName: 'Home',
    },
    {
      label: 'Local LLM',
      icon: '#',
      screenName: 'LocalLLM',
    },
    {
      label: 'Hugging Face Models',
      icon: '#',
      screenName: 'HFllms',
    },
  ];

  // Handle new chat creation
  const handleNewChat = (newChat: ChatType) => {
    setChats([newChat, ...chats]);
  };

  // Custom drawer content component
  const CustomDrawer = (props: DrawerContentComponentProps) => (
    <CustomDrawerContent
      {...props}
      staticItems={staticItems}
      chats={chats}
      onNewChat={handleNewChat}
    />
  );

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={CustomDrawer}
        screenOptions={{
          headerShown: true,
        }}
      >
        <Drawer.Screen 
          name="Home" 
          component={Home}
          options={{
            title: 'Home',
          }}
        />
        <Drawer.Screen 
          name="LocalLLM" 
          component={LocalLLM}
          options={{
            title: 'Local LLM',
          }}
        />
        <Drawer.Screen 
          name="HFllms" 
          component={HFllms}
          options={{
            title: 'Hugging Face Models',
            drawerItemStyle: { display: 'none' }, // Hide from default drawer, we'll show in custom
          }}
        />
        <Drawer.Screen 
          name="Chat" 
          component={Chat}
          options={{
            title: 'Chat',
            drawerItemStyle: { display: 'none' }, // Hide from default drawer, we'll show in custom
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
