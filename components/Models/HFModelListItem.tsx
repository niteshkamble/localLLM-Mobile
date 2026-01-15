import { GGUFFile } from '@/constants/Type';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HFModelListItemProps extends GGUFFile {
    repoPath: string;
    onDownload: (repoPath: string, ggufFileName: string) => Promise<void>;
}

const HFModelListItem: React.FC<HFModelListItemProps> = ({ 
    rfilename, 
    size, 
    repoPath, 
    onDownload 
}) => {
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Size unknown';
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let fileSize = bytes;
        let unitIndex = 0;
        
        while (fileSize >= 1024 && unitIndex < units.length - 1) {
            fileSize /= 1024;
            unitIndex++;
        }
        
        return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
    };

    const handleDownloadPress = () => {
        onDownload(repoPath, rfilename);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={3} ellipsizeMode="middle">
                        {rfilename}
                    </Text>
                    <Text style={styles.size}>{formatFileSize(size)}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={handleDownloadPress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    size: {
        fontSize: 13,
        color: '#666',
    },
    downloadButton: {
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default HFModelListItem;