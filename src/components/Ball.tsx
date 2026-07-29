import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface BallProps {
  number: number;
  type: 'front' | 'back';
  size?: number;
}

// 单个号码球
export default function Ball({ number, type, size = 36 }: BallProps) {
  const bg = type === 'front' ? colors.redBall : colors.blueBall;
  const fg = '#fff';
  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.42, color: fg }]}>
        {number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  text: {
    fontWeight: '700',
  },
});