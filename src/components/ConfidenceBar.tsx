import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  value: number; // 0-100
}

export function ConfidenceBar({ value }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.text}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  text: { marginLeft: 8, fontSize: 12, color: COLORS.text, fontWeight: '700' },
});