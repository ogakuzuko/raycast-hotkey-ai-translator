import { useAI } from "@/utils/hooks/useAI";
import { Detail, LaunchProps, ActionPanel, Action, Icon } from "@raycast/api";

/**
 * 入力テキストをAI翻訳して結果を表示するコマンド
 */
export default function Command(props: LaunchProps) {
  const inputText = props.launchContext?.inputText || "";

  const { data: translatedText, isLoading, error, retry } = useAI(inputText);

  return (
    <Detail
      markdown={error ? "🚨 An error occurred during translation. Please try again." : translatedText}
      isLoading={isLoading}
      actions={
        isLoading ? null : (
          <ActionPanel>
            {error ? (
              <Action
                title="Retry"
                icon={Icon.RotateClockwise}
                onAction={retry}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            ) : (
              <Action.CopyToClipboard
                title="Copy Results"
                content={translatedText}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            )}
            <Action.OpenInBrowser
              title="Open Usage Dashboard"
              url="https://platform.openai.com/settings/organization/usage"
              icon={Icon.BarChart}
            />
          </ActionPanel>
        )
      }
    />
  );
}
