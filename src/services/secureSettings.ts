import * as SecureStore from "expo-secure-store";

const GEMINI_API_KEY_STORAGE_KEY = "gemini_api_key";

export function getGeminiApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(GEMINI_API_KEY_STORAGE_KEY);
}

export function setGeminiApiKey(value: string): Promise<void> {
  return SecureStore.setItemAsync(GEMINI_API_KEY_STORAGE_KEY, value.trim());
}
