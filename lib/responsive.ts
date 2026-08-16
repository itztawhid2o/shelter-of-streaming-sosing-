import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isTablet = width >= 720 && width < 960;
  const isMobile = width < 720;
  const posterW = isDesktop ? 168 : isTablet ? 148 : 122;
  const posterH = Math.round(posterW * 1.5);
  const contentPad = isDesktop ? 48 : isTablet ? 24 : 16;
  const heroH = Math.min(height * (isDesktop ? 0.86 : 0.72), isDesktop ? 760 : 620);
  return { width, height, isDesktop, isTablet, isMobile, posterW, posterH, contentPad, heroH };
}
