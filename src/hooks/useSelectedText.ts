import { getSelectedText, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback } from "react";

/**
 * 選択テキストを取得するためのカスタムフック
 * @param delayMs 選択テキスト取得前の遅延時間（ミリ秒）
 * @returns 選択テキスト、ローディング状態、エラー状態
 */
export function useSelectedText(delayMs = 1) {
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

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 少し遅延させて選択テキストを取得
    const timer = setTimeout(() => {
      fetchSelectedText();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [fetchSelectedText, delayMs]);

  return { selectedText, isLoading, error, fetchSelectedText };
}
