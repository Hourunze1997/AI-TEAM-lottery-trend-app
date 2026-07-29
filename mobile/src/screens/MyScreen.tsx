import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';

import StateView from './components/StateView';
import FavoriteItem from './components/FavoriteItem';
import { useRefresh } from '../hooks/useRefresh';
import {
  listFavorites,
  fetchHitStats,
  deleteFavorite,
} from '../api/favorites';
import {
  getNotificationSettings,
  updateNotificationSettings,
  registerPushToken,
} from '../api/notifications';
import { setFavorites, removeFavorite } from '../store/favoritesSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { FavoriteOut, HitStat } from '../api/favorites';
import type { NotificationSettings } from '../api/notifications';
import * as Notifications from 'expo-notifications';

export default function MyScreen() {
  const dispatch = useDispatch();
  const favorites = useSelector((s: RootState) => s.favorites.items);
  const [stats, setStats] = useState<HitStat[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [favs, s, n] = await Promise.all([
        listFavorites(),
        fetchHitStats(),
        getNotificationSettings(),
      ]);
      dispatch(setFavorites(favs));
      setStats(s);
      setSettings(n);
    } catch (e: any) {
      setError(e?.message ?? '加载失败');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const { refreshing, onRefresh } = useRefresh(load);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    try {
      await deleteFavorite(id);
      dispatch(removeFavorite(id));
    } catch (e) {
      Alert.alert('删除失败');
    }
  };

  const toggleReminder = async (val: boolean) => {
    if (!settings) return;
    try {
      const updated = await updateNotificationSettings({
        draw_reminder_enabled: val,
        reminder_time: settings.reminder_time,
        hit_notification_enabled: settings.hit_notification_enabled,
      });
      setSettings(updated);
    } catch (e) {
      Alert.alert('更新失败');
    }
  };

  const updateTime = async (val: string) => {
    if (!settings || !/^\d{2}:\d{2}$/.test(val)) return;
    try {
      const updated = await updateNotificationSettings({
        draw_reminder_enabled: settings.draw_reminder_enabled,
        reminder_time: val,
        hit_notification_enabled: settings.hit_notification_enabled,
      });
      setSettings(updated);
    } catch (e) {
      Alert.alert('更新失败');
    }
  };

  const registerPush = async () => {
    try {
      const { data: tokenData } = await Notifications.getExpoPushTokenAsync();
      if (!tokenData) {
        Alert.alert('未获取到 push_token');
        return;
      }
      await registerPushToken(tokenData);
      Alert.alert('已注册推送');
    } catch (e: any) {
      Alert.alert('注册失败', e?.message ?? '');
    }
  };

  if (loading) return <StateView.Loading />;
  if (error) return <StateView.Error message={error} onRetry={load} />;

  return (
    <FlatList
      data={favorites}
      keyExtractor={(it) => String(it.id)}
      onRefresh={onRefresh}
      refreshing={refreshing}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>通知设置</Text>
          {settings && (
            <>
              <View style={styles.row}>
                <Text>开奖提醒</Text>
                <Switch
                  value={settings.draw_reminder_enabled}
                  onValueChange={toggleReminder}
                />
              </View>
              <View style={styles.row}>
                <Text>提醒时间 (HH:MM)</Text>
                <TextInput
                  defaultValue={settings.reminder_time}
                  onEndEditing={(e) => updateTime(e.nativeEvent.text)}
                  style={styles.input}
                />
              </View>
              <Pressable style={styles.btn} onPress={registerPush}>
                <Text style={styles.btnText}>注册 Expo push_token</Text>
              </Pressable>
            </>
          )}

          <Text style={[styles.title, { marginTop: 16 }]}>我的收藏</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>暂无收藏</Text>}
      renderItem={({ item }) => (
        <FavoriteItem
          item={item}
          onDelete={() => handleDelete(item.id)}
        />
      )}
      ListFooterComponent={
        <View>
          <Text style={[styles.title, { marginTop: 16 }]}>命中统计</Text>
          {stats.map((s) => (
            <FavoriteItem key={s.favorite_id} item={{
              id: s.favorite_id,
              user_id: 0,
              front_numbers: s.front_numbers,
              back_numbers: s.back_numbers,
              hit_count: s.hit_count,
              best_rank: s.best_rank,
              created_at: '',
            }} hideActions />
          ))}
          <Text style={styles.disclaimer}>
            本站所有推荐仅供数据分析参考，不构成任何投注建议；彩票具有偶然性，请理性看待。
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 100,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { fontWeight: '600' },
  empty: { color: '#999', textAlign: 'center', marginVertical: 20 },
  disclaimer: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 24 },
});
