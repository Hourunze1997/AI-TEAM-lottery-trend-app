import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '../components/SearchBar';
import { PeriodListItem } from '../components/PeriodListItem';
import { DrawCard } from '../components/DrawCard';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { useHistoryList } from '../hooks/useHistoryList';
import { useDebounce } from '../hooks/useDebounce';
import { RootStackParamList } from '../navigation/RootNavigator';
import { fetchLatest } from '../api/lottery';
import { useEffect } from 'react';
import { DrawRecord } from '../types/models';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HistoryListScreen() {
  const nav = useNavigation<Nav>();
  const { data, loading, refresh, loadMore, search, hasMore } = useHistoryList();
  const [keyword, setKeyword] = useState('');
  const debounced = useDebounce(keyword, 400);
  const [latest, setLatest] = useState<DrawRecord | null>(null);

  useEffect(() => {
    fetchLatest().then(setLatest).catch(() => {});
  }, []);

  useEffect(() => {
    search(debounced);
  }, [debounced, search]);

  return (
    <View style={styles.container}>
      <SearchBar value={keyword} onChangeText={setKeyword} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.period}
        ListHeaderComponent={latest ? <DrawCard record={latest} /> : null}
        renderItem={({ item }) => (
          <PeriodListItem
            record={item}
            onPress={() => nav.navigate('Detail', { period: item.period })}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListFooterComponent={hasMore ? <Loading /> : null}
        ListEmptyComponent={!loading ? <EmptyState title="没有数据" hint="试试搜索其他期号" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1FAEE' },
});