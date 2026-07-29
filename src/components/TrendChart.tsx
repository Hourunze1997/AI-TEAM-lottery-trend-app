import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../constants/colors';

interface Props {
  data: { period: string; fronts: number[]; backs: number[] }[];
  number: number; // 选择展示哪个号码走势
}

export function TrendChart({ data, number }: Props) {
  const labels = data.slice(-10).map((d) => d.period.slice(-3));
  const values = data.slice(-10).map((d) => {
    // 展示该号码是否出现在前区
    return d.fronts.includes(number) ? number : 0;
  });

  if (values.every((v) => v === 0)) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>最近10期 {number} 号未出现</Text>
      </View>
    );
  }

  return (
    <LineChart
      data={{
        labels,
        datasets: [{ data: values }],
      }}
      width={Dimensions.get('window').width - 32}
      height={200}
      chartConfig={{
        backgroundColor: COLORS.surface,
        backgroundGradientFrom: COLORS.surface,
        backgroundGradientTo: COLORS.surface,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(29, 53, 87, ${opacity})`,
        propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.frontBall },
      }}
      bezier
      style={styles.chart}
    />
  );
}

const styles = StyleSheet.create({
  chart: { borderRadius: 8, marginVertical: 8 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted },
});