import { getSelectedText, launchCommand, LaunchType } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { NoTextSelectedError } from "@/utils/errors";

/**
 * 選択中のテキストを取得してAI翻訳コマンドを起動するコマンド（ここがエントリポイント）
 */
export default async function Command() {
  try {
    // 前後空白は削除する
    const selectedText = (await getSelectedText()).trim();

    if (!selectedText) {
      throw new NoTextSelectedError();
    }

    await launchCommand({
      name: "ai-translate",
      type: LaunchType.UserInitiated,
      context: {
        inputText: selectedText,
      },
    });
  } catch (error) {
    if (error instanceof NoTextSelectedError) {
      showFailureToast(error, {
        title: "No text selected. Please select a text to translate.",
      });
    } else {
      showFailureToast(error, {
        title: "AI Translate failed to start. Please try again.",
      });
    }
  }
}
