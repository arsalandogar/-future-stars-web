export const env = {
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_URL: import.meta.env.VITE_API_URL as string,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
  APP_DEEPLINK_BASE: import.meta.env.VITE_APP_DEEPLINK_BASE as
    | string
    | undefined,
  APP_STORE_URL: import.meta.env.VITE_APP_STORE_URL as string | undefined,
  PLAY_STORE_URL: import.meta.env.VITE_PLAY_STORE_URL as string | undefined,
} as const;
