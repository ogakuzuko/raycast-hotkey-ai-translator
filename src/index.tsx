import { Detail, getSelectedText, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback } from "react";

export default function Command() {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 選択テキストを取得する関数
  const fetchSelectedText = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("テキスト取得開始");
      const text = await getSelectedText();
      setSelectedText(text);
      console.log(`取得したテキスト: ${text}`);
    } catch (e) {
      console.error("選択テキストの取得に失敗しました:", e);
      setError("選択テキストの取得に失敗しました");
      await showToast({
        style: Toast.Style.Failure,
        title: "エラー",
        message: "選択テキストの取得に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // MEMO: 1ミリ秒でも遅延させると、テキスト取得ができるっぽい？（ここまででコミットしておきたいな）
  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 少し遅延させて選択テキストを取得
    const timer = setTimeout(() => {
      fetchSelectedText();
    }, 1); // 500ミリ秒の遅延を追加

    return () => clearTimeout(timer);
  }, [fetchSelectedText]);

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

  return <Detail markdown={markdown} isLoading={isLoading} />;
}
