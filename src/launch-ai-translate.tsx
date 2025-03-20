import { getSelectedText, launchCommand, LaunchType } from "@raycast/api";

export default async function Command() {
  const selectedText = await getSelectedText();

  await launchCommand({
    name: "ai-translate",
    type: LaunchType.UserInitiated,
    context: {
      inputText: selectedText,
    },
  });
}
