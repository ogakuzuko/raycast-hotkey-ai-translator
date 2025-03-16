import { useState, useEffect, useCallback, useMemo } from "react";
import { getSelectedText, showToast, Toast } from "@raycast/api";

/**
 * @deprecated テキスト取得用のCommandを別で作成したので、このフックは不要になりました。
 *
 * 選択テキストを取得するカスタムフック
 * @returns マークダウンとローディング状態
 */
export const useSelectedText = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 選択テキストを取得する関数
  const fetchSelectedText = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
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

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 少し遅延させて選択テキストを取得（1ミリ秒）
    const timer = setTimeout(() => {
      fetchSelectedText();
    }, 1);

    return () => clearTimeout(timer);
  }, [fetchSelectedText]);

  // 状態に応じたコンテンツを定義
  const headerContent = "# 選択テキスト取得テスト\n\n";

  // 状態に応じたコンテンツを取得（メモ化）
  const content = useMemo(() => {
    if (isLoading) {
      return "選択テキストを取得中...";
    }

    if (error) {
      return `## エラー\n\n${error}`;
    }

    if (!selectedText) {
      return "選択されたテキストがありません。テキストを選択してから再試行してください。";
    }

    return `## 選択されたテキスト\n\n\`\`\`\n${selectedText}\n\`\`\``;
  }, [isLoading, error, selectedText]);

  // マークダウンを生成
  const markdown = headerContent + content;

  return { markdown, isLoading };
};
