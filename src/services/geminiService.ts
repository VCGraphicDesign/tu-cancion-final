
import { GoogleGenAI } from "@google/genai";

const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
  (typeof process !== 'undefined' && process.env?.API_KEY) || 
  (import.meta.env?.VITE_GEMINI_API_KEY as string) || 
  '';

// Helper to check if API key is present before making calls
const isApiKeyAvailable = (): boolean => {
  return !!apiKey;
};

export const enhanceStory = async (rawStory: string, mood: string, genre: string): Promise<string> => {
  if (!isApiKeyAvailable()) {
    console.warn("Gemini API Key missing. Returning original story.");
    return rawStory;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Actúa como un compositor lírico experto. 
      Tengo una historia cruda y quiero que la mejores para que sirva de inspiración para una canción.
      
      Género musical: ${genre}
      Estado de ánimo: ${mood}
      
      Historia original: "${rawStory}"
      
      Por favor, reescribe la historia resaltando las emociones y los momentos clave, haciéndola más poética y estructurada, 
      pero mantén la esencia original. El texto resultante debe ser prosa, no letra de canción todavía, pero lista para inspirar al compositor.
      Máximo 1500 caracteres.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    return response.text || rawStory;
  } catch (error) {
    console.error("Error enhancing story with Gemini:", error);
    return rawStory;
  }
};
