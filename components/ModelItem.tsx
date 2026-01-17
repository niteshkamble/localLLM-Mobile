import { DownloadedModel } from '@/constants/Type';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ModelItemProps {
  item: DownloadedModel;
  onPress?: (item: DownloadedModel) => void;
  isSelected?: boolean;
  showActionButton?: boolean;
  actionIcon?: React.ComponentProps<typeof FontAwesome>['name'];
  actionColor?: string;
  onActionPress?: (item: DownloadedModel) => void;
}

const ModelItem: React.FC<ModelItemProps> = ({
  item,
  onPress,
  showActionButton = false,
  actionIcon = 'check-circle',
  actionColor = '#1976d2',
  onActionPress,
  isSelected = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const content = (
    <View style={[styles.modelCard, isSelected && styles.selectedCard]}>
      <View style={styles.modelHeader}>
        <View style={styles.modelNameContainer}>
          <Text style={styles.modelName} numberOfLines={2} ellipsizeMode="tail">
            {item.fileName}
          </Text>
          {item.format && (
            <View style={[styles.formatBadge, isSelected && styles.selectedFormatBadge]}>
              <Text style={styles.formatText}>{item.format.toUpperCase()}</Text>
            </View>
          )}
        </View>
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <FontAwesome name="check-circle" size={24} color="#4caf50" />
          </View>
        )}
        {showActionButton && (
          <TouchableOpacity
            onPress={() => onActionPress?.(item)}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <FontAwesome name={actionIcon} size={24} color={actionColor} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.modelId} numberOfLines={2} ellipsizeMode="tail">
        {item.modelId}
      </Text>

      <View style={styles.modelFooter}>
        <View style={styles.footerLeft}>
          <FontAwesome name="database" size={12} color="#666" />
          <Text style={styles.modelSize}>{formatFileSize(item.size)}</Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.modelStatus}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return styles.statusCompleted;
    case 'downloading':
      return styles.statusDownloading;
    case 'error':
      return styles.statusError;
    default:
      return styles.statusDefault;
  }
};

const styles = StyleSheet.create({
  modelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  selectedCard: {
    borderColor: '#4caf50',
    backgroundColor: '#f1f8f4',
    shadowColor: '#4caf50',
    shadowOpacity: 0.2,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modelNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  formatBadge: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  selectedFormatBadge: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  formatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  checkmarkContainer: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
  },
  modelId: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  modelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modelSize: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusDownloading: {
    backgroundColor: '#e3f2fd',
  },
  statusError: {
    backgroundColor: '#ffebee',
  },
  statusDefault: {
    backgroundColor: '#f5f5f5',
  },
  modelStatus: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#333',
  },
});

export default ModelItem;
