import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  fullscreen?: boolean;
}

export function Loading({ fullscreen = false }: Props) {
  if (fullscreen) {
    return (
      <View style={styles.full}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  return (
    <View style={styles.inline}>
      <ActivityIndicator size="small" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inline: { padding: 16, alignItems: 'center' },
});