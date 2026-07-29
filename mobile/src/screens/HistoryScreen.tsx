import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';

import StateView from './components/StateView';
import DrawBall from './components/DrawBall';
import HighlightRules from './components/HighlightRules';
import { useDebounce } from '../hooks/useDebounce';
import { useRefresh } from '../hooks/useRefresh';
import { fetchDraws, fetchDrawByPeriod } from '../api/draws';
import type { DrawListItem, DrawOut } from '../api/draws';

type HighlightMode = 'favorites' | 'prediction' | 'latest';

export default function HistoryScreen() {
  const [keyword, setKeyword] = useState('');
  const debounced = useDebounce(keyword, 400);
  const [items, setItems] = useState<DrawListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [active, setActive] = useState<DrawOut | null>(null);
  const [mode, setMode] = useState<HighlightMode>('favorites');

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchDraws({ page: 1, page_size: 30, keyword: debounced || undefined });
      setItems(res.items);
    } catch (e: any) {
      setError(e?.message ?? '加载失败');
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  const { refreshing, onRefresh } = useRefresh(load);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (period: string) => {
    try {
      const d = await fetchDrawByPeriod(period, { highlight: mode });
      setActive(d);
      setModalVisible(true);
    } catch (e) {
      // ignore
    }
  };

  if (loading) return <StateView.Loading />;
  if (error) return <StateView.Error message={error} onRetry={load} />;
  if (!items.length) return <StateView.Empty message="暂无数据" />;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="搜索期号"
        value={keyword}
        onChangeText={setKeyword}
        style={styles.input}
      />
      <HighlightRules mode={mode} onChange={setMode} />
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openDetail(item.period)}>
            <Text style={styles.period}>{item.period}</Text>
            <View style={styles.balls}>
              {item.front_numbers.map((n) => (
                <DrawBall key={`f-${n}`} number={n} zone="front" small />
              ))}
              <Text style={styles.divider}>|</Text>
              {item.back_numbers.map((n) => (
                <DrawBall key={`b-${n}`} number={n} zone="back" small />
              ))}
            </View>
          </Pressable>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{active?.period}</Text>
          <View style={styles.balls}>
            {active?.front_numbers.map((n) => (
              <DrawBall key={`f-${n}`} number={n} zone="front" />
            ))}
          </View>
          <View style={styles.balls}>
            {active?.back_numbers.map((n) => (
              <DrawBall key={`b-${n}`} number={n} zone="back" />
            ))}
          </View>
          <Pressable style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>关闭</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  period: { width: 90, fontSize: 13 },
  balls: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  divider: { marginHorizontal: 6, color: '#999' },
  modal: { flex: 1, padding: 20, marginTop: 40 },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  closeBtn: {
    marginTop: 24,
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: { fontSize: 14 },
});
