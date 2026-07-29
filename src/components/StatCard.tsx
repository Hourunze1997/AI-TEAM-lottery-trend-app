import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  color?: string;
}

// 统计卡片
export default function StatCard({ title, value, hint, color }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
});