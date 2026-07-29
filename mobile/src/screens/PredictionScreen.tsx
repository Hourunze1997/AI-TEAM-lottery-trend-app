import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';

import StateView from './components/StateView';
import PredictionCard from './components/PredictionCard';
import HighlightRules from './components/HighlightRules';
import { useRefresh } from '../hooks/useRefresh';
import { fetchPredictions } from '../api/predictions';
import type { PredictionListOut } from '../api/predictions';

export default function PredictionScreen() {
  const [data, setData] = useState<PredictionListOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchPredictions('next');
      setData(res);
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
  if (!data) return <StateView.Empty message="暂无预测" />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.target}>目标期号：{data.target_period}</Text>
      <Text style={styles.hint}>以下按固定顺序展示：冷热 → 遗漏 → 均值回归 → 随机</Text>
      <HighlightRules />
      {data.predictions.map((p) => (
        <PredictionCard key={p.algorithm} prediction={p} />
      ))}
      <Text style={styles.disclaimer}>本站数据仅供参考，不构成投注建议。</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  target: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 12 },
  disclaimer: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 24 },
});
