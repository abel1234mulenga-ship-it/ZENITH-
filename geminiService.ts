
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Standard client initialization as per guidelines
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Exponential backoff retry logic for robust API interactions
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
 * Compares multiple products for strategic business decisions
 */
export const compareProductsAI = async (products: any[]) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const productDetails = products.map(p => `${p.name} (ZMW ${p.price}): ${p.description}`).join('\n---\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a professional commercial comparison of these Zambian market assets:\n\n${productDetails}\n\nProvide:
      1. Key Value Difference.
      2. Recommended choice for a budget buyer vs a quality seeker.
      3. Potential ROI estimation for the Zambian market.
      Keep the tone highly professional and strategic.`
    });
    return response.text || 'Unable to generate comparison at this time.';
  });
};

/**
 * Generates a viral app invitation message localized for Zambia
 */
export const generateAppInvite = async (userName: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a viral, short, and exciting WhatsApp/Facebook invitation for the "Zenith ZM" super-app. 
      Sender: ${userName}. 
      Key Features: AI Business tools, Smart Logistics, and a 10-province Marketplace. 
      Tone: High-energy, localized Zambian slang (Zed, Kwasila, Ba Boss), and highly persuasive. 
      Include 3 fire emojis and a placeholder [LINK] for the app URL.`
    });
    return response.text || '';
  });
};

/**
 * Generates viral social media blast content for Zambian platforms
 */
export const generateViralSocialBlast = async (businessName: string, description: string, price: number, platform: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a world-class Zambian marketing agency. Generate a VIRAL ${platform} post for: ${businessName}. 
      Product: ${description}. 
      Price: ZMW ${price}. 
      Target Audience: Zambians looking for quality and value. 
      Tone: Catchy, professional yet localized. 
      Include: 
      - Local Zambian slang where appropriate (e.g., 'Zed', 'Ba Boss', 'Pabwalo').
      - Strategic Emojis.
      - 5 high-traffic Zambian hashtags.
      - A strong Call to Action.`,
      config: {
        systemInstruction: "You are Zenith-AI, the expert marketing bot for the Zenith ZM super-app."
      }
    });
    return response.text || '';
  });
};

/**
 * Fetches predictive logistics intelligence for Zambian routes
 */
export const fetchLogisticsIntel = async (origin: string, destination: string, cargoType: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze a logistics route from ${origin} to ${destination} in Zambia for ${cargoType}. Provide: 
      1. Estimated travel time considering current typical road conditions.
      2. Potential road risks (e.g., weighbridges, construction zones).
      3. Best vehicle recommendation.
      4. A 'Smart Score' (1-100) for route efficiency.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || 'Logistics data currently offline.';
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
          { text: "Analyze this commercial asset for the Zambian market. Provide the suggested Category, an estimated value in ZMW, and a detailed description." }
        ]
      }
    });
    return response.text || '';
  });
};

/**
 * Fetches latest Zambian economic news using search grounding
 */
export const fetchZambianNews = async () => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "List the top 5 latest business, trade, or economic news headlines in Zambia today. Focus on commercial impact. Return a JSON array with 'title', 'source', and 'link'.",
      config: { 
        tools: [{ googleSearch: {} }],
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
    return JSON.parse(response.text || '[]');
  });
};

/**
 * Lists businesses near a specific landmark using search
 */
export const fetchNearbyBusinesses = async (buildingName: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List active businesses, banks, or retail shops located inside or immediately adjacent to ${buildingName} in Zambia.`,
      config: { tools: [{ googleSearch: {} }] }
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
      prompt: `A high-end cinematic commercial for ${prompt}. Professional lighting, 4k quality, vibrant colors.`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      if (!operation.done) onProgress?.("Synthesizing cinematic layers...");
    }
    return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
  });
};

/**
 * Generates localized social media ad copy (Required by Dashboard.tsx)
 */
export const generateSocialAd = async (name: string, description: string, price: number) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 localized Zambian social media ad copies (Facebook, WhatsApp, Instagram) for: ${name}. Description: ${description}. Price: ZMW ${price}. Include relevant Zambian slang like 'Zed', 'Kwasila', or 'Chalo' to make it authentic and engaging.`
    });
    return response.text || '';
  });
};

/**
 * Provides deep market strategy using Pro model and search (Required by Dashboard.tsx)
 */
export const generateMarketStrategy = async (name: string, category: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a detailed market entry and competitive strategy analysis for ${name} in the Zambian ${category} sector. Include current 2024 trends, local demand drivers, and pricing benchmarks.`,
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
 * General market search with grounding
 */
export const marketSearch = async (query: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { tools: [{ googleSearch: {} }] }
    });
    return {
      text: response.text || '',
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

/**
 * Maps-specific grounding queries using Gemini 2.5
 */
export const mapsQuery = async (query: string, location: { lat: number, lng: number }) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } }
    },
  });
  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

/**
 * Complex reasoning response using Thinking Budget (Required by AIChatbot.tsx)
 */
export const thinkingResponse = async (query: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || '';
  });
};

/**
 * Lightweight fast response for chat
 */
export const fastResponse = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: query });
  return response.text || '';
};

/**
 * Generates audio for text-to-speech
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
 * Helper to encode audio bytes to base64
 */
export const encodeAudio = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

/**
 * Helper to decode base64 to audio bytes
 */
export const decodeAudio = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

/**
 * Utility to decode raw PCM audio data into an AudioBuffer
 */
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
