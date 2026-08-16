import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts } from '../lib/theme';
import { ShelterMark } from './Logo';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const logo = useSharedValue(0.72);
  const logoOp = useSharedValue(0);
  const word = useSharedValue(0);
  const tag = useSharedValue(0);
  const out = useSharedValue(1);
  const line = useSharedValue(0);

  useEffect(() => {
    logoOp.value = withTiming(1, { duration: 500 });
    logo.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    word.value = withDelay(380, withTiming(1, { duration: 700 }));
    line.value = withDelay(520, withTiming(1, { duration: 700 }));
    tag.value = withDelay(720, withTiming(1, { duration: 700 }));
    const t = setTimeout(() => {
      out.value = withTiming(0, { duration: 520 });
      setTimeout(onDone, 540);
    }, 2200);
    return () => clearTimeout(t);
  }, [logo, logoOp, word, tag, out, line, onDone]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOp.value,
    transform: [{ scale: logo.value }],
  }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: word.value, transform: [{ translateY: (1 - word.value) * 10 }] }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tag.value }));
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: line.value }], opacity: line.value }));
  const wrapStyle = useAnimatedStyle(() => ({ opacity: out.value }));

  return (
    <Animated.View style={[styles.root, wrapStyle]}>
      <Animated.View style={logoStyle}>
        <ShelterMark size={86} glow />
      </Animated.View>
      <Animated.View style={[styles.words, wordStyle]}>
        <Text style={styles.brand}>SHELTER</Text>
        <Text style={styles.of}>OF STREAM</Text>
      </Animated.View>
      <Animated.View style={[styles.rule, lineStyle]} />
      <Animated.Text style={[styles.tag, tagStyle]}>Your shelter. Your stories.</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  words: { alignItems: 'center', marginTop: 22 },
  brand: {
    color: colors.text,
    fontFamily: fonts.displayBold,
    fontSize: 36,
    letterSpacing: 8,
  },
  of: {
    color: colors.gold,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    letterSpacing: 6,
    marginTop: 6,
  },
  rule: { width: 64, height: 1, backgroundColor: colors.gold, marginTop: 22 },
  tag: {
    color: colors.textMuted,
    fontFamily: fonts.uiLight,
    fontSize: 14,
    marginTop: 16,
    letterSpacing: 0.4,
    fontStyle: 'italic',
  },
});
