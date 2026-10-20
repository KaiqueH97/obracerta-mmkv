import { useWindowDimensions } from 'react-native';

// Recalcula ao redimensionar o navegador ou girar o dispositivo.
export default function useResponsiveLayout() {
  const { width, fontScale } = useWindowDimensions();
  const readableWidth = width / Math.max(fontScale, 1);
  return {
    compact: readableWidth < 380,
    wide: readableWidth >= 768,
    desktop: readableWidth >= 1024,
  };
}
