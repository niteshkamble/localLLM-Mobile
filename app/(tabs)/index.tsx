import { Text, View } from '@/components/Themed';
import { DownloadedModel } from '@/constants/Type';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Button, FlatList, StyleSheet } from 'react-native';
import { useModelStore } from '../store/useModelStore';

export default function TabOneScreen() {
  const localModels = useModelStore((state) => state.localModels);
  const isLocalModelLoading = useModelStore((state) => state.isLocalModelLoading);
  const localError = useModelStore((state) => state.localError);

  useEffect(() => {
    useModelStore.getState().getLocalModels();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderModelItem = ({ item }: { item: DownloadedModel }) => (
    <View style={styles.modelCard}>
      <View style={styles.modelHeader}>
        <Text style={styles.modelName} numberOfLines={2}>
          {item.fileName}
        </Text>
        {item.format && (
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{item.format.toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={styles.modelId} numberOfLines={3}>
        {item.modelId}
      </Text>
      <View style={styles.modelFooter}>
        <Text style={styles.modelSize}>{formatFileSize(item.size)}</Text>
        <Text style={styles.modelStatus}>{item.status}</Text>
      </View>
    </View>
  );

  if (isLocalModelLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loading}>Loading models...</Text>
      </View>
    );
  }

  if (localError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.error}>Error: {localError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {localModels.length > 0 ? (
        <FlatList
          data={localModels}
          renderItem={renderModelItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.info}>No models found.</Text>
          <Button title="Download Models" onPress={() => router.push('/(tabs)/two')} />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  modelCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  formatBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formatText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
  },
  modelId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  modelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelSize: {
    fontSize: 13,
    color: '#999',
  },
  modelStatus: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  loading: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    fontSize: 14,
    color: '#f44336',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
});