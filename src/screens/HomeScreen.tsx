import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLotteryStore } from '../store/lotteryStore';
import { useFavoriteStore } from '../store/favoriteStore';
import NumberList from '../components/NumberList';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/helpers';

// 首页：最新开奖、入口卡片
export default function HomeScreen({ navigation }: any) {
  const { latest, loadLatest, loadHistory, history } = useLotteryStore();
  const { favorites, hydrate: hydrateFav } = useFavoriteStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    hydrateFav();
    loadLatest();
    if (history.length === 0) loadHistory();
  }, [hydrateFav, loadLatest, loadHistory, history.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLatest();
    setRefreshing(false);
  };

  // Tab 名称严格匹配 RootNavigator 中的 PascalCase
  const cards = [
    { key: 'History', label: '历史开奖', sub: '全部期次' },
    { key: 'Trend', label: '走势分析', sub: '冷热/遗漏' },
    { key: 'Picker', label: '随机选号', sub: '纯随机·观感规则' },
    { key: 'Favorite', label: '我的收藏', sub: `${favorites.length} 组` },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.h1}>彩票走势</Text>
      <Text style={styles.sub}>大乐透 · 综合数据分析</Text>

      <View style={styles.latestCard}>
        <View style={styles.latestHeader}>
          <Text style={styles.code}>
            第 {latest?.code || '--'} 期
          </Text>
          <Text style={styles.date}>
            {latest ? formatDate(latest.date, 'YYYY-MM-DD') : '--'}
          </Text>
        </View>
        <View style={styles.numbers}>
          <NumberList numbers={latest?.front || []} type="front" />
          <View style={styles.divider} />
          <NumberList numbers={latest?.back || []} type="back" />
        </View>
      </View>

      <View style={styles.grid}>
        {cards.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={styles.entryCard}
            onPress={() => navigation.navigate(c.key)}
          >
            <Text style={styles.entryLabel}>{c.label}</Text>
            <Text style={styles.entrySub}>{c.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  h1: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
  latestCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  code: { fontSize: 16, fontWeight: '700', color: colors.text },
  date: { fontSize: 13, color: colors.textSecondary },
  numbers: { alignItems: 'center' },
  divider: { width: 1, height: 16, marginVertical: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  entryCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  entryLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  entrySub: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});