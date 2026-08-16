import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, radius } from '../lib/theme';
import { useResponsive } from '../lib/responsive';

export function Shimmer({ width, height, r = radius.md, style }: { width: number | string; height: number; r?: number; style?: any }) {
  const o = useSharedValue(0.35);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.75, { duration: 900 }), -1, true);
  }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: '#1C1C22' }, anim, style]} />;
}

export function CardSkeleton({ w, h }: { w: number; h: number }) {
  return (
    <View style={{ width: w, marginRight: 10 }}>
      <Shimmer width={w} height={h} r={12} />
      <Shimmer width={w * 0.78} height={10} r={4} style={{ marginTop: 8 }} />
      <Shimmer width={w * 0.45} height={8} r={4} style={{ marginTop: 6 }} />
    </View>
  );
}

export function RowSkeleton() {
  const { posterW, posterH, contentPad } = useResponsive();
  return (
    <View style={{ paddingLeft: contentPad, marginBottom: 28 }}>
      <Shimmer width={160} height={16} r={4} style={{ marginBottom: 14 }} />
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <CardSkeleton key={i} w={posterW} h={posterH} />
        ))}
      </View>
    </View>
  );
}

export function HeroSkeleton() {
  const { heroH, width } = useResponsive();
  return (
    <View style={{ height: heroH, width }}>
      <Shimmer width={width} height={heroH} r={0} />
    </View>
  );
}

export function DetailsSkeleton() {
  const { width, contentPad } = useResponsive();
  return (
    <View>
      <Shimmer width={width} height={width * 0.56} r={0} />
      <View style={{ padding: contentPad }}>
        <Shimmer width={width * 0.6} height={28} r={6} />
        <Shimmer width={width * 0.4} height={14} r={4} style={{ marginTop: 12 }} />
        <Shimmer width={width - contentPad * 2} height={70} r={8} style={{ marginTop: 18 }} />
        <View style={styles.row}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} width={72} height={72} r={36} style={{ marginRight: 12 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: 28 },
});
