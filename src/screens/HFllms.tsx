import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store/store';
import { getModelsFromHuggingface } from '../app/reducers/model/hfModelSlice';
import { HuggingfaceModel } from '../utils/types';

const HFllms = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { huggingfaceModels, isLoading, error } = useSelector((state: RootState) => state.hfModel);

    useEffect(() => {
        dispatch(getModelsFromHuggingface());
    }, [dispatch]);

    const formatDate = (dateString: string) => {
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
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const renderItem = ({ item }: { item: HuggingfaceModel }) => {
        return (
            <TouchableOpacity style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemHeaderLeft}>
                        <Text style={styles.modelId} numberOfLines={1}>
                            {item.modelId}
                        </Text>
                        <Text style={styles.id} numberOfLines={1}>
                            ID: {item.id}
                        </Text>
                    </View>
                </View>

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

                <Text style={styles.createdAt}>
                    Created: {formatDate(item.createdAt)}
                </Text>
            </TouchableOpacity>
        );
    };

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
                keyExtractor={(item: HuggingfaceModel) => item.id}
                contentContainerStyle={styles.listContent}
                {...({ estimatedItemSize: 150 } as any)}
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
});

export default HFllms;