import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Favorite } from '../types/models';
import { NumberBall } from './NumberBall';
import { COLORS } from '../constants/colors';

interface Props {
  favorite: Favorite;
  onCompare?: () => void;
  onRemove?: () => void;
}

export function FavoriteItem({ favorite, onCompare, onRemove }: Props) {
  const totalHits = favorite.matchedHistory.reduce(
    (acc, m) => acc + (m.frontHit > 0 || m.backHit > 0 ? 1 : 0),
    0,
  );
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{favorite.label ?? '我的收藏'}</Text>
      <View style={styles.row}>
        {favorite.front.map((n) => (
          <NumberBall key={`f-${n}`} number={n} area="front" size="small" />
        ))}
      </View>
      <View style={styles.row}>
        {favorite.back.map((n) => (
          <NumberBall key={`b-${n}`} number={n} area="back" size="small" />
        ))}
      </View>
      <Text style={styles.meta}>命中历史 {totalHits} 期 · 创建于 {favorite.createdAt.slice(0, 10)}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCompare} style={[styles.btn, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.btnText}>对比</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={[styles.btn, { backgroundColor: COLORS.textMuted }]}>
          <Text style={styles.btnText}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    margin: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  row: { flexDirection: 'row', marginVertical: 2 },
  meta: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 8 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});