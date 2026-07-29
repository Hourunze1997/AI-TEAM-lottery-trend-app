import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';

import DrawBall from './DrawBall';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { PredictionOut } from '../../api/predictions';
import { createFavorite } from '../../api/favorites';
import { upsertFavorite } from '../../store/favoritesSlice';

interface Props {
  prediction: PredictionOut;
  highlight?: Set<number>;
}

export default function PredictionCard({ prediction, highlight }: Props) {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);

  const saveAsFavorite = async () => {
    if (!token) {
      Alert.alert('请先登录');
      return;
    }
    try {
      const fav = await createFavorite({
        front_numbers: prediction.front_numbers,
        back_numbers: prediction.back_numbers,
        tag: prediction.algorithm_label,
      });
      dispatch(upsertFavorite(fav));
      Alert.alert('已加入收藏');
    } catch (e: any) {
      Alert.alert('收藏失败', e?.message ?? '');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.algo}>{prediction.algorithm_label}</Text>
        <Text style={styles.conf}>置信度 {(prediction.confidence * 100).toFixed(0)}%</Text>
      </View>
      {prediction.rationale && <Text style={styles.rationale}>{prediction.rationale}</Text>}
      <View style={styles.row}>
        {prediction.front_numbers.map((n) => (
          <DrawBall key={`f-${n}`} number={n} zone="front" highlight={highlight} />
        ))}
      </View>
      <View style={styles.row}>
        {prediction.back_numbers.map((n) => (
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
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  algo: { fontSize: 15, fontWeight: '600' },
  conf: { fontSize: 12, color: '#666' },
  rationale: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 6 },
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
