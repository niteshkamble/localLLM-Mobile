import { useEffect, useState, useCallback } from 'react';
import {StatusBar, useColorScheme, View, ActivityIndicator, Text } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, AppDispatch, RootState } from './src/app/store/store';
import { createModelTable } from './src/app/database/modelDatabase';
import { getModelsFromLocalStorage } from './src/app/reducers/model/modelSlice';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import Home from './src/screens/Home';
import LocalLLM from './src/screens/LocalLLM';
import Chat from './src/screens/Chat';
import HFllms from './src/screens/HFllms';
import RNFS from 'react-native-fs';

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

// Simple Chat type for drawer (matches CustomDrawerContent interface)
interface SimpleChat {
  id: string;
  title: string;
  createdAt: string;
}

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const [chats, setChats] = useState<SimpleChat[]>([]);
  const [hasDownloadedModels, setHasDownloadedModels] = useState<boolean | null>(null);
  const [isCheckingModels, setIsCheckingModels] = useState<boolean>(true);
  
  const { localModels } = useSelector((state: RootState) => state.model);
  const downloadState = useSelector((state: RootState) => state.hfModelDownload);

  // Function to check if models are downloaded
  const checkDownloadedModels = useCallback(async () => {
    try {
      setIsCheckingModels(true);
      
      // First, try to get models from database
      const models = await dispatch(getModelsFromLocalStorage()).unwrap();
      
      // Also check file system for .gguf files
      const documentPath = RNFS.DocumentDirectoryPath;
      const files = await RNFS.readDir(documentPath);
      
      const hasGGUFFiles = files.some(file => 
        file.name.endsWith('.gguf') && file.size > 0
      );
      
      // Check if we have models in database or GGUF files
      const hasModels = (models && models.length > 0) || hasGGUFFiles;
      setHasDownloadedModels(hasModels);
    } catch (error) {
      console.error('Error checking for downloaded models:', error);
      // On error, assume no models and show download screen
      setHasDownloadedModels(false);
    } finally {
      setIsCheckingModels(false);
    }
  }, [dispatch]);

  // Initial check for downloaded models
  useEffect(() => {
    checkDownloadedModels();
  }, [checkDownloadedModels]);

  // Note: We don't auto-navigate after download - user can manually navigate using the button
  // The download screen will show the downloaded models and provide a navigation button

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
  const handleNewChat = (newChat: SimpleChat) => {
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

  // Show loading state while checking for models
  if (isCheckingModels) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>Checking for downloaded models...</Text>
      </View>
    );
  }

  // Always show drawer navigator, but start on HFllms (download screen)
  // User can manually navigate using the button in HFllms
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HFllms"
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
            headerLeft: undefined, // Allow back button to show
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
