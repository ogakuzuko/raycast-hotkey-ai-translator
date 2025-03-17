import { getSelectedText, launchCommand, LaunchType } from "@raycast/api";

export default async function Command() {
  const selectedText = await getSelectedText();
  console.log(`📝 SelectedTextGetCommandForTranslate: 実行されました（現在時刻：${new Date()}）`);
  console.log("selectedText", selectedText);

  await launchCommand({
    name: "translate-result-view-DO-NOT-USE-DIRECTLY",
    type: LaunchType.UserInitiated,
    context: {
      inputText: selectedText,
    },
  });
}
