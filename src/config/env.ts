export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  AUTH_MODE: (import.meta.env.VITE_AUTH_MODE as string) ?? "mock"
};
