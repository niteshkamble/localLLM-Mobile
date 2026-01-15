import { HuggingfaceModelAPIResponse } from '@/constants/Type'
import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface HFModelHeaderProps {
    data: HuggingfaceModelAPIResponse['data']
}

const HFModelHeader: React.FC<HFModelHeaderProps> = ({ data }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString: string): string => {
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

    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    return (
        <View style={styles.container}>
            {/* Minimal View - Always Visible */}
            <View style={styles.minimalSection}>
                <Text style={styles.title}>{data.modelId}</Text>
                <Text style={styles.subtitle}>by {data.author}</Text>
                
                <View style={styles.statsRow}>
                    <StatItem label="Downloads" value={formatNumber(data.downloads)} />
                    <StatItem label="Likes" value={formatNumber(data.likes)} />
                    <StatItem label="Files" value={data.siblings.length.toString()} />
                </View>


                {data.gguf && (
                    <View style={styles.quickInfo}>
                        <Text style={[styles.quickInfoText,{textAlign: 'center'}]}>
                            {data.gguf.architecture} • Context: {data.gguf.context_length}
                        </Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.toggleButton}
                    onPress={() => setIsExpanded(!isExpanded)}
                >
                    <Text style={styles.toggleButtonText}>
                        {isExpanded ? 'View Less' : 'View More'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Expanded View - Conditional */}
            {isExpanded && (
                <View style={styles.expandedSection}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>
                        <InfoRow label="ID" value={data.id} />
                        <InfoRow label="Status" value={data.disabled ? 'Disabled' : 'Active'} />
                        <InfoRow label="Visibility" value={data.private ? 'Private' : 'Public'} />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dates</Text>
                        <InfoRow label="Created" value={formatDate(data?.createdAt || '')} />
                        <InfoRow label="Last Modified" value={formatDate(data?.lastModified || '')} />
                    </View>

                    {data.tags && data.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tags</Text>
                            <View style={styles.tagsContainer}>
                                {data.tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {data.gguf && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>GGUF Details</Text>
                            <InfoRow label="Architecture" value={data.gguf.architecture} />
                            <InfoRow label="Context Length" value={data.gguf.context_length.toString()} />
                            <InfoRow label="Total" value={formatNumber(data.gguf.total)} />
                            <InfoRow label="BOS Token" value={data.gguf.bos_token} />
                            <InfoRow label="EOS Token" value={data.gguf.eos_token} />
                            {data.gguf.quantize_imatrix_file && (
                                <InfoRow label="Quantize IMatrix" value={data.gguf.quantize_imatrix_file} />
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}

interface InfoRowProps {
    label: string;
    value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

interface StatItemProps {
    label: string;
    value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
    <View style={styles.statItem}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    minimalSection: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    quickInfo: {
        marginBottom: 12,
    },
    quickInfoText: {
        fontSize: 13,
        color: '#555',
    },
    toggleButton: {
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginTop: 8,
    },
    toggleButtonText: {
        fontSize: 14,
        color: '#1976d2',
        fontWeight: '600',
    },
    expandedSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    section: {
        marginTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginRight: 8,
        minWidth: 100,
    },
    value: {
        fontSize: 13,
        color: '#333',
        flex: 1,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    tag: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#1976d2',
        fontWeight: '500',
    },
});

export default HFModelHeader