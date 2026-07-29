import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { fetchByPeriod } from '../api/lottery';
import { DrawRecord } from '../types/models';
import { NumberBall } from '../components/NumberBall';
import { Loading } from '../components/Loading';
import { COLORS } from '../constants/colors';
import { getWeekday } from '../utils/date';
import { calcSimilarity } from '../utils/similarity';

type R = RouteProp<RootStackParamList, 'Detail'>;

export function DrawDetailScreen() {
  const { params } = useRoute<R>();
  const [record, setRecord] = useState<DrawRecord | null>(null);
  const [similar, setSimilar] = useState<number | null>(null);

  useEffect(() => {
    fetchByPeriod(params.period)
      .then((r) => {
        setRecord(r);
        // 演示用：用自身与最近一期对比相似度
        setSimilar(calcSimilarity({ front: r.front, back: r.back }, r));
      })
      .catch(() => setRecord(null));
  }, [params.period]);

  if (!record) return <Loading fullscreen />;

  const onShare = async () => {
    try {
      await Share.share({
        message: `第 ${record.period} 期\n前区: ${record.front.join(' ')}\n后区: ${record.back.join(' ')}`,
      });
    } catch (e) {
      console.warn('[share]', e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>第 {record.period} 期</Text>
        <Text style={styles.sub}>{record.drawDate.slice(0, 10)} · {getWeekday(record.weekday)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>前区号码</Text>
        <View style={styles.row}>
          {record.front.map((n) => (
            <NumberBall key={`f-${n}`} number={n} area="front" size="large" />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>后区号码</Text>
        <View style={styles.row}>
          {record.back.map((n) => (
            <NumberBall key={`b-${n}`} number={n} area="back" size="large" />
          ))}
        </View>
      </View>

      {record.jackpot && (
        <View style={styles.section}>
          <Text style={styles.meta}>奖池: {record.jackpot}</Text>
        </View>
      )}

      {similar !== null && (
        <View style={styles.section}>
          <Text style={styles.meta}>与本期相似度: {similar}%</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={onShare}>
        <Text style={styles.btnText}>分享</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  section: { backgroundColor: COLORS.surface, margin: 12, padding: 16, borderRadius: 10 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  meta: { fontSize: 14, color: COLORS.text },
  btn: {
    margin: 16,
    padding: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
});