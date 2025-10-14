
import { GoogleGenAI, Modality } from '@google/genai';
import { ModelSettings, Message } from '../types';

// Ensure process.env.API_KEY is defined in your environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a more user-friendly error.
  console.error("API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Generates a streaming response for text-based models.
 */
export async function generateContentStream(
  prompt: string,
  settings: ModelSettings,
  imageBase64?: string
) {
  const model = settings.model;
  const parts: any[] = [{ text: prompt }];

  // For multi-modal text models like gemini-pro or flash
  if (imageBase64 && (model === 'gemini-2.5-pro' || model === 'gemini-2.5-flash')) {
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    const data = imageBase64.split(',')[1];
    parts.unshift({
      inlineData: {
        mimeType,
        data,
      },
    });
  }
  
  const response = await ai.models.generateContentStream({
    model: model,
    contents: { parts: parts },
    config: {
        systemInstruction: settings.systemInstruction,
        temperature: settings.temperature,
        topP: settings.topP,
        topK: settings.topK,
        maxOutputTokens: settings.outputLength,
    },
  });

  return response;
}

/**
 * Generates an image from a text prompt using the 'imagen-4.0-generate-001' model.
 */
export async function generateImage(prompt: string, settings: ModelSettings): Promise<Message> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: settings.aspectRatio,
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return {
        id: Date.now().toString(),
        role: 'model',
        content: '',
        image: imageUrl,
    };
}

/**
 * Edits an existing image based on a text prompt using the 'gemini-2.5-flash-image' model.
 */
export async function editImage(prompt: string, settings: ModelSettings, imageBase64: string): Promise<Message> {
    const mimeType = imageBase64.split(';')[0].split(':')[1];
    const data = imageBase64.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: { data, mimeType },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    let textContent = '';
    let newImageBase64 = '';

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        textContent += part.text;
      } else if (part.inlineData) {
        newImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    return {
        id: Date.now().toString(),
        role: 'model',
        content: textContent,
        image: newImageBase64 || undefined,
    };
}
