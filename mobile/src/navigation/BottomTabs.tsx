import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TrendScreen from '../screens/TrendScreen';
import PredictionScreen from '../screens/PredictionScreen';
import MyScreen from '../screens/MyScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function tabIcon(label: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ color, fontSize: 18 }}>{label}</Text>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '首页', tabBarIcon: tabIcon('🏠') }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: '历史', tabBarIcon: tabIcon('📜') }}
      />
      <Tab.Screen
        name="Trend"
        component={TrendScreen}
        options={{ title: '走势', tabBarIcon: tabIcon('📈') }}
      />
      <Tab.Screen
        name="Prediction"
        component={PredictionScreen}
        options={{ title: '预测', tabBarIcon: tabIcon('🔮') }}
      />
      <Tab.Screen
        name="My"
        component={MyScreen}
        options={{ title: '我的', tabBarIcon: tabIcon('👤') }}
      />
    </Tab.Navigator>
  );
}
