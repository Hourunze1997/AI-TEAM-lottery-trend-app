import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useLotteryStore } from '../store/lotteryStore';
import { buildStatList, calcOddEven, calcZoneRatio } from '../services/statsService';
import StatCard from '../components/StatCard';
import NumberList from '../components/NumberList';
import { colors } from '../theme/colors';
import { FRONT_ZONES, BACK_ZONES, TREND_PERIODS } from '../utils/constants';

// 趋势分析页
export default function TrendScreen() {
  const { history } = useLotteryStore();

  const statList = useMemo(() => buildStatList(history), [history]);
  const latest = history[0];

  // 频次 Top10 折线图数据
  const topStats = useMemo(() => {
    const sorted = [...statList].sort((a, b) => b.frequency - a.frequency).slice(0, TREND_PERIODS);
    return sorted;
  }, [statList]);

  const oddEven = latest ? calcOddEven(latest.front) : { odd: 0, even: 0 };
  const zoneRatio = latest ? calcZoneRatio(latest.front, FRONT_ZONES) : [];
  const backOddEven = latest ? calcOddEven(latest.back) : { odd: 0, even: 0 };

  const chartData = {
    labels: topStats.map((s) => String(s.number)).slice(0, 6),
    datasets: [
      {
        data: topStats.map((s) => s.frequency),
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const screenW = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h1}>走势分析</Text>
      <Text style={styles.sub}>基于近 {history.length} 期数据</Text>

      <View style={styles.row}>
        <StatCard title="前区奇偶" value={`${oddEven.odd}:${oddEven.even}`} hint="最新一期" />
        <StatCard title="后区奇偶" value={`${backOddEven.odd}:${backOddEven.even}`} hint="最新一期" />
        <StatCard title="热号数" value={statList.filter((s) => s.hot).length} hint="频次>=均值" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>频次 Top {topStats.length}</Text>
        {topStats.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenW - 48}
            height={180}
            chartConfig={{
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
              labelColor: () => colors.textSecondary,
            }}
            bezier
            style={{ borderRadius: 8 }}
          />
        ) : (
          <Text style={styles.placeholder}>暂无数据</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>最新一期区间分布</Text>
        <View style={styles.zoneRow}>
          {zoneRatio.map((c, i) => (
            <View key={i} style={styles.zoneBox}>
              <Text style={styles.zoneCount}>{c}</Text>
              <Text style={styles.zoneLabel}>区{i + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>最近 5 期号码</Text>
        {history.slice(0, 5).map((d) => (
          <View key={d.id} style={styles.historyRow}>
            <Text style={styles.historyCode}>{d.code}</Text>
            <NumberList numbers={d.front} type="front" size={28} />
            <View style={{ width: 8 }} />
            <NumberList numbers={d.back} type="back" size={28} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  placeholder: { color: colors.textSecondary, padding: 16, textAlign: 'center' },
  zoneRow: { flexDirection: 'row', justifyContent: 'space-around' },
  zoneBox: { alignItems: 'center' },
  zoneCount: { fontSize: 20, fontWeight: '700', color: colors.primary },
  zoneLabel: { fontSize: 12, color: colors.textSecondary },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyCode: { width: 80, fontSize: 12, color: colors.textSecondary },
});