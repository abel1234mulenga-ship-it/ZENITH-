
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Utility function to handle API retries with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, initialDelay = 3000): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMessage = error?.message || "";
      const status = error?.status || error?.code;
      
      const isRateLimit = status === 429 || 
                          errorMessage.includes('429') || 
                          errorMessage.includes('RESOURCE_EXHAUSTED') || 
                          errorMessage.includes('quota');

      if (isRateLimit && i < retries - 1) {
        console.warn(`Gemini API Rate Limit. Retrying in ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
        continue;
      }
      throw error;
    }
  }
  return await fn();
}

export const analyzeImage = async (base64Data: string, mimeType: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyze this commercial asset. Identify its category, estimated market value in Zambia, and write a high-conversion marketplace description." }
        ]
      }
    });
    return response.text || '';
  });
};

export const generateSocialAd = async (productName: string, description: string, price: number) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 variations of high-converting WhatsApp/Facebook ad copies for: "${productName}". 
      Price: ZMW ${price}. Description: ${description}. 
      Use Zambian English nuances, include local emojis, and a strong call to action.`
    });
    return response.text || '';
  });
};

export const generatePromoVideo = async (prompt: string, onProgress?: (msg: string) => void) => {
  return withRetry(async () => {
    const ai = getAIClient();
    onProgress?.("Initializing Veo 3.1 Fast Engine...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-end cinematic commercial for ${prompt}. 4k quality, slow motion, professional lighting, commercial grade.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
    
    onProgress?.("Rendering cinematic frames...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      if (!operation.done) onProgress?.("Processing video layers...");
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  });
};

export const generateMarketStrategy = async (productName: string, category: string) => {
  return withRetry(async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a strategic market analysis for selling "${productName}" in the ${category} sector in Zambia. 
      Identify top competitors, current retail pricing trends in Lusaka and Copperbelt, and suggest a 'Zenith' marketing strategy to outsell them.`,
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

export const fastResponse = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query
  });
  return response.text || '';
};

export const thinkingResponse = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: { thinkingConfig: { thinkingBudget: 24576 } }
  });
  return response.text || '';
};

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
