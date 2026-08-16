import React from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, glassWeb, radius } from '../lib/theme';

interface Props extends ViewProps {
  intensity?: number;
  heavy?: boolean;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

export function Glass({ intensity = 40, heavy, radius: r = radius.lg, style, children, ...rest }: Props) {
  const wrap = [styles.base, { borderRadius: r }, heavy && styles.heavy, style];
  if (Platform.OS === 'web') {
    return (
      <View {...rest} style={[wrap, glassWeb, { backgroundColor: heavy ? colors.glassHeavy : colors.glass }]}>
        {children}
      </View>
    );
  }
  return (
    <View {...rest} style={[wrap, { overflow: 'hidden' }]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: heavy ? colors.glassHeavy : colors.glass }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  heavy: {
    borderColor: 'rgba(255,244,220,0.12)',
  },
});
