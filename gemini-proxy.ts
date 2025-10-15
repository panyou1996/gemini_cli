// FIX: Replaced 'deno.window' with 'deno.ns' to resolve type checking errors for the Deno global object.
/// <reference lib="deno.ns" />

import { GoogleGenAI, GenerateContentResponse, Modality, Part, Content } from "https://esm.sh/@google/genai";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Self-contained type definitions matching the frontend for reliability
type Model = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';

interface ModelSettings {
  model: Model;
  systemInstruction: string;
  temperature: number;
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  outputLength: number;
  topP: number;
  topK: number;
}

// Matches the 'Message' type from the frontend
interface HistoryMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
}

interface RequestPayload {
  action: 'stream' | 'generate' | 'edit';
  prompt: string;
  settings: ModelSettings;
  history?: HistoryMessage[]; // Added history from the frontend
  imageBase64?: string;
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, prompt, settings, history, imageBase64 }: RequestPayload = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const imageToPart = (base64: string): Part => {
      const match = base64.match(/^data:(image\/.+);base64,(.+)$/);
      if (!match) throw new Error("Invalid image format. Expected a data URL.");
      return { inlineData: { mimeType: match[1], data: match[2] } };
    };

    switch (action) {
      case 'generate': {
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: settings.aspectRatio,
          },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        
        const message = {
          id: `img-${Date.now()}`,
          role: 'model',
          content: `Image generated for: "${prompt}"`,
          image: imageUrl
        };

        return new Response(JSON.stringify(message), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'edit': {
        if (!imageBase64) throw new Error("Image editing requires an image.");
        
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [imageToPart(imageBase64), { text: prompt }] },
          config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });

        let textPart = '';
        let imagePartUrl = '';

        for (const part of response.candidates[0].content.parts) {
          if (part.text) textPart += part.text;
          else if (part.inlineData) imagePartUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        
        const message = {
          id: `edit-${Date.now()}`,
          role: 'model',
          content: textPart || `Image edited based on your prompt.`,
          image: imagePartUrl,
        };

        return new Response(JSON.stringify(message), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'stream': {
        const visionModels: Model[] = ['gemini-2.5-pro', 'gemini-2.5-flash'];
        
        const contents: Content[] = (history || []).map((msg: HistoryMessage): Content => {
            return {
                role: msg.role,
                parts: [{ text: msg.content }],
            };
        });

        const userParts: Part[] = [{ text: prompt }];
        if (imageBase64) {
          if (!visionModels.includes(settings.model)) {
             throw new Error(`The selected model '${settings.model}' does not support image inputs.`);
          }
          userParts.unshift(imageToPart(imageBase64));
        }
        contents.push({ role: 'user', parts: userParts });

        const response = await ai.models.generateContentStream({
          model: settings.model as 'gemini-2.5-pro' | 'gemini-2.5-flash',
          contents: contents, // Pass the full conversation history
          config: {
            systemInstruction: settings.systemInstruction,
            temperature: settings.temperature,
            maxOutputTokens: settings.outputLength,
            topP: settings.topP,
            topK: settings.topK,
          },
        });

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of response) {
              if (chunk.text) {
                controller.enqueue(encoder.encode(chunk.text));
              }
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      default:
        throw new Error(`Unsupported action provided.`);
    }

  } catch (e) {
    console.error("Error in gemini-proxy:", e);
    
    let errorBody = JSON.stringify({ error: 'An unknown server error occurred.' });
    const headers = { ...corsHeaders, 'Content-Type': 'application/json' };
    
    if (e instanceof Error) {
        try {
            JSON.parse(e.message);
            errorBody = e.message;
        } catch (parseError) {
            errorBody = JSON.stringify({ error: e.message });
        }
    }

    return new Response(errorBody, { status: 500, headers });
  }
});
