import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  title: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, action }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});