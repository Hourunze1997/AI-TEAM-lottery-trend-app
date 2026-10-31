import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import StateView from './components/StateView';
import TicketCard from './components/TicketCard';
import { fetchTickets } from '../api/picker';
import type { PickerOut } from '../api/picker';
import { extractError } from '../api/client';

const COUNTS = [1, 5, 10];

export default function PickerScreen() {
  const [data, setData] = useState<PickerOut | null>(null);
  const [count, setCount] = useState(5);
  const [maxRun2, setMaxRun2] = useState(false); // 连号上限 ≤ 2
  const [sumFilter, setSumFilter] = useState(false); // 和值 60~140
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchTickets({
        count,
        max_consecutive: maxRun2 ? 2 : undefined,
        ...(sumFilter ? { sum_min: 60, sum_max: 140 } : {}),
      });
      setData(res);
    } catch (e) {
      setError(extractError(e).message);
    } finally {
      setLoading(false);
    }
  }, [count, maxRun2, sumFilter]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>随机选号</Text>
      <Text style={styles.hint}>
        号码由服务端随机生成；连号、和值只是观感偏好，不影响中奖概率。
      </Text>

      <View style={styles.row}>
        {COUNTS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCount(c)}
            style={[styles.chip, count === c && styles.chipOn]}
          >
            <Text style={count === c ? styles.chipTextOn : styles.chipText}>{c} 注</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Pressable
          onPress={() => setMaxRun2((v) => !v)}
          style={[styles.chip, maxRun2 && styles.chipOn]}
        >
          <Text style={maxRun2 ? styles.chipTextOn : styles.chipText}>连号 ≤ 2</Text>
        </Pressable>
        <Pressable
          onPress={() => setSumFilter((v) => !v)}
          style={[styles.chip, sumFilter && styles.chipOn]}
        >
          <Text style={sumFilter ? styles.chipTextOn : styles.chipText}>和值 60~140</Text>
        </Pressable>
      </View>

      <Pressable style={styles.btn} onPress={generate} disabled={loading}>
        <Text style={styles.btnText}>{loading ? '生成中…' : data ? '换一批' : '生成号码'}</Text>
      </Pressable>

      {error && <StateView.Error message={error} onRetry={generate} />}
      {data?.rules?.note ? <Text style={styles.ruleNote}>{data.rules.note}</Text> : null}
      {data?.tickets.map((t, i) => (
        <TicketCard
          key={`${t.front_numbers.join('-')}-${t.back_numbers.join('-')}-${i}`}
          index={i + 1}
          ticket={t}
        />
      ))}

      {data && <Text style={styles.disclaimer}>{data.disclaimer}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  hint: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f4f4f4',
    borderRadius: 14,
    marginRight: 8,
  },
  chipOn: { backgroundColor: '#fff5cc' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextOn: { fontSize: 13, fontWeight: '600' },
  btn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffcc00',
    borderRadius: 18,
    marginVertical: 8,
  },
  btnText: { fontSize: 14, fontWeight: '600' },
  ruleNote: { fontSize: 12, color: '#2e7d32', marginBottom: 8 },
  disclaimer: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 24 },
});
