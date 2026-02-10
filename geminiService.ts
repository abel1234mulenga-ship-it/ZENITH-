
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Standard client initialization
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

async function withRetry<T>(fn: () => Promise<T>, retries = 5, initialDelay = 3000): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMessage = error?.message || "";
      const status = error?.status || error?.code;
      const isRateLimit = status === 429 || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota');
      if (isRateLimit && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
        continue;
      }
      throw error;
    }
  }
  return await fn();
}

/**
 * Powerful Pro Chatbot with Advanced Reasoning
 * Uses gemini-3-pro-preview with thinkingConfig
 */
export const proChatbotResponse = async (history: any[], currentMessage: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [...history, { role: 'user', parts: [{ text: currentMessage }] }],
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: "You are the Zenith ZM Master AI. You help users with complex business strategies, trade logistics, and Zambian market analysis. Be detailed, strategic, and professional."
      }
    });
    return response.text || 'Thinking... session interrupted.';
  });
};

/**
 * Fast AI Responses
 * Uses gemini-flash-lite-latest for low-latency interactions
 */
export const fastAIResponse = async (query: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: query,
      config: {
        systemInstruction: "You are a fast, concise business assistant. Provide short, actionable answers instantly."
      }
    });
    return response.text || '';
  });
};

/**
 * Search Grounding for Up-to-Date Information
 * Uses gemini-3-flash-preview with googleSearch tool
 */
export const groundedSearch = async (query: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return {
      text: response.text || '',
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

/**
 * Maps Grounding for Spatial Accuracy
 * Uses gemini-2.5-flash with googleMaps tool
 */
export const groundedMapsQuery = async (query: string, lat: number, lng: number) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });
    return {
      text: response.text || '',
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

/**
 * Analyzes commercial images for the Zambian market
 */
export const analyzeImage = async (base64Data: string, mimeType: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyze this commercial asset for the Zambian market. Provide suggested Category, estimated value in ZMW, and a detailed description." }
        ]
      }
    });
    return response.text || '';
  });
};

/**
 * Generates promotional videos using Veo 3.1 Fast
 */
export const generatePromoVideo = async (prompt: string, onProgress?: (msg: string) => void) => {
  return withRetry(async () => {
    const ai = getAIClient();
    onProgress?.("Initializing Veo 3.1 Fast Engine...");
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A cinematic trade advertisement for: ${prompt}`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      if (!operation.done) onProgress?.("Rendering commercial assets...");
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  });
};

/**
 * Generates viral ad copy for a product
 */
export const generateSocialAd = async (name: string, description: string, price: number) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate viral Zambian ad copy for: ${name}. ${description}. Price: ZMW ${price}.`
    });
    return response.text || '';
  });
};

/**
 * Generates market strategy using grounded search
 */
export const generateMarketStrategy = async (name: string, category: string) => {
  return groundedSearch(`Detailed 2024 Zambian market strategy for starting a business in ${category}, specifically focused on ${name}.`);
};

/**
 * Fetches Zambian business news using grounded search
 */
export const fetchZambianNews = async () => {
  return withRetry(async () => {
    const ai = getAIClient();
    // Using gemini-3-flash-preview for news fetching with grounded search
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Top 5 Zambian business and economic news headlines for today.",
      config: { 
        tools: [{ googleSearch: {} }],
      }
    });
    
    // We try to extract news items from the grounded text manually using a second AI call for JSON structure
    const text = response.text || '';
    const jsonResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract the following news items into a JSON array of objects with 'title', 'source', and 'link' properties: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              link: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(jsonResponse.text || '[]');
  });
};

/**
 * Fetches businesses near a building in Zambia
 */
export const fetchNearbyBusinesses = async (buildingName: string) => {
  const res = await groundedMapsQuery(`List all businesses and services located in or around ${buildingName} in Zambia.`, -15.4167, 28.2833);
  return res.text;
};

/**
 * Fetches logistics information between two points in Zambia
 */
export const fetchLogisticsIntel = async (origin: string, destination: string, cargoType: string) => {
  const res = await groundedSearch(`Typical travel time, road conditions, and security risks between ${origin} and ${destination} in Zambia for ${cargoType}.`);
  return res.text;
};

/**
 * Generates speech from text
 */
export const generateTTS = async (text: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

/**
 * Compares products using AI
 */
export const compareProductsAI = async (products: any[]) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const prompt = `Compare these Zambian commercial assets and provide a strategic recommendation: ${JSON.stringify(products)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  });
};

/**
 * Generates a viral app invite message
 */
export const generateAppInvite = async (userName: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, viral WhatsApp invite message for Zenith ZM trade super-app. Recommended by ${userName}. Include placeholder [LINK].`,
    });
    return response.text || '';
  });
};

/**
 * Alias for groundedSearch
 */
export const marketSearch = async (query: string) => {
  return groundedSearch(query);
};

/**
 * Alias for groundedMapsQuery with coordinates object
 */
export const mapsQuery = async (query: string, coords: { lat: number, lng: number }) => {
  return groundedMapsQuery(query, coords.lat, coords.lng);
};

/**
 * Generates viral ad copy for a specific platform
 */
export const generateViralSocialBlast = async (name: string, description: string, price: number, platform: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a viral ${platform} post for ${name} in Zambia. Price: ZMW ${price}. Description: ${description}`,
    });
    return response.text || '';
  });
};

export const encodeAudio = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

export const decodeAudio = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
