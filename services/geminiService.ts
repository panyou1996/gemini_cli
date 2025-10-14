import { ModelSettings, Message } from '../types';

// IMPORTANT: This is your actual deployed Supabase Edge Function URL
const SUPABASE_GEMINI_PROXY_URL = 'https://jtebtntpwimxxfsspezs.supabase.co/functions/v1/gemini-proxy';
// IMPORTANT: This is your public Supabase anon key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0ZWJ0bnRwd2lteHhmc3NwZXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDU1NjcsImV4cCI6MjA3NDk4MTU2N30.yfqRqNMle1FVAvvsutsFZLK_9WkynRQdNlXAUOkE49U';

const PROXY_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

// A helper type for the stream response chunks from the frontend's perspective
interface StreamChunk {
  text: string;
}

/**
 * Generates a streaming response by calling the Supabase proxy.
 * It returns an async generator to maintain compatibility with the ChatContext.
 */
export async function* generateContentStream(
  prompt: string,
  settings: ModelSettings,
  imageBase64?: string
): AsyncGenerator<StreamChunk> {
  const response = await fetch(SUPABASE_GEMINI_PROXY_URL, {
    method: 'POST',
    headers: PROXY_HEADERS,
    body: JSON.stringify({
      action: 'stream',
      prompt,
      settings,
      imageBase64,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to stream content: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Read from the stream and yield decoded text chunks
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const text = decoder.decode(value, { stream: true });
    // The proxy sends the text directly, so we wrap it in the expected object structure.
    yield { text };
  }
}


/**
 * Generates an image by calling the Supabase proxy.
 */
export async function generateImage(prompt: string, settings: ModelSettings): Promise<Message> {
  const response = await fetch(SUPABASE_GEMINI_PROXY_URL, {
    method: 'POST',
    headers: PROXY_HEADERS,
    body: JSON.stringify({
      action: 'generate',
      prompt,
      settings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate image: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Edits an image by calling the Supabase proxy.
 */
export async function editImage(prompt: string, settings: ModelSettings, imageBase64: string): Promise<Message> {
  const response = await fetch(SUPABASE_GEMINI_PROXY_URL, {
    method: 'POST',
    headers: PROXY_HEADERS,
    body: JSON.stringify({
      action: 'edit',
      prompt,
      settings,
      imageBase64,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to edit image: ${response.status} ${errorText}`);
  }

  return response.json();
}