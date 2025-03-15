/**
 * 選択テキストの状態に基づいてマークダウンを生成する
 * @param selectedText 選択テキスト
 * @param isLoading ローディング状態
 * @param error エラー状態
 * @returns マークダウン文字列
 */
export function generateMarkdown(selectedText: string | null, isLoading: boolean, error: string | null): string {
  let markdown = "# 選択テキスト取得テスト\n\n";

  if (isLoading) {
    markdown += "選択テキストを取得中...";
  } else if (error) {
    markdown += `## エラー\n\n${error}`;
  } else if (!selectedText) {
    markdown += "選択されたテキストがありません。テキストを選択してから再試行してください。";
  } else {
    markdown += `## 選択されたテキスト\n\n\`\`\`\n${selectedText}\n\`\`\``;
  }

  return markdown;
}
