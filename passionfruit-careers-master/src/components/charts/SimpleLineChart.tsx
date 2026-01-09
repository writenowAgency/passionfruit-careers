import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors, spacing, borderRadius } from '@/theme';

export interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showDots?: boolean;
  showGrid?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const defaultChartWidth = Math.min(screenWidth - 64, 600);

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  color = colors.primary,
  height = 200,
  showDots = true,
  showGrid = true,
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const chartWidth = defaultChartWidth;
  const padding = 40;
  const chartHeight = height - padding;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  const getX = (index: number) => {
    const step = (chartWidth - padding * 2) / Math.max(data.length - 1, 1);
    return padding + index * step;
  };

  const getY = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    return chartHeight - normalized * (chartHeight - padding) + padding / 2;
  };

  // Generate path data
  let pathData = '';
  data.forEach((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
  });

  // Generate grid lines
  const gridLines = [];
  const numGridLines = 4;
  for (let i = 0; i <= numGridLines; i++) {
    const y = padding / 2 + (chartHeight - padding) * (i / numGridLines);
    const value = maxValue - (valueRange * i) / numGridLines;
    gridLines.push({ y, value });
  }

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {showGrid &&
          gridLines.map((line, index) => (
            <React.Fragment key={index}>
              <Line
                x1={padding}
                y1={line.y}
                x2={chartWidth - padding}
                y2={line.y}
                stroke={colors.border}
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <SvgText
                x={padding - 8}
                y={line.y + 4}
                fontSize="10"
                fill={colors.textSecondary}
                textAnchor="end"
              >
                {Math.round(line.value)}
              </SvgText>
            </React.Fragment>
          ))}

        {/* Line path */}
        <Path d={pathData} stroke={color} strokeWidth="3" fill="none" />

        {/* Dots */}
        {showDots &&
          data.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill={color}
                stroke={colors.background}
                strokeWidth="2"
              />
            );
          })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = getX(index);
          const shouldShow = data.length <= 7 || index % Math.ceil(data.length / 7) === 0;
          if (!shouldShow) return null;
          return (
            <SvgText
              key={index}
              x={x}
              y={height - 10}
              fontSize="10"
              fill={colors.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
