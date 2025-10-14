// supabase/functions/gemini-proxy/index.ts

// FIX: Moved the Deno types reference to the top of the file. Triple-slash directives must precede all other statements and declarations (including blank lines) to be recognized by the TypeScript compiler. This resolves the errors for 'deno.ns' and 'Deno'.
/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Use a Deno-compatible import URL for @google/genai
import { GoogleGenAI, Modality } from 'npm:@google/genai@1.24.0';

console.log('Gemini Proxy function booting up...');

// Get the API key from Supabase environment variables
const API_KEY = Deno.env.get('GEMINI_API_KEY');
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable not set!");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

// Define CORS headers to allow requests from your web app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, prompt, settings, imageBase64 } = await req.json();

    switch (action) {
      case 'stream': {
        const parts: any[] = [{ text: prompt }];
        // FIX: Removed check for non-recommended model 'gemini-2.5-pro'.
        if (imageBase64 && settings.model === 'gemini-2.5-flash') {
          const mimeType = imageBase64.split(';')[0].split(':')[1];
          const data = imageBase64.split(',')[1];
          parts.unshift({
            inlineData: { mimeType, data },
          });
        }

        // FIX: Add thinkingConfig when maxOutputTokens is set for gemini-2.5-flash
        // to prevent empty responses, per the SDK guidelines.
        const config: any = {
          systemInstruction: settings.systemInstruction,
          temperature: settings.temperature,
          topP: settings.topP,
          topK: settings.topK,
        };

        if (settings.outputLength) {
          config.maxOutputTokens = settings.outputLength;
          if (settings.model === 'gemini-2.5-flash' && settings.outputLength > 0) {
            config.thinkingConfig = { thinkingBudget: Math.floor(settings.outputLength / 2) };
          }
        }

        const geminiStream = await ai.models.generateContentStream({
          model: settings.model,
          contents: { parts: parts },
          config: config,
        });

        // Create a ReadableStream to pipe the Gemini response to the client
        const responseStream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of geminiStream) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
            controller.close();
          },
        });
        
        return new Response(responseStream, {
          headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      case 'generate': {
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

        const message = {
          id: Date.now().toString(),
          role: 'model',
          content: '',
          image: imageUrl,
        };
        
        return new Response(JSON.stringify(message), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'edit': {
        const mimeType = imageBase64.split(';')[0].split(':')[1];
        const data = imageBase64.split(',')[1];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              { inlineData: { data, mimeType } },
              { text: prompt },
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

        const message = {
          id: Date.now().toString(),
          role: 'model',
          content: textContent,
          image: newImageBase64 || undefined,
        };

        return new Response(JSON.stringify(message), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action specified' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in Gemini proxy function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
