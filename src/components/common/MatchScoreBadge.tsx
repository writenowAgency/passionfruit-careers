import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { Text, View } from 'react-native';
import { matchColorByScore } from '../../utils/match';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 52,
  medium: 72,
  large: 120,
};

export const MatchScoreBadge: React.FC<Props> = ({ score, size = 'medium' }) => {
  const radius = sizeMap[size] / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(score, { duration: 600 });
  }, [progress, score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: circumference - (progress.value / 100) * circumference,
  }));

  const tint = matchColorByScore(score);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={sizeMap[size]} height={sizeMap[size]}>
        <Circle
          cx={sizeMap[size] / 2}
          cy={sizeMap[size] / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={8}
          fill="none"
        />
        <AnimatedCircle
          cx={sizeMap[size] / 2}
          cy={sizeMap[size] / 2}
          r={radius}
          stroke={tint}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={{ fontSize: 18, fontWeight: '700', color: tint }}>{score}%</Text>
      <Text style={{ fontSize: 10, letterSpacing: 1 }}>MATCH</Text>
    </View>
  );
};
