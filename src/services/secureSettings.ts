import * as SecureStore from "expo-secure-store";

const GEMINI_API_KEY = "AQ.Ab8RN6J4rbYnt_0mU4sup7PLGLGFpTU_MOzWCeCh2eLbmkei9A";

export function getGeminiApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(GEMINI_API_KEY);
}

export function setGeminiApiKey(value: string): Promise<void> {
  return SecureStore.setItemAsync(GEMINI_API_KEY, value.trim());
}
