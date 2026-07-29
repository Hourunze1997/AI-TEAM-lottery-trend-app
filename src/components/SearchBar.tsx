import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = '搜索期号' }: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="number-pad"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.surface },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
});