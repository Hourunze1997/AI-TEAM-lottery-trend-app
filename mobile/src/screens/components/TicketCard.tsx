import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

import DrawBall from './DrawBall';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { TicketOut } from '../../api/picker';
import { createFavorite } from '../../api/favorites';
import { upsertFavorite } from '../../store/favoritesSlice';

interface Props {
  index: number;
  ticket: TicketOut;
  highlight?: Set<number>;
}

export default function TicketCard({ index, ticket, highlight }: Props) {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);

  const saveAsFavorite = async () => {
    if (!token) {
      Alert.alert('请先登录');
      return;
    }
    try {
      const fav = await createFavorite({
        front_numbers: ticket.front_numbers,
        back_numbers: ticket.back_numbers,
        tag: `随机选号 #${index}`,
      });
      dispatch(upsertFavorite(fav));
      Alert.alert('已加入收藏');
    } catch (e: any) {
      Alert.alert('收藏失败', e?.message ?? '');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>第 {index} 注（随机生成）</Text>
      <View style={styles.row}>
        {ticket.front_numbers.map((n) => (
          <DrawBall key={`f-${n}`} number={n} zone="front" highlight={highlight} />
        ))}
      </View>
      <View style={styles.row}>
        {ticket.back_numbers.map((n) => (
          <DrawBall key={`b-${n}`} number={n} zone="back" highlight={highlight} />
        ))}
      </View>
      <Pressable style={styles.btn} onPress={saveAsFavorite}>
        <Text style={styles.btnText}>收藏该组</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  label: { fontSize: 13, color: '#666', marginBottom: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 },
  btn: {
    marginTop: 6,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffcc00',
    borderRadius: 14,
  },
  btnText: { fontSize: 12, fontWeight: '600' },
});
