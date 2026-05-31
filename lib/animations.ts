import { Animated, Easing } from 'react-native';

/**
 * Create a bouncy scale animation for button presses
 */
export function createBounceAnimation() {
  const scale = new Animated.Value(1);

  const bounce = () => {
    scale.setValue(0.95);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, bounce };
}

/**
 * Create a smooth fade-in animation
 */
export function createFadeInAnimation(duration = 300) {
  const opacity = new Animated.Value(0);

  const fadeIn = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return { opacity, fadeIn };
}

/**
 * Create a smooth slide-up animation
 */
export function createSlideUpAnimation(duration = 400) {
  const translateY = new Animated.Value(50);
  const opacity = new Animated.Value(0);

  const slideUp = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { translateY, opacity, slideUp };
}

/**
 * Create a spring bounce animation for emphasis
 */
export function createSpringBounce() {
  const scale = new Animated.Value(0.8);

  const bounce = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, bounce };
}
