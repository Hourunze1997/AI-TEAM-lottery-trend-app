import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { scheduleReminder, cancelReminder, getReminder, requestPermission } from '../services/notification';
import { Reminder } from '../types/models';
import { clear, saveItem, loadItem } from '../services/storageService';
import { SectionTitle } from '../components/SectionTitle';
import { COLORS } from '../constants/colors';
import { getCurrentDataSource, refreshData, DATA_SOURCE_URL } from '../api/lottery';
import { DataSourceMeta } from '../services/publicData';
import { setRuntimeBaseURL } from '../api/client';

export function SettingsScreen() {
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [enabled, setEnabled] = useState(false);

  const [meta, setMeta] = useState<DataSourceMeta | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [backendURL, setBackendURL] = useState('');
  const [savingURL, setSavingURL] = useState(false);

  useEffect(() => {
    getReminder().then((r) => {
      if (r) {
        setReminder(r);
        setEnabled(r.enabled);
      }
    });
    getCurrentDataSource().then(setMeta).catch(() => undefined);
    loadItem<string>('@lottery/api_base_url').then((v) => {
      if (v) setBackendURL(v);
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
    Alert.alert('清除缓存', '将清空所有本地数据（不清除后端 URL），是否继续？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          // 保留后端 URL
          const keepURL = backendURL;
          await clear();
          if (keepURL) {
            await saveItem('@lottery/api_base_url', keepURL);
            setRuntimeBaseURL(keepURL);
          }
          Alert.alert('已清除');
        },
      },
    ]);
  };

  const onRefreshData = async () => {
    setRefreshing(true);
    try {
      const newMeta = await refreshData();
      setMeta(newMeta);
      Alert.alert(
        '刷新完成',
        `数据来源：${labelOf(newMeta)}\n期数：${newMeta.count}`,
      );
    } catch (e: any) {
      Alert.alert('刷新失败', String(e?.message || e));
    } finally {
      setRefreshing(false);
    }
  };

  const onSaveBackendURL = async () => {
    const trimmed = backendURL.trim();
    setSavingURL(true);
    try {
      if (!trimmed) {
        await saveItem('@lottery/api_base_url', '');
        setRuntimeBaseURL(null);
        Alert.alert('已清除后端地址', '将使用公开数据源');
      } else {
        // 简单 URL 校验
        if (!/^https?:\/\//i.test(trimmed)) {
          Alert.alert('地址格式错误', '需以 http:// 或 https:// 开头');
          return;
        }
        await saveItem('@lottery/api_base_url', trimmed);
        setRuntimeBaseURL(trimmed);
        Alert.alert('已保存', `下次拉取将优先使用：\n${trimmed}`);
      }
    } finally {
      setSavingURL(false);
    }
  };

  const labelOf = (m: DataSourceMeta) => {
    if (m.source === 'remote') return '远端公开数据';
    if (m.source === 'cache') return '本地缓存';
    if (m.source === 'seed') return '打包内置种子';
    return '未知';
  };

  const fetchedAtText = meta?.fetchedAt
    ? new Date(meta.fetchedAt).toLocaleString('zh-CN')
    : '尚未拉取';

  return (
    <ScrollView style={styles.container}>
      <SectionTitle title="数据源" />
      <View style={styles.card}>
        <Text style={styles.rowLabel}>当前来源</Text>
        <Text style={styles.value}>{meta ? labelOf(meta) : '加载中…'}</Text>
        <Text style={styles.hint}>期数: {meta?.count ?? 0}</Text>
        <Text style={styles.hint}>拉取时间: {fetchedAtText}</Text>
        <Text style={styles.urlText} selectable>
          {DATA_SOURCE_URL}
        </Text>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={onRefreshData}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>刷新最新数据</Text>
          )}
        </TouchableOpacity>
      </View>

      <SectionTitle title="开奖提醒" />
      <View style={styles.row}>
        <Text style={styles.label}>每周开奖日提醒</Text>
        <Switch value={enabled} onValueChange={toggleReminder} />
      </View>
      {reminder?.notifId && (
        <Text style={styles.hint}>
          已设置: 周{reminder.weekday === 1 ? '一' : reminder.weekday === 3 ? '三' : '六'}{' '}
          {String(reminder.hour).padStart(2, '0')}:{String(reminder.minute).padStart(2, '0')}
        </Text>
      )}

      <SectionTitle title="后端地址 (可选)" />
      <View style={styles.card}>
        <Text style={styles.hint}>
          默认使用公开数据源，无需后端。如自建后端，填写地址后将优先调用。
        </Text>
        <TextInput
          style={styles.input}
          value={backendURL}
          onChangeText={setBackendURL}
          placeholder="https://api.your-domain.com"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={onSaveBackendURL}
          disabled={savingURL}
        >
          <Text style={styles.btnText}>保存</Text>
        </TouchableOpacity>
      </View>

      <SectionTitle title="存储" />
      <TouchableOpacity style={styles.btn} onPress={onClearCache}>
        <Text style={styles.btnText}>清除缓存</Text>
      </TouchableOpacity>

      <SectionTitle title="关于" />
      <View style={styles.about}>
        <Text style={styles.aboutText}>彩票走势分析 v1.0.1</Text>
        <Text style={styles.aboutText}>数据来源：yangxb919/lottery-data (GitHub 开源)</Text>
        <Text style={styles.aboutText}>仅供娱乐参考，请理性购彩</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 8,
  },
  rowLabel: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
  value: { fontSize: 16, color: COLORS.text, fontWeight: '600', marginBottom: 4 },
  hint: { fontSize: 12, color: COLORS.textMuted, marginVertical: 2 },
  urlText: { fontSize: 11, color: COLORS.textMuted, marginVertical: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
    marginVertical: 8,
  },
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
  btn: {
    margin: 12,
    padding: 14,
    backgroundColor: COLORS.textMuted,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    margin: 0,
    marginTop: 8,
    backgroundColor: COLORS.primary || '#1D3557',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  about: { padding: 16 },
  aboutText: { fontSize: 13, color: COLORS.textMuted, marginBottom: 4 },
});