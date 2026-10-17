import { MMKV } from 'react-native-mmkv';

// Instância única do MMKV (use um id com o nome do seu projeto)
export const storage = new MMKV({ id: 'obracerta-storage' });