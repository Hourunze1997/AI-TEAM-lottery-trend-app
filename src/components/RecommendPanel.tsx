import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Recommendation } from '../types/models';
import { NumberBall } from './NumberBall';
import { COLORS } from '../constants/colors';

interface Props {
  recommendation: Recommendation;
}

export function RecommendPanel({ recommendation }: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.algo}>算法: {recommendation.algorithm}</Text>
        <Text style={styles.conf}>置信度 {recommendation.confidence}%</Text>
      </View>
      <Text style={styles.label}>前区</Text>
      <View style={styles.row}>
        {recommendation.front.map((n) => (
          <NumberBall key={`f-${n}`} number={n} area="front" size="large" />
        ))}
      </View>
      <Text style={styles.label}>后区</Text>
      <View style={styles.row}>
        {recommendation.back.map((n) => (
          <NumberBall key={`b-${n}`} number={n} area="back" size="large" />
        ))}
      </View>
      <Text style={styles.reason}>{recommendation.reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 12,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  algo: { fontWeight: '700', color: COLORS.text },
  conf: { color: COLORS.primary, fontWeight: '700' },
  label: { fontSize: 12, color: COLORS.textMuted, marginTop: 8 },
  row: { flexDirection: 'row', marginVertical: 6 },
  reason: { fontSize: 12, color: COLORS.textMuted, marginTop: 8, fontStyle: 'italic' },
});