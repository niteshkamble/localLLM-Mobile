import AlertDialogBox from '@/components/AlertDialogBox';
import HFModelHeader from '@/components/Models/HFModelHeader';
import HFModelListItem from '@/components/Models/HFModelListItem';
import { Text, View } from '@/components/Themed';
import { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useModelStore } from '../store/useModelStore';

export default function TabTwoScreen() {
  const hfModelsData = useModelStore((state) => state.hfModelsData);
  const isHFModelLoading = useModelStore((state) => state.isHFModelLoading);
  const hfError = useModelStore((state) => state.hfError);
  
  const downloadHFModel = useModelStore((state) => state.downloadHFModel);
  const isHFModelDownloading = useModelStore((state) => state.isHFModelDownloading);
  const hfModelDownloadProgress = useModelStore((state) => state.hfModelDownloadProgress);
  const hfModelDownloadFileName = useModelStore((state) => state.hfModelDownloadFileName);

  useEffect(() => {
    if (hfModelsData) {
      console.log('hfModelsData', hfModelsData);
    }
  }, [hfModelsData]);

  const handleDownload = async (repoPath: string, ggufFileName: string) => {
    try {
      await downloadHFModel(repoPath, ggufFileName);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleCancelDownload = () => {
    useModelStore.getState().cancelDownload();
  };

  useEffect(() => {
    useModelStore.getState().getHFModels();
  }, []);
  if (isHFModelLoading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }
  if (hfError) {
    return <Text style={styles.error}>Error: {hfError}</Text>;
  }
  if (!hfModelsData?.data) {
    return null;
  }

  const repoPath = hfModelsData.data.modelId;

  return (
    <View style={styles.container}>
      <AlertDialogBox
        visible={isHFModelDownloading}
        title="Downloading Model"
        progress={hfModelDownloadProgress}
        fileName={hfModelDownloadFileName || undefined}
        onCancel={handleCancelDownload}
      />
      <FlatList
        ListHeaderComponent={() => (
          <>
            <HFModelHeader data={hfModelsData.data} />
          </>
        )}
        data={hfModelsData.data.siblings}
        renderItem={({ item }) => (
          <HFModelListItem 
            {...item} 
            repoPath={repoPath}
            onDownload={handleDownload} 
          />
        )}
        keyExtractor={(item) => item.rfilename}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  count: {
    fontSize: 12,
    color: 'green',
    textAlign: 'center',
    margin: 4
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
