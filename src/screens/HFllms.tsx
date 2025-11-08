import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store/store';
import { getModelsFromHuggingface } from '../app/reducers/model/hfModelSlice';
import { downloadModel, resetDownload } from '../app/reducers/model/hfModelDownloadSlice';
import { HuggingfaceModel } from '../utils/types';

const HFllms = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { huggingfaceModels, isLoading, error } = useSelector((state: RootState) => state.hfModel);
    
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

    useEffect(() => {
        dispatch(getModelsFromHuggingface());
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

    const handleDownload = useCallback((model: HuggingfaceModel) => {
        if (downloadState.isDownloading) {
            Alert.alert('Download in Progress', 'Please wait for the current download to complete.');
            return;
        }
        dispatch(downloadModel(model));
    }, [downloadState.isDownloading, dispatch]);

    const isModelDownloading = useCallback((modelId: string): boolean => {
        return downloadState.isDownloading && downloadState.currentModel?.id === modelId;
    }, [downloadState.isDownloading, downloadState.currentModel?.id]);

    // Memoize keyExtractor - must be before any conditional returns
    const keyExtractor = useCallback((item: HuggingfaceModel) => item.id, []);

    // Memoize renderItem to prevent unnecessary re-renders
    const renderItem = useCallback(({ item }: { item: HuggingfaceModel }) => {
        const isDownloading = isModelDownloading(item.id);
        const isCurrentDownload = downloadState.currentModel?.id === item.id;

        return (
            <TouchableOpacity 
                style={[styles.itemContainer, isDownloading && styles.itemContainerDownloading]}
                onPress={() => handleDownload(item)}
                disabled={isDownloading}
            >
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderLeft}>
                        <Text style={styles.modelId} numberOfLines={1}>
                            {item.modelId}
                        </Text>
                        <Text style={styles.id} numberOfLines={1}>
                            ID: {item.id}
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

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Downloads</Text>
                        <Text style={styles.statValue}>{formatNumber(item.downloads)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Likes</Text>
                        <Text style={styles.statValue}>{formatNumber(item.likes)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Library</Text>
                        <Text style={styles.statValue} numberOfLines={1}>
                            {item.library_name || 'N/A'}
                        </Text>
                    </View>
                </View>

                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.slice(0, 5).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {item.tags.length > 5 && (
                            <Text style={styles.moreTags}>+{item.tags.length - 5}</Text>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    <Text style={styles.createdAt}>
                        Created: {formatDate(item.createdAt)}
                    </Text>
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
    }, [downloadState, formatDate, formatNumber, formatBytes, formatTime, handleDownload, isModelDownloading]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading models...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => dispatch(getModelsFromHuggingface())}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!huggingfaceModels || huggingfaceModels.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No models found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlashList
                data={huggingfaceModels}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                {...({ estimatedItemSize: 200 } as any)}
                removeClippedSubviews={true} // Optimize for large lists
                maxToRenderPerBatch={10} // Render fewer items per batch
                updateCellsBatchingPeriod={100} // Batch updates
                windowSize={10} // Reduce window size
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
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