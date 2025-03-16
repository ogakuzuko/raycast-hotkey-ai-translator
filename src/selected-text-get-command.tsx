import { getSelectedText, launchCommand, LaunchType, getPreferenceValues } from "@raycast/api";

export default async function Command() {
  const selectedText = await getSelectedText();
  console.log(`📝 SelectedTextGetCommand: 実行されました（現在時刻：${new Date()}）`);
  console.log("selectedText", selectedText);

  await launchCommand({
    name: "summarize-text-command",
    type: LaunchType.UserInitiated,
    context: {
      inputText: selectedText,
    },
  });
}
