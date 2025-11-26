import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../app/store/store';
import { downloadModel, resetDownload } from '../app/reducers/model/hfModelDownloadSlice';
import { setSelectedModel, SelectedModel as SelectedModelType } from '../app/reducers/model/selectedModelSlice';
import RNFS from 'react-native-fs';
import axios from 'axios';

// Model formats supported by the app
const modelFormats = [
    { label: 'Llama-3.2-1B-Instruct' },
    { label: 'Qwen2-0.5B-Instruct' },
    { label: 'DeepSeek-R1-Distill-Qwen-1.5B' },
    { label: 'SmolLM2-1.7B-Instruct' },
];

// Mapping from user-friendly model names to Hugging Face repository paths
const HF_TO_GGUF: { [key: string]: string } = {
    'Llama-3.2-1B-Instruct': 'medmekk/Llama-3.2-1B-Instruct.GGUF',
    'DeepSeek-R1-Distill-Qwen-1.5B': 'medmekk/DeepSeek-R1-Distill-Qwen-1.5B.GGUF',
    'Qwen2-0.5B-Instruct': 'medmekk/Qwen2.5-0.5B-Instruct.GGUF',
    'SmolLM2-1.7B-Instruct': 'medmekk/SmolLM2-1.7B-Instruct.GGUF',
};

// Type for GGUF file
type GGUFFile = {
    rfilename: string;
    size?: number;
};

// Type for downloaded model
type DownloadedModel = {
    fileName: string;
    filePath: string;
    size: number;
    modelFormat?: string;
};

