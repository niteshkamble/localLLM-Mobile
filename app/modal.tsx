import { Button, FlatList } from 'react-native';

import ModelItem from '@/components/ModelItem';
import { Text, View } from '@/components/Themed';
import { DownloadedModel } from '@/constants/Type';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useAppStore } from './store/useAppStore';
import { useModelStore } from './store/useModelStore';

export default function ModalScreen() {
  const localModels = useModelStore((state) => state.localModels);
  const isLocalModelLoading = useModelStore((state) => state.isLocalModelLoading);
  const localError = useModelStore((state) => state.localError);
  const selectedModel = useAppStore((state) => state.selectedModel);
  const setSelectedModel = useAppStore((state) => state.setSelectedModel);
  const getSelectedModel = useAppStore((state) => state.getSelectedModel);

  // Load models and selected model on mount
  useEffect(() => {
    useModelStore.getState().getLocalModels();
    getSelectedModel();
  }, []);

  const handleModelPress = useCallback(async (model: DownloadedModel) => {
    await setSelectedModel(model.modelId);
    console.log('Model selected:', model.fileName);
  }, [setSelectedModel]);

  return (
    <View style={styles.container}>
      {localError ? (
        <Text style={styles.error}>Error: {localError}</Text>
      ) : (
        <FlatList
          data={localModels}
          renderItem={({ item }) => <ModelItem item={item} onPress={handleModelPress} isSelected={item.modelId === selectedModel?.modelId} />}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            isLocalModelLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.loading}>Loading...</Text>
              </View>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.loading}>No models found.</Text>
                <Button title="Download Models" onPress={() => router.push('/(tabs)/two')} />
              </View>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loading: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: '50%',
  },
  error: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginTop: '50%',
  }
});
