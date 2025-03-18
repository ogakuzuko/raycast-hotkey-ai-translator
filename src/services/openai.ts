import { getPreferenceValues } from "@raycast/api";
import OpenAI from "openai";

type Preferences = {
  openaiApiKey: string;
};

export type TranslationResult = {
  translatedText: string;
  isLoading: boolean;
  error?: string;
};

export const translateToJapanese = async (
  text: string,
  onProgress?: (partialTranslation: string) => void,
): Promise<TranslationResult> => {
  try {
    const preferences = getPreferenceValues<Preferences>();
    console.log("preferences", preferences);
    const client = new OpenAI({
      apiKey: preferences.openaiApiKey,
    });

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "あなたは翻訳者です。入力されたテキストを日本語に翻訳してください。翻訳以外の説明は不要です。",
        },
        {
          role: "user",
          content: text,
        },
      ],
      stream: true,
    });

    let translatedText = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      translatedText += content;

      if (onProgress) {
        onProgress(translatedText);
      }
    }

    return {
      translatedText,
      isLoading: false,
    };
  } catch (error) {
    console.error("翻訳エラー:", error);
    return {
      translatedText: "",
      isLoading: false,
      error: error instanceof Error ? error.message : "翻訳中に不明なエラーが発生しました",
    };
  }
};
