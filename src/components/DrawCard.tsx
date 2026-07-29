import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawRecord } from '../types/models';
import { NumberBall } from './NumberBall';
import { COLORS } from '../constants/colors';

interface Props {
  record: DrawRecord;
}

export function DrawCard({ record }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.period}>第 {record.period} 期</Text>
        <Text style={styles.date}>{record.drawDate.slice(0, 10)}</Text>
      </View>
      <View style={styles.row}>
        {record.front.map((n) => (
          <NumberBall key={`f-${n}`} number={n} area="front" />
        ))}
      </View>
      <View style={styles.row}>
        {record.back.map((n) => (
          <NumberBall key={`b-${n}`} number={n} area="back" size="small" />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  period: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textMuted },
  row: { flexDirection: 'row', marginVertical: 4 },
});