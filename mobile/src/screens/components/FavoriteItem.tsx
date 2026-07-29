import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

import DrawBall from './DrawBall';
import type { FavoriteOut } from '../../api/favorites';

interface Props {
  item: FavoriteOut;
  onDelete?: () => void;
  hideActions?: boolean;
}

export default function FavoriteItem({ item, onDelete, hideActions }: Props) {
  const confirm = () => {
    if (!onDelete) return;
    Alert.alert('删除收藏', '确定删除该收藏？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: onDelete },
    ]);
  };

  const highlight = new Set<number>([...item.front_numbers, ...item.back_numbers]);

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <View style={styles.balls}>
          {item.front_numbers.map((n) => (
            <DrawBall key={`f-${n}`} number={n} zone="front" small highlight={highlight} />
          ))}
          {item.back_numbers.map((n) => (
            <DrawBall key={`b-${n}`} number={n} zone="back" small highlight={highlight} />
          ))}
        </View>
        <Text style={styles.meta}>
          {item.tag ? `#${item.tag}  ` : ''}命中 {item.hit_count}
          {item.best_rank ? ` / 最佳 ${item.best_rank}` : ''}
        </Text>
      </View>
      {!hideActions && (
        <Pressable onPress={confirm} style={styles.del}>
          <Text style={styles.delText}>删除</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balls: { flexDirection: 'row', flexWrap: 'wrap' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  del: { paddingHorizontal: 10, paddingVertical: 6 },
  delText: { color: '#c00', fontSize: 13 },
});
