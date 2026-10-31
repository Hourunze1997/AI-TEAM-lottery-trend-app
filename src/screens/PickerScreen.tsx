import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLotteryStore } from '../store/lotteryStore';
import { useFavoriteStore } from '../store/favoriteStore';
import { buildStatList } from '../services/statsService';
import { generateTickets, DISCLAIMER, PickerTicket, PickerOptions } from '../services/picker';
import NumberList from '../components/NumberList';
import StatCard from '../components/StatCard';
import { colors } from '../theme/colors';
import { uuid } from '../utils/helpers';

// 随机选号页：号码纯随机生成，连号/和值只是观感规则，不影响中奖概率
export default function PickerScreen() {
  const { history } = useLotteryStore();
  const { add } = useFavoriteStore();
  const [tickets, setTickets] = useState<PickerTicket[]>([]);
  const [maxRun2, setMaxRun2] = useState(false);   // 连号上限 ≤ 2
  const [sumFilter, setSumFilter] = useState(false); // 和值 60~140
  const [error, setError] = useState<string | null>(null);

  const statList = useMemo(() => buildStatList(history), [history]);

  const regenerate = () => {
    try {
      setError(null);
      const opts: PickerOptions = {
        ...(maxRun2 ? { maxConsecutive: 2 } : {}),
        ...(sumFilter ? { sumRange: [60, 140] as [number, number] } : {}),
      };
      setTickets(generateTickets(5, opts));
    } catch (e: any) {
      setError(e?.message ?? '生成失败');
    }
  };

  const saveFavorite = async (t: PickerTicket) => {
    try {
      await add({
        id: uuid(),
        front: t.front,
        back: t.back,
        notify: true,
        createdAt: Date.now(),
      });
      Alert.alert('已收藏', '已加入我的收藏');
    } catch (e) {
      Alert.alert('失败', '收藏失败，请重试');
    }
  };

  // 历史统计（仅供参考展示，与选号无关）
  const hotList = [...statList].sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  const coldList = [...statList].sort((a, b) => a.frequency - b.frequency).slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h1}>随机选号</Text>
      <Text style={styles.sub}>号码纯随机生成；连号、和值只是观感偏好，不影响中奖概率</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.chip, maxRun2 && styles.chipOn]}
          onPress={() => setMaxRun2((v) => !v)}
        >
          <Text style={maxRun2 ? styles.chipTextOn : styles.chipText}>连号 ≤ 2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, sumFilter && styles.chipOn]}
          onPress={() => setSumFilter((v) => !v)}
        >
          <Text style={sumFilter ? styles.chipTextOn : styles.chipText}>和值 60~140</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={regenerate}>
        <Text style={styles.btnText}>{tickets.length ? '换一批' : '生成 5 注'}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {tickets.map((t) => (
        <View key={t.id} style={styles.card}>
          <View style={styles.numbers}>
            <NumberList numbers={t.front} type="front" />
            <View style={styles.divider} />
            <NumberList numbers={t.back} type="back" />
          </View>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => saveFavorite(t)}>
            <Text style={[styles.btnText, { color: colors.primary }]}>收藏该组</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.row}>
        <View style={[styles.smallCard, { marginRight: 8 }]}>
          <Text style={styles.title}>历史热号 Top5</Text>
          <View style={styles.tags}>
            {hotList.map((s) => (
              <View key={`hot-${s.number}`} style={[styles.tag, { backgroundColor: colors.redBallBg }]}>
                <Text style={[styles.tagText, { color: colors.redBall }]}>{s.number}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>仅为历史统计，与未来开奖无关</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.title}>历史冷号 Top5</Text>
          <View style={styles.tags}>
            {coldList.map((s) => (
              <View key={`cold-${s.number}`} style={[styles.tag, { backgroundColor: colors.blueBallBg }]}>
                <Text style={[styles.tagText, { color: colors.blueBall }]}>{s.number}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>仅为历史统计，与未来开奖无关</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>本期指标</Text>
        <View style={styles.row}>
          <StatCard title="样本期数" value={history.length} hint="历史数据" />
          <StatCard title="热号数" value={statList.filter((s) => s.hot).length} />
          <StatCard title="冷号数" value={statList.filter((s) => !s.hot).length} />
        </View>
      </View>

      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  h1: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  numbers: { alignItems: 'center', paddingVertical: 8 },
  divider: { width: 1, height: 16, marginVertical: 8 },
  row: { flexDirection: 'row', marginVertical: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13 },
  chipTextOn: { color: '#fff', fontSize: 13, fontWeight: '700' },
  btn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { borderWidth: 1, borderColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '700' },
  error: { color: colors.redBall, fontSize: 12, textAlign: 'center', marginVertical: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 3,
  },
  tagText: { fontWeight: '700' },
  note: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
  disclaimer: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginVertical: 16 },
});
