import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { COLORS } from '../constants/colors';

interface Props {
  data: { name: string; population: number }[];
}

export function PieChartPanel({ data }: Props) {
  const colors = [COLORS.hot, COLORS.secondary, COLORS.accent];
  const chartData = data.map((d, i) => ({
    name: d.name,
    population: d.population,
    color: colors[i % colors.length],
    legendFontColor: COLORS.text,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>前区区间分布</Text>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={180}
        chartConfig={{
          color: () => COLORS.text,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="8"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    margin: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
});