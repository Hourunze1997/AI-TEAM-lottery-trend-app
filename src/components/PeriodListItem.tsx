import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawRecord } from '../types/models';
import { NumberBall } from './NumberBall';
import { COLORS } from '../constants/colors';

interface Props {
  record: DrawRecord;
  onPress?: () => void;
}

export function PeriodListItem({ record, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.period}>第 {record.period} 期</Text>
        <Text style={styles.date}>{record.drawDate.slice(0, 10)}</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.row}>
          {record.front.map((n) => (
            <NumberBall key={`f-${n}`} number={n} area="front" size="small" />
          ))}
        </View>
        <View style={styles.row}>
          {record.back.map((n) => (
            <NumberBall key={`b-${n}`} number={n} area="back" size="small" />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  left: { flex: 1 },
  right: { flex: 2 },
  row: { flexDirection: 'row', marginVertical: 2 },
  period: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
});