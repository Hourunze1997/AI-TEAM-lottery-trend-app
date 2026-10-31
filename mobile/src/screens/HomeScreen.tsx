import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';

import StateView from './components/StateView';
import DrawBall from './components/DrawBall';
import TicketCard from './components/TicketCard';
import { useRefresh } from '../hooks/useRefresh';
import { fetchDraws } from '../api/draws';
import { fetchTickets } from '../api/picker';
import type { DrawListItem } from '../api/draws';
import type { TicketOut } from '../api/picker';

export default function HomeScreen() {
  const [latest, setLatest] = useState<DrawListItem | null>(null);
  const [tickets, setTickets] = useState<TicketOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [d, p] = await Promise.all([
        fetchDraws({ page: 1, page_size: 1 }),
        fetchTickets({ count: 2 }),
      ]);
      setLatest(d.items[0] ?? null);
      setTickets(p.tickets);
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

      <Text style={[styles.title, { marginTop: 24 }]}>随机选号</Text>
      <Text style={styles.pickHint}>随机生成，不构成任何推荐；开奖完全随机。</Text>
      {tickets.map((t, i) => (
        <TicketCard
          key={`${i}-${t.front_numbers.join('-')}-${t.back_numbers.join('-')}`}
          index={i + 1}
          ticket={t}
          highlight={highlightSet}
        />
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
  pickHint: { fontSize: 12, color: '#888', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  disclaimer: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 24 },
});
