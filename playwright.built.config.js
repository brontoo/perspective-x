import config from "./playwright.config.js";

// Run the same browser fixtures against production output to catch bundling errors.
export default {
  ...config,
  use: { ...config.use, baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
};
