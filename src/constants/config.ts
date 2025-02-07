import Config from 'react-native-config';

export const AppConfigType = {
  isDev: Config.APP_CONFIG === 'development',
  isProd: Config.APP_CONFIG === 'production',
};

export const BASE_URL_ENV = Config.BASE_URL ?? '';
console.log('BaseURL', BASE_URL_ENV);

export const MAX_FILE_SIZE = 5e6; // 5 megabytes

// DEFAULT COMPONENT CONFIGS
export const DEFAULT_ACTIVE_OPACITY = 0.6;
