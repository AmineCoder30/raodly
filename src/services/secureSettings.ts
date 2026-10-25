import * as SecureStore from "expo-secure-store";

const GEMINI_API_KEY_STORAGE_KEY = "gemini_api_key";
const THEME_PREFERENCE_STORAGE_KEY = "theme_preference";

export type ThemePreference = "light" | "dark" | "system";

export function getGeminiApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(GEMINI_API_KEY_STORAGE_KEY);
}

export function setGeminiApiKey(value: string): Promise<void> {
  return SecureStore.setItemAsync(GEMINI_API_KEY_STORAGE_KEY, value.trim());
}

export async function getThemePreference(): Promise<ThemePreference> {
  const value = await SecureStore.getItemAsync(THEME_PREFERENCE_STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function setThemePreference(value: ThemePreference): Promise<void> {
  return SecureStore.setItemAsync(THEME_PREFERENCE_STORAGE_KEY, value);
}
