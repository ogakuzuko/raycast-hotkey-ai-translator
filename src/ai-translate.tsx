import { Detail, LaunchProps, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { translateToJapanese } from "./services/openai";

export default function Command(props: LaunchProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState<string | undefined>();
  const inputText = props.launchContext?.inputText || "";

  useEffect(() => {
    async function performTranslation() {
      if (!inputText) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await translateToJapanese(inputText, (partialTranslation) => {
          setTranslatedText(partialTranslation);
        });

        if (result.error) {
          setError(result.error);
          await showToast({
            style: Toast.Style.Failure,
            title: "翻訳エラー",
            message: result.error,
          });
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "不明なエラーが発生しました";
        setError(errorMessage);
        await showToast({
          style: Toast.Style.Failure,
          title: "翻訳エラー",
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    }

    performTranslation();
  }, [inputText]);

  const markdown = `
## 元のテキスト

\`\`\`
${inputText}
\`\`\`

## 日本語訳

${error ? `**エラー**: ${error}` : translatedText || "翻訳中..."}
`;

  return (
    <Detail
      markdown={markdown}
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
