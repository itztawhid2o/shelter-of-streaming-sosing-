import React, { createElement } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export function EmbedPlayer({ src, onError }: { src: string; onError?: () => void }) {
  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src,
      style: {
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#000',
      },
      allow: 'autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer',
      allowFullScreen: true,
      referrerPolicy: 'origin',
      title: 'SHELTER player',
      onError,
    });
  }
  try {
    const { WebView } = require('react-native-webview');
    return (
      <WebView
        source={{ uri: src }}
        style={styles.flex}
        allowsFullscreenVideo
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        onError={onError}
      />
    );
  } catch {
    return <View style={styles.flex} />;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#000' },
});
