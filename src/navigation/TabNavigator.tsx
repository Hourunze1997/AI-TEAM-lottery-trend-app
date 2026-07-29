import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HistoryListScreen } from '../screens/HistoryListScreen';
import { TrendScreen } from '../screens/TrendScreen';
import { RecommendScreen } from '../screens/RecommendScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function tabIcon(label: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ color, fontSize: 18 }}>{label}</Text>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#6C757D',
      }}
    >
      <Tab.Screen
        name="History"
        component={HistoryListScreen}
        options={{ title: '历史', tabBarIcon: tabIcon('📜') }}
      />
      <Tab.Screen
        name="Trend"
        component={TrendScreen}
        options={{ title: '趋势', tabBarIcon: tabIcon('📈') }}
      />
      <Tab.Screen
        name="Recommend"
        component={RecommendScreen}
        options={{ title: '推荐', tabBarIcon: tabIcon('🎯') }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: '收藏', tabBarIcon: tabIcon('⭐') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '设置', tabBarIcon: tabIcon('⚙️') }}
      />
    </Tab.Navigator>
  );
}