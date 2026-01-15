import { Text, View } from '@/components/Themed';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Button, StyleSheet } from 'react-native';
import { useModelStore } from '../store/useModelStore';

export default function TabOneScreen() {
  const localModels = useModelStore((state) => state.localModels);
  const isLocalModelLoading = useModelStore((state) => state.isLocalModelLoading);
  const localError = useModelStore((state) => state.localError);

  useEffect(() => {
    useModelStore.getState().getLocalModels();
  }, []);
  if (isLocalModelLoading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }
  if (localError) {
    return <Text style={styles.error}>Error: {localError}</Text>;
  }
  return (
    <>
      {localModels.length > 0 ? (
        <View style={styles.container}>
          <Text style={styles.count}>{localModels.length} Downloaded{localModels.length}</Text>
          {localModels.map((model) => (
            <Text key={model.id}>{model.modelId}</Text>
          ))}
        </View>
      ) : (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.info}>No models found.</Text>
          <Button title="Download Models" onPress={() => router.push('/(tabs)/two')} />
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  count: {
    fontSize: 12,
    color: 'gray',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loading: {
    fontSize: 12,
    color: 'gray',
  },
  error: {
    fontSize: 12,
    color: 'red',
  },
  info: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});