import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ball from './Ball';

interface NumberListProps {
  numbers: number[];
  type: 'front' | 'back';
  size?: number;
}

// 号码数组容器
export default function NumberList({ numbers, type, size = 36 }: NumberListProps) {
  return (
    <View style={styles.row}>
      {numbers.map((n, i) => (
        <Ball key={`${type}-${n}-${i}`} number={n} type={type} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});