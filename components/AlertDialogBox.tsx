import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AlertDialogBoxProps {
    visible: boolean;
    title: string;
    progress: number; 
    onCancel: () => void;
    fileName?: string; 
}

const AlertDialogBox: React.FC<AlertDialogBoxProps> = ({
    visible,
    title,
    progress,
    onCancel,
    fileName,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    
                    {fileName && (
                        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                            {fileName}
                        </Text>
                    )}
                    
                    <View style={styles.progressContainer}>
                        <ActivityIndicator 
                            size="large" 
                            color="#1976d2" 
                            style={styles.spinner}
                        />
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBackground}>
                                <View 
                                    style={[
                                        styles.progressBarFill, 
                                        { width: `${progress}%` }
                                    ]} 
                                />
                            </View>
                            <Text style={styles.progressText}>{progress}%</Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    fileName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        maxWidth: '100%',
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    spinner: {
        marginBottom: 16,
    },
    progressBarContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBarBackground: {
        width: '100%',
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#1976d2',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AlertDialogBox;