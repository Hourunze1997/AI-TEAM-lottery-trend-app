import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useLotteryStore } from '../store/lotteryStore';
import NumberList from '../components/NumberList';
import EmptyState from '../components/EmptyState';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/helpers';
import { LotteryDraw } from '../models/types';

// 历史开奖列表
export default function HistoryScreen() {
  const {
    history,
    loading,
    hasMore,
    loadHistory,
  } = useLotteryStore();

  useEffect(() => {
    if (history.length === 0) loadHistory();
  }, [history.length, loadHistory]);

  const refresh = useCallback(async () => {
    // 重置分页：此处简化通过重新加载首页
    await loadHistory();
  }, [loadHistory]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) loadHistory();
  }, [hasMore, loading, loadHistory]);

  const renderItem = ({ item }: { item: LotteryDraw }) => (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.code}>第 {item.code} 期</Text>
        <Text style={styles.date}>{formatDate(item.date, 'YYYY-MM-DD')}</Text>
      </View>
      <View style={styles.balls}>
        <NumberList numbers={item.front} type="front" size={30} />
        <View style={styles.gap} />
        <NumberList numbers={item.back} type="back" size={30} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={
          history.length === 0 ? styles.emptyContent : styles.content
        }
        ListEmptyComponent={<EmptyState title="暂无开奖数据" />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 12 },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
  row: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  code: { fontSize: 14, fontWeight: '700', color: colors.text },
  date: { fontSize: 12, color: colors.textSecondary },
  balls: { flexDirection: 'row', alignItems: 'center' },
  gap: { width: 8 },
});