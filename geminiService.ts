
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeImage = async (base64Data: string, mimeType: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this tool/product. What is it, its estimated value, and write a professional marketplace description for it." }
      ]
    }
  });
  return response.text || '';
};

export const generateSocialAd = async (productName: string, description: string, price: number) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a high-converting Facebook/Instagram ad copy for this product: "${productName}". 
    Description: ${description}. Price: ZMW ${price}. 
    Make it localized for the Zambian market, use catchy emojis, and include a call to action to buy on Zenith ZM. Keep it under 100 words.`
  });
  return response.text || '';
};

export const generatePromoVideo = async (prompt: string) => {
  const ai = getAIClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A professional commercial for this tool: ${prompt}. Cinematic lighting, industrial setting, showing it in use.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const marketSearch = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
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
    model: 'gemini-3-pro-preview',
    contents: query,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
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
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      }
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
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
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
