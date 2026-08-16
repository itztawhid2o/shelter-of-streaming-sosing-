import { Platform } from 'react-native';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setSEO(opts: { title: string; description?: string; image?: string | null }) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const title = opts.title.includes('SHELTER') ? opts.title : `${opts.title} · SHELTER OF STREAM`;
  document.title = title;
  const desc = opts.description || 'Your shelter. Your stories. Stream movies and TV with a cinematic experience.';
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('name', 'theme-color', '#070709');
  upsertMeta('property', 'og:site_name', 'SHELTER OF STREAM');
  upsertMeta('name', 'apple-mobile-web-app-title', 'SHELTER');
  upsertMeta('name', 'application-name', 'SHELTER OF STREAM');
  if (opts.image) upsertMeta('property', 'og:image', opts.image);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', desc);
  if (opts.image) upsertMeta('name', 'twitter:image', opts.image);
}
