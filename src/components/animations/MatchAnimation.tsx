import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
}

export const MatchAnimation: React.FC<Props> = ({ children }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.05, { duration: 800 }), -1, true);
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
};
