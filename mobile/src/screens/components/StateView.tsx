import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

function Skeleton() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.tip}>加载中...</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📭</Text>
      <Text style={styles.tip}>{message}</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={[styles.tip, { color: '#c00' }]}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>重试</Text>
        </Pressable>
      )}
    </View>
  );
}

const StateView = {
  Loading: Skeleton,
  Empty: EmptyState,
  Error: ErrorState,
};

export default StateView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: { fontSize: 40, marginBottom: 8 },
  tip: { fontSize: 14, color: '#666', textAlign: 'center' },
  retry: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ffcc00',
    borderRadius: 16,
  },
  retryText: { fontWeight: '600' },
});
