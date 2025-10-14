export type Theme = 'light' | 'dark' | 'system';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string; // base64 encoded image
  status?: 'generating';
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

export interface ModelSettings {
  // FIX: Removed 'gemini-2.5-pro' as it is not a recommended model.
  model: 'gemini-2.5-flash' | 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';
  systemInstruction: string;
  temperature: number;
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  outputLength: number;
  topP: number;
  topK: number;
}
