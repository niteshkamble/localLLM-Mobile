import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import NativeLocalLLM from '../../spec/NativeLocalLLM';

const Home = () => {
  useEffect(() => {
    console.log('Home');
    const loadModelAndGenerateResponse = async () => {
      try {
        await NativeLocalLLM.loadModel('TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF');
        const response = await NativeLocalLLM.generateResponse('Hello, how are you?');
        console.log('Response:', response);
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    loadModelAndGenerateResponse();
  }, []);
  return (
    <View>
      <Text>Home</Text>
    </View>
  );
}

export default Home