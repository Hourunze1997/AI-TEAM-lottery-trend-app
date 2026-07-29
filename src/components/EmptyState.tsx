import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  title?: string;
  hint?: string;
}

// 空数据占位
export default function EmptyState({
  title = '暂无数据',
  hint = '下拉刷新试试',
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});