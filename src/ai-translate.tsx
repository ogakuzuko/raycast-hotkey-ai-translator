import { Detail, LaunchProps, ActionPanel, Action, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import OpenAI, { APIUserAbortError } from "openai";
// import { usePromise } from "@raycast/utils"; // TODO: これ使いたい。

export default function Command(props: LaunchProps) {
  const inputText = props.launchContext?.inputText || "";

  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // ストリーミング処理の適切なクリーンアップ(中断)を実現するためのAbortController（chat.completions.create()の返り値にもあるが、上手く動かなかったので自前実装した）
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const translate = async () => {
      try {
        const preferences = getPreferenceValues();
        const openaiClient = new OpenAI({
          apiKey: preferences.openaiApiKey,
        });

        setIsLoading(true);
        const stream = await openaiClient.chat.completions.create(
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
          setTranslatedText((prev) => prev + deltaContent);
        }
      } catch (error: unknown) {
        // AbortErrorは正常な中断なので無視（主に開発環境でのReactのStrictMode起因で発生する）
        if (error instanceof APIUserAbortError) {
          console.log("[INFO] ストリーミング処理が正常に中断されました");
          return;
        }

        if (error instanceof Error) {
          console.error("翻訳エラー:", error);
          setError(error.message);
        } else {
          console.error("翻訳エラー:", error);
          setError("不明なエラーが発生しました");
        }
      } finally {
        setIsLoading(false);
      }
    };

    translate();

    return () => {
      // コンポーネントのアンマウント時にストリーミング処理を中断する
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [inputText]);

  return (
    <Detail
      markdown={translatedText}
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="翻訳結果をコピー"
            content={translatedText}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}
