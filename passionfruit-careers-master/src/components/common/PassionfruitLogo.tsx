import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

interface Props {
  size?: number;
  animated?: boolean;
}

export const PassionfruitLogo: React.FC<Props> = ({ size = 120, animated = true }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      // Fade in and scale up on mount
      opacity.value = withTiming(1, { duration: 600 });
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
      });

      // Subtle breathing animation
      const breathe = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        false
      );
      scale.value = breathe;
    } else {
      opacity.value = 1;
      scale.value = 1;
    }
  }, [animated, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, { width: size, height: size }]}>
      <Image
        source={require('../../../assets/logo.png')}
        style={[styles.image, { width: size, height: size }]}
        contentFit="contain"
        cachePolicy="memory-disk"
        accessibilityLabel="Passionfruit Careers Logo"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
