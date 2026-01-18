import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export const EmptyChat: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome name="comments" size={64} color="#ccc" />
        </View>

        <Text style={styles.title}>Welcome to Local LLM Chat</Text>
        <Text style={styles.subtitle}>Get started in 3 easy steps</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <FontAwesome name="download" size={16} color="#1976d2" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Download a Model</Text>
              </View>
              <Text style={styles.stepDescription}>
                Go to the Models tab and download your preferred LLM model
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <FontAwesome name="refresh" size={16} color="#1976d2" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Select Model</Text>
              </View>
              <Text style={styles.stepDescription}>
                Click the refresh icon below to select your downloaded model
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <FontAwesome name="comments-o" size={16} color="#1976d2" style={styles.stepIcon} />
                <Text style={styles.stepTitle}>Start Chatting</Text>
              </View>
              <Text style={styles.stepDescription}>
                Type your message and experience AI running locally on your device
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="info-circle" size={16} color="#666" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            All conversations run completely offline and private on your device
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepIcon: {
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 32,
    width: '100%',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
