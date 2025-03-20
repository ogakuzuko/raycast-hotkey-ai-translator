import { getPreferenceValues } from "@raycast/api";
import { useState, useEffect, useRef, useCallback } from "react";
import OpenAI, { APIUserAbortError } from "openai";

const getClient = () => {
  const preferences = getPreferenceValues<{ openaiApiKey: string }>();
  return new OpenAI({
    apiKey: preferences.openaiApiKey,
  });
};

/**
 * TODO: `useAI`というからには、より汎用的なものであるべきだと思う。
 *
 * 改修案、`/utils/hooks/useAI.ts`として、モデルを選択できるようにする、プロンプトを比較的自由にpropsとして渡せるようにする（システムプロンプトの設定と、それに対するユーザーの入力などを包含して入力できるような形）。AbortControllerを使用した中断の仕組みやローディング、エラーハンドリングの仕組みは共通で良いのでこのままにする。これらの機能を備えつつ、`useAI`をラップした`useAITranslate`を作るみたいなことをすると良さそう。そうすると、今後要約機能を作りたいときには、`useAI`をラップした`useAISummarize`を作るみたいなことができるようになる、はず。
 *
 * 難しそうな箇所：
 * - モデル選択の抽象化とLLMクライアントの抽象化
 * - プロンプト(システムプロンプトとユーザーの入力)の抽象化
 * - useEffectの依存配列（現状はユーザーの入力テキストで分かりやすいが、プロンプトを抽象化しようと思ったときにここの依存配列がどうなるか予想できていない）
 */
export const useAI = (inputText: string) => {
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  // ストリーミング処理の適切なクリーンアップ(中断)を実現するためのAbortController（chat.completions.create()の返り値にもあるが、上手く動かなかったので自前実装した）
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    try {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const client = getClient();

      setIsLoading(true);
      const stream = await client.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "あなたは翻訳者です。入力されたテキストを日本語に翻訳してください。翻訳以外の説明は不要です。",
            },
            {
              role: "user",
              content: inputText,
            },
          ],
          stream: true,
        },
        {
          // 中断シグナル
          signal: abortController.signal,
        },
      );

      for await (const chunk of stream) {
        // 予期せず中断された場合はループ処理を中断
        if (abortController.signal.aborted) {
          break;
        }

        const deltaContent = chunk.choices[0].delta.content || ""; // deltaは変化量/差分を表す
        setGeneratedText((prev) => prev + deltaContent);
      }

      setIsLoading(false);
    } catch (error: unknown) {
      // AbortErrorは正常な中断なので無視（主に開発環境でのReactのStrictMode起因で発生する）
      if (error instanceof APIUserAbortError) {
        console.log("[INFO] ストリーミング処理が正常に中断されました");
        return;
      }

      if (error instanceof Error) {
        console.error("翻訳エラー:", error);
        setError(error);
      }

      setIsLoading(false);
    }
  }, [inputText]);

  useEffect(() => {
    generate();

    return () => {
      // コンポーネントのアンマウント時にストリーミング処理を中断する
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [generate]);

  return {
    data: generatedText,
    isLoading,
    error,
  };
};
