import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useApp } from '../store/AppContext';
import { FavoriteItem } from '../components/FavoriteItem';
import { EmptyState } from '../components/EmptyState';
import { COLORS } from '../constants/colors';

export function FavoritesScreen() {
  const { favorites, removeFavorite } = useApp();
  const [lastCompare, setLastCompare] = useState<string>('');

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState title="还没有收藏" hint="去选号页收藏一组号码吧" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {favorites.map((f) => (
        <View key={f.favId}>
          <FavoriteItem
            favorite={f}
            onCompare={() => setLastCompare(`已对比 ${f.label ?? f.favId}`)}
            onRemove={() => removeFavorite(f.favId)}
          />
        </View>
      ))}
      {lastCompare ? <Text style={styles.compare}>{lastCompare}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  compare: { textAlign: 'center', color: COLORS.textMuted, padding: 12 },
});