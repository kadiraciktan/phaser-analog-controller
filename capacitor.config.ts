import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "phaser-analog",
  webDir: "dist",
  server: {
    // ng serve -o --host 0.0.0.0
    url: "http://192.168.1.104:5173",
    cleartext: true,
  },
};

export default config;
