import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  mode?: 'favorites' | 'latest';
  onChange?: (mode: 'favorites' | 'latest') => void;
}

const RULES: { key: 'favorites' | 'latest'; label: string; color: string }[] = [
  { key: 'favorites', label: '对比收藏', color: '#ffcc00' },
  { key: 'latest', label: '对比最近一期', color: '#3498db' },
];

export default function HighlightRules({ mode, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>高亮：</Text>
      {RULES.map((r) => {
        const active = mode === r.key;
        return (
          <Pressable
            key={r.key}
            onPress={() => onChange?.(r.key)}
            style={[styles.item, active && styles.active]}
          >
            <View style={[styles.dot, { backgroundColor: r.color }]} />
            <Text style={styles.itemText}>{r.label}</Text>
          </Pressable>
        );
      })}
      {!onChange && <Text style={styles.tip}>黄边表示高亮命中</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginVertical: 8 },
  label: { fontSize: 12, color: '#666' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f4f4f4',
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  active: { backgroundColor: '#fff5cc' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  itemText: { fontSize: 12 },
  tip: { fontSize: 12, color: '#999', marginLeft: 4 },
});
