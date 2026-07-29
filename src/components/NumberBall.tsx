import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  number: number;
  area: 'front' | 'back';
  size?: 'small' | 'medium' | 'large';
}

export function NumberBall({ number, area, size = 'medium' }: Props) {
  const dim = size === 'small' ? 28 : size === 'large' ? 44 : 36;
  const bg = area === 'front' ? COLORS.frontBall : COLORS.backBall;
  return (
    <View
      style={[
        styles.ball,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.text, { fontSize: dim * 0.45 }]}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});