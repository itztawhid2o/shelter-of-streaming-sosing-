import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from 'react-native-svg';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../lib/theme';

export function ShelterMark({ size = 40, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <View style={[styles.mark, glow && styles.glow, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F0D78A" />
            <Stop offset="0.45" stopColor="#D4A853" />
            <Stop offset="1" stopColor="#9A6A2A" />
          </LinearGradient>
        </Defs>
        <Path
          d="M32 6 L54 16.2 V34.5 C54 47.2 43.6 56.4 32 60.4 C20.4 56.4 10 47.2 10 34.5 V16.2 Z"
          fill="none"
          stroke="url(#g)"
          strokeWidth={2.2}
        />
        <Path
          d="M41.5 22.2 C39.2 19.4 35.4 18 31.2 18 C24.4 18 19.8 21.6 19.8 26.6 C19.8 31.2 23.2 33.4 29.8 35 L34.4 36.2 C38.2 37.1 40 38.4 40 40.8 C40 43.6 37.2 45.6 32.2 45.6 C27.6 45.6 24.2 43.8 22.2 40.6"
          fill="none"
          stroke="url(#g)"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
        <Path d="M29.2 28.6 L38.8 34.2 L29.2 39.8 Z" fill="url(#g)" opacity={0.95} />
        <Circle cx="32" cy="8.2" r="1.4" fill="#F0D78A" />
      </Svg>
    </View>
  );
}

export function Wordmark({ compact = false, size = 'md' }: { compact?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const titleSize = size === 'lg' ? 28 : size === 'sm' ? 15 : 18;
  return (
    <View style={styles.word}>
      <Text style={[styles.brand, { fontSize: titleSize, letterSpacing: size === 'lg' ? 4 : 2.4 }]}>SHELTER</Text>
      {!compact && <Text style={[styles.of, { fontSize: Math.max(9, titleSize * 0.42) }]}>OF STREAM</Text>}
    </View>
  );
}

export function BrandLockup({ size = 36, showWord = true }: { size?: number; showWord?: boolean }) {
  return (
    <View style={styles.lock}>
      <ShelterMark size={size} />
      {showWord && <Wordmark size={size >= 40 ? 'md' : 'sm'} />}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: 'rgba(212,168,83,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.22)',
    overflow: 'hidden',
  },
  glow: {
    shadowColor: '#D4A853',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  word: { justifyContent: 'center' },
  brand: {
    color: colors.text,
    fontFamily: fonts.displayBold,
    lineHeight: 22,
  },
  of: {
    color: colors.gold,
    fontFamily: fonts.uiMedium,
    letterSpacing: 3.6,
    marginTop: 1,
  },
  lock: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
