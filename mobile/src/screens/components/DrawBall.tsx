import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  number: number;
  zone?: 'front' | 'back';
  highlight?: Set<number>;
  small?: boolean;
}

export default function DrawBall({ number, zone = 'front', highlight, small }: Props) {
  const isHighlight = highlight?.has(number) ?? false;
  const size = small ? 28 : 36;
  const fontSize = small ? 12 : 14;
  const bg = zone === 'front' ? '#e74c3c' : '#3498db';

  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: isHighlight ? 3 : 0,
          borderColor: isHighlight ? '#ffcc00' : 'transparent',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
