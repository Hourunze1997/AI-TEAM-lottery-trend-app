import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { scheduleReminder, cancelReminder, getReminder, requestPermission } from '../services/notification';
import { Reminder } from '../types/models';
import { clear } from '../services/storage';
import { SectionTitle } from '../components/SectionTitle';
import { COLORS } from '../constants/colors';

export function SettingsScreen() {
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getReminder().then((r) => {
      if (r) {
        setReminder(r);
        setEnabled(r.enabled);
      }
    });
  }, []);

  const toggleReminder = async (value: boolean) => {
    if (!reminder) return;
    if (value) {
      const ok = await requestPermission();
      if (!ok) {
        Alert.alert('未授予通知权限');
        return;
      }
      const id = await scheduleReminder(reminder);
      setReminder({ ...reminder, notifId: id, enabled: true });
      setEnabled(true);
    } else {
      if (reminder.notifId) await cancelReminder(reminder.notifId);
      setEnabled(false);
    }
  };

  const onClearCache = () => {
    Alert.alert('清除缓存', '将清空所有本地数据，是否继续？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          await clear();
          Alert.alert('已清除');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <SectionTitle title="开奖提醒" />
      <View style={styles.row}>
        <Text style={styles.label}>每周开奖日提醒</Text>
        <Switch value={enabled} onValueChange={toggleReminder} />
      </View>
      {reminder?.notifId && (
        <Text style={styles.hint}>已设置: 周{reminder.weekday === 1 ? '一' : reminder.weekday === 3 ? '三' : '六'} {String(reminder.hour).padStart(2, '0')}:{String(reminder.minute).padStart(2, '0')}</Text>
      )}

      <SectionTitle title="存储" />
      <TouchableOpacity style={styles.btn} onPress={onClearCache}>
        <Text style={styles.btnText}>清除缓存</Text>
      </TouchableOpacity>

      <SectionTitle title="关于" />
      <View style={styles.about}>
        <Text style={styles.aboutText}>大乐透走势分析 v1.0.0</Text>
        <Text style={styles.aboutText}>仅供娱乐参考，请理性购彩</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  label: { fontSize: 14, color: COLORS.text },
  hint: { fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 20, paddingVertical: 6 },
  btn: {
    margin: 12,
    padding: 14,
    backgroundColor: COLORS.textMuted,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  about: { padding: 16 },
  aboutText: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
});