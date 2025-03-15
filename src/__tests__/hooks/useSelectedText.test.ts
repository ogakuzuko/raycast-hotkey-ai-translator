import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useSelectedText } from "@/hooks/useSelectedText";
import { getSelectedText, showToast } from "@raycast/api";

describe("useSelectedText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態ではローディング中であること", () => {
    const { result } = renderHook(() => useSelectedText());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.markdown).toContain("選択テキストを取得中...");
  });

  it("選択テキストが正常に取得できた場合、マークダウンにテキストが含まれること", async () => {
    const mockText = "テスト用の選択テキスト";
    vi.mocked(getSelectedText).mockResolvedValue(mockText);

    const { result } = renderHook(() => useSelectedText());

    // タイマーを進める
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // 非同期処理の完了を待つ
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(getSelectedText).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.markdown).toContain(mockText);
    expect(result.current.markdown).toContain("選択されたテキスト");
  });

  it("選択テキストの取得に失敗した場合、エラーメッセージが表示されること", async () => {
    vi.mocked(getSelectedText).mockRejectedValue(new Error("テスト用エラー"));

    const { result } = renderHook(() => useSelectedText());

    // タイマーを進める
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // 非同期処理の完了を待つ
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(getSelectedText).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledTimes(1);
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        style: "FAILURE",
        title: "エラー",
      }),
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.markdown).toContain("エラー");
  });

  it("選択テキストが空の場合、適切なメッセージが表示されること", async () => {
    vi.mocked(getSelectedText).mockResolvedValue("");

    const { result } = renderHook(() => useSelectedText());

    // タイマーを進める
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // 非同期処理の完了を待つ
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(getSelectedText).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.markdown).toContain("選択されたテキストがありません");
  });
});
