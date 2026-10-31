import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFavoriteStore } from '../store/favoriteStore';
import NumberList from '../components/NumberList';
import EmptyState from '../components/EmptyState';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/helpers';
import { FavoriteSet } from '../models/types';

// 我的收藏
export default function FavoriteScreen() {
  const { favorites, remove, toggleNotify } = useFavoriteStore();

  const onRemove = (id: string) => {
    Alert.alert('删除收藏', '确认删除该收藏？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const renderItem = ({ item }: { item: FavoriteSet }) => (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(item.createdAt, 'YYYY-MM-DD HH:mm')}</Text>
        <View style={styles.actions}>
          <View style={styles.notify}>
            <Text style={styles.notifyText}>提醒</Text>
            <Switch
              value={item.notify}
              onValueChange={() => toggleNotify(item.id)}
              trackColor={{ true: colors.primary, false: '#ccc' }}
            />
          </View>
          <TouchableOpacity onPress={() => onRemove(item.id)}>
            <Text style={styles.delete}>删除</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.balls}>
        <NumberList numbers={item.front} type="front" size={30} />
        <View style={{ width: 8 }} />
        <NumberList numbers={item.back} type="back" size={30} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={
          favorites.length === 0 ? styles.emptyContent : styles.content
        }
        ListEmptyComponent={
          <EmptyState title="还没有收藏" hint="在选号页收藏一组号码吧" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: { fontSize: 12, color: colors.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center' },
  notify: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  notifyText: { fontSize: 12, color: colors.text, marginRight: 4 },
  delete: { color: colors.danger, fontSize: 13 },
  balls: { flexDirection: 'row', alignItems: 'center' },
});