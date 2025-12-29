
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/* Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per strict SDK guidelines */
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

export interface GenerationSettings {
  temperature?: number;
  thinkingBudget?: number;
  model?: string;
  systemInstruction?: string;
}

export const generateStreamingContent = async (
  prompt: string, 
  settings: GenerationSettings,
  onChunk: (text: string) => void
): Promise<void> => {
  const ai = getAiClient();
  const modelId = settings.model || 'gemini-3-flash-preview';

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: settings.systemInstruction,
        temperature: settings.temperature ?? 0.9,
        /* Fix: thinkingConfig should be set along with model selection for Gemini 3/2.5 series */
        ...(settings.thinkingBudget ? { thinkingConfig: { thinkingBudget: settings.thinkingBudget } } : {})
      },
    });

    for await (const chunk of responseStream) {
      /* Fix: Access text directly as a property, not a method call */
      const text = chunk.text;
      if (text) onChunk(text);
    }
  } catch (error) {
    console.error("Streaming Error:", error);
    onChunk("\n[اتصال قطع شد. خطای پروتکل عصبی]");
  }
};

export const mutateWords = async (wordA: string, wordB: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Combine and mutate these two Persian words into one new creative, poetic, or abstract word that reflects their synthesis: "${wordA}" + "${wordB}". Output ONLY the single resulting word.`,
            config: { systemInstruction: "You are a bio-linguistic evolution engine. Output a single unique word in Persian." }
        });
        /* Fix: Access text directly as a property */
        return response.text?.trim() || wordA;
    } catch (error) { return wordA; }
};

export const generateCreativeContent = async (prompt: string, mode: 'poetic' | 'technical'): Promise<string> => {
  const ai = getAiClient();
  const modelId = "gemini-3-flash-preview"; 

  const systemInstruction = mode === 'poetic'
    ? "You are an avant-garde Persian electronic literature poet. You blend computer code metaphors with classical Persian poetry styles. Output strictly in Persian."
    : "You are a senior programming instructor specializing in web technologies and digital art. Output in Persian.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { systemInstruction, temperature: 0.9 },
    });
    /* Fix: Access text directly as a property */
    return response.text || "خطا در تولید محتوا.";
  } catch (error) {
    return "ارتباط با شبکه عصبی قطع شد.";
  }
};

export const analyzeCodeToPoem = async (code: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Turn this code into a short Persian poem:\n\n${code}`,
            config: { systemInstruction: "You are a code interpreter that speaks in Persian poetry." }
        });
        /* Fix: Access text directly as a property */
        return response.text || "خطا در تحلیل.";
    } catch (error) { return "خطای سیستم."; }
}

export const analyzeCriticalCode = async (code: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze this code fragment through the lens of Critical Code Studies (CCS).\n\nCode:\n${code}`,
            config: { systemInstruction: "You are a philosopher of code and digital culture. Output in sophisticated Persian." }
        });
        /* Fix: Access text directly as a property */
        return response.text || "خطا در تحلیل.";
    } catch (error) { return "ارتباط با هسته فلسفی قطع شد."; }
};

export const interactWithStory = async (history: string, action: string): Promise<string> => {
     const ai = getAiClient();
     try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Context: ${history}\nAction: ${action}`,
            config: { systemInstruction: "Continue the interactive cyberpunk story in Persian. Max 100 words." }
        });
        /* Fix: Access text directly as a property */
        return response.text || "پایان خط.";
     } catch (error) { return "خطای سیستم روایتگر."; }
}

export const generateDataStory = async (jsonData: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Data: ${jsonData}`,
            config: { systemInstruction: "Synthesize these data points into a surreal Persian narrative. Style: Digital Mysticism." }
        });
        /* Fix: Access text directly as a property */
        return response.text || "خطا در روایت داده.";
    } catch (error) { return "خطای پردازش داده."; }
}

export const generateLocativeContent = async (coordinates: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Coordinates: ${coordinates}`,
            config: { systemInstruction: "Act as an ancient Persian Historian. Output a poetic memory associated with these coordinates in Persian." }
        });
        /* Fix: Access text directly as a property */
        return response.text || "خاطره‌ای در خاک یافت نشد.";
    } catch (error) { return "خطای ارتباط با تاریخ."; }
}

export const generateHypertextNode = async (currentText: string, clickedWord: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Context: "${currentText}"\nKeyword: "${clickedWord}"`,
            config: { systemInstruction: "Generate the next hypertext story segment in Persian. Max 60 words." }
        });
        /* Fix: Access text directly as a property */
        return response.text || "پیوند شکسته است.";
    } catch (error) { return "خطای لینک."; }
}

export const fetchGanjoorVerse = async (): Promise<{ verse: string; poet: string; status: 'success' | 'error' }> => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const verses = [
            { t: "مرا عهدیست با جانان که تا جان در بدن دارم", p: "حافظ" },
            { t: "رواق منظر چشم من آشیانه توست", p: "حافظ" },
            { t: "ای درون جان من تلقین تو", p: "مولانا" },
            { t: "یادگاری که در این گنبد دوار بماند", p: "حافظ" }
        ];
        const random = verses[Math.floor(Math.random() * verses.length)];
        return { verse: random.t, poet: random.p, status: 'success' };
    } catch (e) { return { verse: "", poet: "", status: 'error' }; }
}
