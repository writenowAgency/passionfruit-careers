import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  delay?: number;
}

export const ScaleUp: React.FC<Props> = ({ children, delay = 0 }) => {
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1));
  }, [scale, delay]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
};
