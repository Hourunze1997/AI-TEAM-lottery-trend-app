import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import StateView from './components/StateView';
import { useRefresh } from '../hooks/useRefresh';
import { fetchFrequencies } from '../api/frequencies';
import type { NumberFrequencyOut } from '../api/frequencies';

const screenWidth = Dimensions.get('window').width;

export default function TrendScreen() {
  const [zone, setZone] = useState<'front' | 'back'>('front');
  const [range, setRange] = useState<'30' | '60' | 'all'>('30');
  const [data, setData] = useState<NumberFrequencyOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchFrequencies({ zone, range });
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? '加载失败');
    } finally {
      setLoading(false);
    }
  }, [zone, range]);

  const { refreshing, onRefresh } = useRefresh(load);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <StateView.Loading />;
  if (error) return <StateView.Error message={error} onRetry={load} />;
  if (!data.length) return <StateView.Empty message="暂无走势数据" />;

  const labels = data.map((d) => String(d.number));
  const values = data.map((d) => d.count);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      <Text style={styles.title}>号码冷热分布</Text>
      <Text style={styles.subtitle}>
        区: {zone === 'front' ? '前区' : '后区'} / 范围: {range}
      </Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: values }],
        }}
        width={screenWidth - 24}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 99, 71, ${opacity})`,
          labelColor: () => '#666',
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
      <View style={styles.btnRow}>
        {(['front', 'back'] as const).map((z) => (
          <Text
            key={z}
            onPress={() => setZone(z)}
            style={[styles.btn, zone === z && styles.btnActive]}
          >
            {z === 'front' ? '前区' : '后区'}
          </Text>
        ))}
      </View>
      <View style={styles.btnRow}>
        {(['30', '60', 'all'] as const).map((r) => (
          <Text
            key={r}
            onPress={() => setRange(r)}
            style={[styles.btn, range === r && styles.btnActive]}
          >
            {r === 'all' ? '全部' : `近${r}期`}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  btnRow: { flexDirection: 'row', marginTop: 12 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 16,
    marginRight: 8,
    fontSize: 13,
    overflow: 'hidden',
  },
  btnActive: { backgroundColor: '#ffcc00' },
});
