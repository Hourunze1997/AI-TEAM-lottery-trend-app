import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';

import StateView from './components/StateView';
import DrawBall from './components/DrawBall';
import PredictionCard from './components/PredictionCard';
import { useRefresh } from '../hooks/useRefresh';
import { fetchDraws } from '../api/draws';
import { fetchPredictions } from '../api/predictions';
import type { DrawListItem, PredictionListOut } from '../api/predictions';

export default function HomeScreen() {
  const [latest, setLatest] = useState<DrawListItem | null>(null);
  const [predictions, setPredictions] = useState<PredictionListOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [d, p] = await Promise.all([
        fetchDraws({ page: 1, page_size: 1 }),
        fetchPredictions('next'),
      ]);
      setLatest(d.items[0] ?? null);
      setPredictions(p);
    } catch (e: any) {
      setError(e?.message ?? '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const { refreshing, onRefresh } = useRefresh(load);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <StateView.Loading />;
  if (error) return <StateView.Error message={error} onRetry={load} />;
  if (!latest) return <StateView.Empty message="暂无开奖数据" />;

  const highlightSet = new Set<number>([
    ...latest.front_numbers,
    ...latest.back_numbers,
  ]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>最近一期</Text>
      <Text style={styles.period}>{latest.period}</Text>
      <Text style={styles.label}>前区</Text>
      <View style={styles.row}>
        {latest.front_numbers.map((n) => (
          <DrawBall key={`f-${n}`} number={n} zone="front" highlight={highlightSet} />
        ))}
      </View>
      <Text style={styles.label}>后区</Text>
      <View style={styles.row}>
        {latest.back_numbers.map((n) => (
          <DrawBall key={`b-${n}`} number={n} zone="back" highlight={highlightSet} />
        ))}
      </View>

      <Text style={[styles.title, { marginTop: 24 }]}>下期推荐</Text>
      {predictions?.predictions?.map((p) => (
        <PredictionCard key={p.algorithm} prediction={p} highlight={highlightSet} />
      ))}

      <Text style={styles.disclaimer}>本站数据仅供参考，不构成投注建议。</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  period: { fontSize: 14, color: '#666', marginBottom: 12 },
  label: { fontSize: 14, color: '#444', marginTop: 4, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  disclaimer: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 24 },
});
