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
      showSpinner: true,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      splashImmersive: true,
    },
  },
  ios: {
    preferredContentMode: 'mobile',
  },
};

export default config;