const HFllms = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const [selectedModelFormat, setSelectedModelFormat] = useState<string>('');
    const [availableGGUFs, setAvailableGGUFs] = useState<string[]>([]);
    const [isLoadingGGUFs, setIsLoadingGGUFs] = useState<boolean>(false);
    const [downloadedModels, setDownloadedModels] = useState<DownloadedModel[]>([]);
    const [isLoadingDownloaded, setIsLoadingDownloaded] = useState<boolean>(true);
    
    // Get selected model from Redux
    const selectedModel = useSelector((state: RootState) => state.selectedModel.selectedModel);
    
    // Use selective selector to prevent unnecessary re-renders
    const downloadState = useSelector((state: RootState) => state.hfModelDownload, (left, right) => {
        // Return true if values are equal (skip re-render), false if different (re-render)
        return (
            left.isDownloading === right.isDownloading &&
            left.progress === right.progress &&
            left.downloadedSize === right.downloadedSize &&
            left.totalSize === right.totalSize &&
            left.downloadSpeed === right.downloadSpeed &&
            left.timeRemaining === right.timeRemaining &&
            left.currentModel?.id === right.currentModel?.id &&
            left.error === right.error
        );
    });

    // Fetch available GGUF files from Hugging Face
    const fetchAvailableGGUFs = async (modelFormat: string) => {
        if (!modelFormat) {
            Alert.alert('Error', 'Please select a model format first.');
            return;
        }

        setIsLoadingGGUFs(true);
        try {
            const repoPath = HF_TO_GGUF[modelFormat];
            if (!repoPath) {
                throw new Error(
                    `No repository mapping found for model format: ${modelFormat}`,
                );
            }

            const response = await axios.get(
                `https://huggingface.co/api/models/${repoPath}`,
            );

            if (!response.data?.siblings) {
                throw new Error('Invalid API response format');
            }

            const files = response.data.siblings.filter((file: GGUFFile) =>
                file.rfilename.endsWith('.gguf'),
            );

            setAvailableGGUFs(files.map((file: GGUFFile) => file.rfilename));
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to fetch .gguf files';
            Alert.alert('Error', errorMessage);
            setAvailableGGUFs([]);
        } finally {
            setIsLoadingGGUFs(false);
        }
    };

    // Load downloaded models from file system
    const loadDownloadedModels = useCallback(async () => {
        try {
            setIsLoadingDownloaded(true);
            const documentPath = RNFS.DocumentDirectoryPath;
            const files = await RNFS.readDir(documentPath);
            
            const ggufFiles: DownloadedModel[] = [];
            
            for (const file of files) {
                if (file.name.endsWith('.gguf') && file.size > 0) {
                    // Try to match with model format
                    let modelFormat: string | undefined;
                    for (const [format, repoPath] of Object.entries(HF_TO_GGUF)) {
                        if (file.name.toLowerCase().includes(format.toLowerCase().replace(/-/g, '').substring(0, 5))) {
                            modelFormat = format;
                            break;
                        }
                    }
                    
                    ggufFiles.push({
                        fileName: file.name,
                        filePath: file.path,
                        size: file.size,
                        modelFormat,
                    });
                }
            }
            
            setDownloadedModels(ggufFiles);
        } catch (error) {
            console.error('Error loading downloaded models:', error);
            setDownloadedModels([]);
        } finally {
            setIsLoadingDownloaded(false);
        }
    }, []);

    // Load downloaded models on mount and after download completes
    useEffect(() => {
        loadDownloadedModels();
    }, [loadDownloadedModels]);

    // Reload downloaded models when download completes
    useEffect(() => {
        if (!downloadState.isDownloading && downloadState.progress === 100 && !downloadState.error) {
            // Download completed, reload the list
            setTimeout(() => {
                loadDownloadedModels();
            }, 500);
        }
    }, [downloadState.isDownloading, downloadState.progress, downloadState.error, loadDownloadedModels]);

    // Handle model format selection
    const handleModelFormatSelect = (format: string) => {
        setSelectedModelFormat(format);
        setAvailableGGUFs([]); // Clear previous GGUF files
        fetchAvailableGGUFs(format);
    };

    // Handle navigation to Home
    const handleNavigateToHome = () => {
        navigation.navigate('Home' as never);
    };

    // Handle model selection
    const handleSelectModel = useCallback((model: DownloadedModel) => {
        const selectedModelData: SelectedModelType = {
            fileName: model.fileName,
            filePath: model.filePath,
            size: model.size,
            modelFormat: model.modelFormat,
        };
        dispatch(setSelectedModel(selectedModelData));
        Alert.alert('Model Selected', `Selected model: ${model.fileName}\nPath: ${model.filePath}`);
    }, [dispatch]);

    // Handle download completion/error
    useEffect(() => {
        if (downloadState.error) {
            Alert.alert(
                'Download Error',
                downloadState.error,
                [
                    {
                        text: 'OK',
                        onPress: () => dispatch(resetDownload()),
                    },
                ]
            );
        } else if (!downloadState.isDownloading && downloadState.progress === 100 && downloadState.currentModel) {
            Alert.alert(
                'Download Complete',
                `${downloadState.currentModel.modelId} downloaded successfully!`,
                [
                    {
                        text: 'OK',
                        onPress: () => dispatch(resetDownload()),
                    },
                ]
            );
        }
    }, [downloadState.error, downloadState.isDownloading, downloadState.progress, downloadState.currentModel, dispatch]);

    // Memoize formatters to prevent recreation on every render
    const formatDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    }, []);

    const formatNumber = useCallback((num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }, []);

    const formatBytes = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }, []);

    const formatTime = useCallback((seconds: number): string => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }, []);

    const handleDownload = useCallback((ggufFileName: string) => {
        if (!selectedModelFormat) {
            Alert.alert('Error', 'Please select a model format first.');
            return;
        }

        if (downloadState.isDownloading) {
            Alert.alert('Download in Progress', 'Please wait for the current download to complete.');
            return;
        }

        const repoPath = HF_TO_GGUF[selectedModelFormat];
        if (!repoPath) {
            Alert.alert('Error', 'Invalid model format selected.');
            return;
        }

        // Create a model object compatible with the download slice
        // The download URL will be: https://huggingface.co/{repoPath}/resolve/main/{ggufFileName}
        const downloadUrl = `https://huggingface.co/${repoPath}/resolve/main/${ggufFileName}`;
        
        const modelForDownload = {
            id: `${repoPath}-${ggufFileName}`,
            modelId: `${selectedModelFormat}-${ggufFileName}`,
            createdAt: new Date().toISOString(),
            downloads: 0,
            library_name: 'gguf',
            likes: 0,
            pipeline_tag: 'text-generation',
            private: false,
            tags: ['gguf', selectedModelFormat],
            downloadUrl: downloadUrl,
            fileName: ggufFileName,
            repoPath: repoPath,
        };

        dispatch(downloadModel(modelForDownload as any));
    }, [selectedModelFormat, downloadState.isDownloading, dispatch]);

    const isModelDownloading = useCallback((fileName: string): boolean => {
        return downloadState.isDownloading && (downloadState.currentModel?.modelId?.includes(fileName) ?? false);
    }, [downloadState.isDownloading, downloadState.currentModel?.modelId]);

    // Memoize keyExtractor for GGUF files
    const keyExtractor = useCallback((item: string) => item, []);

    // Memoize renderItem for GGUF files
    const renderGGUFItem = useCallback(({ item }: { item: string }) => {
        const isDownloading = isModelDownloading(item);
        const isCurrentDownload = downloadState.currentModel?.modelId?.includes(item);

        return (
            <TouchableOpacity 
                style={[styles.itemContainer, isDownloading && styles.itemContainerDownloading]}
                onPress={() => handleDownload(item)}
                disabled={isDownloading}
            >
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderLeft}>
                        <Text style={styles.modelId} numberOfLines={2}>
                            {item}
                        </Text>
                        <Text style={styles.id} numberOfLines={1}>
                            Format: {selectedModelFormat}
                        </Text>
                    </View>
                    {isDownloading && (
                        <ActivityIndicator size="small" color="#007AFF" />
                    )}
                </View>

                {/* Download Progress Overlay */}
                {isCurrentDownload && downloadState.isDownloading && (
                    <View style={styles.downloadProgressContainer}>
                        <View style={styles.progressBarContainer}>
                            <View 
                                style={[
                                    styles.progressBar, 
                                    { width: `${downloadState.progress}%` }
                                ]} 
                            />
                        </View>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressText}>
                                {downloadState.progress}%
                            </Text>
                            <Text style={styles.progressDetails}>
                                {formatBytes(downloadState.downloadedSize)} / {formatBytes(downloadState.totalSize)}
                            </Text>
                        </View>
                        {downloadState.downloadSpeed > 0 && (
                            <View style={styles.speedInfo}>
                                <Text style={styles.speedText}>
                                    {formatBytes(downloadState.downloadSpeed)}/s
                                </Text>
                                {downloadState.timeRemaining > 0 && (
                                    <Text style={styles.timeText}>
                                        {formatTime(downloadState.timeRemaining)} remaining
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>GGUF</Text>
                    </View>
                    {!isDownloading && (
                        <TouchableOpacity
                            style={styles.downloadButton}
                            onPress={() => handleDownload(item)}
                        >
                            <Text style={styles.downloadButtonText}>Download</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    }, [selectedModelFormat, downloadState, formatBytes, formatTime, handleDownload, isModelDownloading]);

    // Render downloaded model item
    const renderDownloadedModel = useCallback(({ item }: { item: DownloadedModel }) => {
        const isSelected = selectedModel?.filePath === item.filePath;
        
        return (
            <TouchableOpacity
                style={[
                    styles.downloadedModelContainer,
                    isSelected && styles.downloadedModelContainerSelected
                ]}
                onPress={() => handleSelectModel(item)}
                activeOpacity={0.7}
            >
                <View style={styles.downloadedModelHeader}>
                    <View style={styles.downloadedModelInfo}>
                        <Text style={[
                            styles.downloadedModelName,
                            isSelected && styles.downloadedModelNameSelected
                        ]} numberOfLines={1}>
                            {item.fileName}
                        </Text>
                        {item.modelFormat && (
                            <Text style={styles.downloadedModelFormat}>
                                {item.modelFormat}
                            </Text>
                        )}
                        <Text style={styles.downloadedModelSize}>
                            {formatBytes(item.size)}
                        </Text>
                    </View>
                    <View style={[
                        styles.downloadedBadge,
                        isSelected && styles.downloadedBadgeSelected
                    ]}>
                        <Text style={styles.downloadedBadgeText}>
                            {isSelected ? '✓ Selected' : '✓ Downloaded'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [formatBytes, selectedModel, handleSelectModel]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Download GGUF Models</Text>
                        <Text style={styles.headerSubtitle}>Select a model format to view available GGUF files</Text>
                        {selectedModel && (
                            <View style={styles.selectedModelInfo}>
                                <Text style={styles.selectedModelLabel}>Selected Model:</Text>
                                <Text style={styles.selectedModelName} numberOfLines={1}>
                                    {selectedModel.fileName}
                                </Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.navigateButton,
                            downloadedModels.length === 0 && styles.navigateButtonDisabled
                        ]}
                        onPress={handleNavigateToHome}
                        disabled={downloadedModels.length === 0}
                    >
                        <Text style={[
                            styles.navigateButtonText,
                            downloadedModels.length === 0 && styles.navigateButtonTextDisabled
                        ]}>
                            Go to Home
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Downloaded Models Section */}
            {isLoadingDownloaded ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading downloaded models...</Text>
                </View>
            ) : downloadedModels.length > 0 && (
                <View style={styles.downloadedModelsSection}>
                    <Text style={styles.sectionTitle}>
                        Downloaded Models ({downloadedModels.length}):
                    </Text>
                    <FlashList
                        data={downloadedModels}
                        renderItem={renderDownloadedModel}
                        keyExtractor={(item: DownloadedModel) => item.fileName}
                        contentContainerStyle={styles.listContent}
                        {...({ estimatedItemSize: 100 } as any)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            )}

            {/* Model Format Selection */}
            <View style={styles.modelFormatContainer}>
                <Text style={styles.sectionTitle}>Select Model Format:</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.formatScrollView}
                    contentContainerStyle={styles.formatScrollContent}
                >
                    {modelFormats.map((format) => (
                        <TouchableOpacity
                            key={format.label}
                            style={[
                                styles.formatButton,
                                selectedModelFormat === format.label && styles.formatButtonSelected
                            ]}
                            onPress={() => handleModelFormatSelect(format.label)}
                        >
                            <Text style={[
                                styles.formatButtonText,
                                selectedModelFormat === format.label && styles.formatButtonTextSelected
                            ]}>
                                {format.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Loading State for GGUF Files */}
            {isLoadingGGUFs && (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading GGUF files...</Text>
                </View>
            )}

            {/* GGUF Files List */}
            {!isLoadingGGUFs && selectedModelFormat && availableGGUFs.length > 0 && (
                <View style={styles.ggufListContainer}>
                    <Text style={styles.sectionTitle}>
                        Available GGUF Files ({availableGGUFs.length}):
                    </Text>
                    <FlashList
                        data={availableGGUFs}
                        renderItem={renderGGUFItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.listContent}
                        {...({ estimatedItemSize: 150 } as any)}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={100}
                        windowSize={10}
                    />
                </View>
            )}

            {/* Empty State */}
            {!isLoadingGGUFs && selectedModelFormat && availableGGUFs.length === 0 && (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No GGUF files found for {selectedModelFormat}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => fetchAvailableGGUFs(selectedModelFormat)}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Initial State */}
            {!selectedModelFormat && !isLoadingGGUFs && (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>Please select a model format above</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    selectedModelInfo: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#e3f2fd',
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: '#1976d2',
    },
    selectedModelLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    selectedModelName: {
        fontSize: 13,
        color: '#1976d2',
        fontWeight: '600',
    },
    navigateButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    navigateButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    navigateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    navigateButtonTextDisabled: {
        color: '#999',
    },
    downloadedModelsSection: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        maxHeight: 200,
    },
    downloadedModelContainer: {
        backgroundColor: '#f0f8ff',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        minWidth: 200,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    downloadedModelContainerSelected: {
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: '#1976d2',
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    downloadedModelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    downloadedModelInfo: {
        flex: 1,
        marginRight: 8,
    },
    downloadedModelName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    downloadedModelNameSelected: {
        color: '#1976d2',
        fontWeight: '700',
    },
    downloadedModelFormat: {
        fontSize: 12,
        color: '#007AFF',
        marginBottom: 4,
    },
    downloadedModelSize: {
        fontSize: 11,
        color: '#666',
    },
    downloadedBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    downloadedBadgeSelected: {
        backgroundColor: '#1976d2',
    },
    downloadedBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    modelFormatContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12,
    },
    formatScrollView: {
        maxHeight: 60,
    },
    formatScrollContent: {
        paddingRight: 16,
    },
    formatButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    formatButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#0051D5',
    },
    formatButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976d2',
    },
    formatButtonTextSelected: {
        color: '#fff',
    },
    ggufListContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    listContent: {
        paddingBottom: 16,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemHeader: {
        marginBottom: 12,
    },
    itemHeaderLeft: {
        flex: 1,
    },
    modelId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    id: {
        fontSize: 12,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 6,
    },
    tag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#1976d2',
    },
    moreTags: {
        fontSize: 11,
        color: '#666',
        alignSelf: 'center',
        marginLeft: 4,
    },
    createdAt: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    itemContainerDownloading: {
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    downloadProgressContainer: {
        marginTop: 12,
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    progressDetails: {
        fontSize: 12,
        color: '#666',
    },
    speedInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    speedText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    downloadButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default HFllms;