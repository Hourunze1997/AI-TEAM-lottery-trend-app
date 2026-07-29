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
import { generateRecommend } from '../services/recommendService';
import NumberList from '../components/NumberList';
import StatCard from '../components/StatCard';
import { colors } from '../theme/colors';
import { uuid } from '../utils/helpers';
import { RecommendSet } from '../models/types';

// 智能推荐页
export default function RecommendScreen() {
  const { history } = useLotteryStore();
  const { add } = useFavoriteStore();
  const [current, setCurrent] = useState<RecommendSet | null>(null);

  const statList = useMemo(() => buildStatList(history), [history]);

  const regenerate = () => {
    if (statList.length === 0) {
      Alert.alert('提示', '暂无历史数据，请稍后再试');
      return;
    }
    const r = generateRecommend(statList, 5);
    setCurrent(r);
  };

  const saveFavorite = async () => {
    if (!current) return;
    try {
      await add({
        id: current.id || uuid(),
        front: current.front,
        back: current.back,
        notify: true,
        createdAt: Date.now(),
      });
      Alert.alert('已收藏', '已加入我的收藏');
    } catch (e) {
      Alert.alert('失败', '收藏失败，请重试');
    }
  };

  // 冷热榜
  const hotList = [...statList].sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  const coldList = [...statList].sort((a, b) => a.frequency - b.frequency).slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h1}>智能推荐</Text>
      <Text style={styles.sub}>综合热度、遗漏与区间均衡</Text>

      <View style={styles.card}>
        <Text style={styles.title}>推荐号码</Text>
        {current ? (
          <>
            <View style={styles.numbers}>
              <NumberList numbers={current.front} type="front" />
              <View style={styles.divider} />
              <NumberList numbers={current.back} type="back" />
            </View>
            <Text style={styles.reason}>{current.reason}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={regenerate}>
                <Text style={styles.btnText}>换一组</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={saveFavorite}>
                <Text style={[styles.btnText, { color: colors.primary }]}>收藏</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyHint}>点击下方按钮生成推荐</Text>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={regenerate}>
              <Text style={styles.btnText}>生成推荐</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.smallCard, { marginRight: 8 }]}>
          <Text style={styles.title}>热号 Top5</Text>
          <View style={styles.tags}>
            {hotList.map((s) => (
              <View key={`hot-${s.number}`} style={[styles.tag, { backgroundColor: colors.redBallBg }]}>
                <Text style={[styles.tagText, { color: colors.redBall }]}>{s.number}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.title}>冷号 Top5</Text>
          <View style={styles.tags}>
            {coldList.map((s) => (
              <View key={`cold-${s.number}`} style={[styles.tag, { backgroundColor: colors.blueBallBg }]}>
                <Text style={[styles.tagText, { color: colors.blueBall }]}>{s.number}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>本期指标</Text>
        <View style={styles.row}>
          <StatCard title="样本期数" value={history.length} hint="历史数据" />
          <StatCard title="热号数" value={statList.filter((s) => s.hot).length} />
          <StatCard title="推荐置信" value={current ? current.score.toFixed(2) : '--'} />
        </View>
      </View>
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
  reason: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  row: { flexDirection: 'row' },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { borderWidth: 1, borderColor: colors.primary },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 12 },
  emptyHint: { color: colors.textSecondary, marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 3,
  },
  tagText: { fontWeight: '700' },
});