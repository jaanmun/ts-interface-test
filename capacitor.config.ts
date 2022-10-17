import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic6-start',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      splashFullScreen: true,
    },
  },
  ios: {
    preferredContentMode: 'mobile',
  },
};

export default config;
