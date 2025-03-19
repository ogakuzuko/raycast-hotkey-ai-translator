import { useAI } from "@/utils/hooks/useAI";
import { Detail, LaunchProps, ActionPanel, Action, showToast, Toast } from "@raycast/api";

export default function Command(props: LaunchProps) {
  const inputText = props.launchContext?.inputText || "";

  const { data: translatedText, isLoading, error } = useAI(inputText);

  console.log("[DEBUG] useAI", {
    translatedText,
    isLoading,
    error,
  });

  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "翻訳エラー",
      message: error.message,
    });
  }

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
