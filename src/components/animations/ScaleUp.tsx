import React from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
}

export const ScaleUp: React.FC<Props> = ({ children }) => {
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
};
