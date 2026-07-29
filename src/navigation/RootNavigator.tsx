import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TrendScreen from '../screens/TrendScreen';
import RecommendScreen from '../screens/RecommendScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// 简易图标（用 Emoji 占位，避免引入图标包）
const tabIcons: Record<string, string> = {
  Home: '🏠',
  History: '📜',
  Trend: '📈',
  Recommend: '🎯',
  Favorite: '⭐',
  Settings: '⚙️',
};

function tabIcon(name: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ fontSize: 18, color }}>{tabIcons[name] || '•'}</Text>
  );
}

// 根导航
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIcon: tabIcon(route.name),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: '历史' }} />
        <Tab.Screen name="Trend" component={TrendScreen} options={{ title: '走势' }} />
        <Tab.Screen name="Recommend" component={RecommendScreen} options={{ title: '推荐' }} />
        <Tab.Screen name="Favorite" component={FavoriteScreen} options={{ title: '收藏' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}