import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { useLotteryStore } from './src/store/lotteryStore';
import { useFavoriteStore } from './src/store/favoriteStore';

// 应用入口
export default function App() {
  const hydrate = useLotteryStore((s) => s.hydrate);
  const loadLatest = useLotteryStore((s) => s.loadLatest);
  const hydrateFav = useFavoriteStore((s) => s.hydrate);

  useEffect(() => {
    // 初始化：恢复本地缓存 + 拉取最新
    (async () => {
      await hydrate();
      await hydrateFav();
      await loadLatest();
    })().catch(() => undefined);
  }, [hydrate, hydrateFav, loadLatest]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}