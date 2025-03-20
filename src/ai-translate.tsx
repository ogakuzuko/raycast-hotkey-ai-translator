import { useAI } from "@/utils/hooks/useAI";
import { Detail, LaunchProps, ActionPanel, Action } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";

/**
 * 入力テキストをAI翻訳して結果を表示するコマンド
 */
export default function Command(props: LaunchProps) {
  const inputText = props.launchContext?.inputText || "";

  const { data: translatedText, isLoading, error } = useAI(inputText);

  if (error) {
    // TODO: 翻訳中のエラー発生は、トーストで出すより画面に表示してあげるほうが親切な気がするので、後で修正する。
    showFailureToast(error, {
      title: "An error occurred during translation. Please try again.",
    });
  }

  return (
    <Detail
      markdown={translatedText}
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Translation Result"
            content={translatedText}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}
