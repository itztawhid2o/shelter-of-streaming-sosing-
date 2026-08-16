import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';

export function LazyImage({
  uri,
  style,
  contentFit = 'cover',
  recyclingKey,
}: {
  uri?: string | null;
  style?: ViewStyle | ViewStyle[];
  contentFit?: ImageContentFit;
  recyclingKey?: string;
}) {
  const ref = useRef<View>(null);
  const [show, setShow] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web' || show || !uri) return;
    const node = ref.current as unknown as HTMLElement | null;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: '240px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [uri, show]);

  return (
    <View ref={ref} style={[styles.fill, style]}>
      {show && uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          transition={280}
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#141418' }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { overflow: 'hidden', backgroundColor: '#141418' },
});
