import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react-hooks";
import { useAI } from "@/utils/hooks/useAI";
import OpenAI, { APIUserAbortError } from "openai";
import { EmptyTextError } from "@/utils/errors";
import { createMockStream, MockAPIUserAbortError } from "../__mocks__/openai-mock";

// モック用の変数
let mockCreateFn: ReturnType<typeof vi.fn>;

// コンソールログのモック
beforeEach(() => {
  console.error = vi.fn();
  console.log = vi.fn();
});

// OpenAIクライアントのモック
vi.mock("openai", () => {
  mockCreateFn = vi.fn();
  return {
    OpenAI: vi.fn(() => ({
      chat: {
        completions: {
          create: mockCreateFn,
        },
      },
    })),
    APIUserAbortError: MockAPIUserAbortError,
  };
});

// getPreferenceValuesのモック
vi.mock("@raycast/api", async () => {
  const actual = await vi.importActual("@raycast/api");
  return {
    ...actual,
    getPreferenceValues: vi.fn().mockReturnValue({
      openaiApiKey: "test-api-key",
    }),
  };
});

describe("useAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態ではローディング中であること", () => {
    const { result } = renderHook(() => useAI("テスト入力"));

    // 初期状態ではisLoadingがtrueであること
    expect(result.current.isLoading).toBe(true);

    // 初期状態ではdataが空文字列であること
    expect(result.current.data).toBe("");

    // 初期状態ではerrorがundefinedであること
    expect(result.current.error).toBeUndefined();
  });

  it("APIが正常にレスポンスを返した場合、データが正しく設定されること", async () => {
    // APIレスポンスのモック
    const mockResponse = "翻訳されたテキスト";
    mockCreateFn.mockResolvedValue(createMockStream([mockResponse]));

    // フックをレンダリング
    const { result, waitForNextUpdate } = renderHook(() => useAI("テスト入力"));

    // 初期状態
    expect(result.current.isLoading).toBe(true);

    // タイマーを進めて非同期処理を開始
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // 期待される結果
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(mockResponse);
    expect(result.current.error).toBeUndefined();

    // APIが正しいパラメータで呼び出されたことを確認
    expect(mockCreateFn).toHaveBeenCalledTimes(1);
    expect(mockCreateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: expect.any(String),
          },
          {
            role: "user",
            content: "テスト入力",
          },
        ],
        stream: true,
      }),
      expect.objectContaining({
        signal: expect.any(Object),
      }),
    );
  });

  it("ストリーミングレスポンスが複数のチャンクで返された場合、データが累積されること", async () => {
    // 複数のチャンクを持つAPIレスポンスのモック
    const chunks = ["こんにちは", "、", "世界", "！"];
    const expectedResponse = "こんにちは、世界！";
    mockCreateFn.mockResolvedValue(createMockStream(chunks));

    // フックをレンダリング
    const { result, waitForNextUpdate } = renderHook(() => useAI("Hello, World!"));

    // 初期状態
    expect(result.current.isLoading).toBe(true);

    // タイマーを進めて非同期処理を開始
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // 期待される結果
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(expectedResponse);
    expect(result.current.error).toBeUndefined();

    // APIが呼び出されたことを確認
    expect(mockCreateFn).toHaveBeenCalledTimes(1);
  });

  it("APIからのレスポンス中にコンポーネントがアンマウントされた場合、処理が中断されること", async () => {
    // モックのAbortコントローラーとそのabortメソッド
    const mockAbort = vi.fn();
    const mockAbortController = {
      signal: { aborted: false },
      abort: mockAbort,
    };

    // AbortControllerのモック
    global.AbortController = vi.fn(() => mockAbortController) as unknown as typeof AbortController;

    // APIレスポンスを遅延させる
    mockCreateFn.mockImplementation(() => {
      return new Promise(() => {
        // 意図的に解決しない Promise を返し、アンマウント時のクリーンアップをテスト
      });
    });

    // フックをレンダリング
    const { unmount } = renderHook(() => useAI("テスト入力"));

    // タイマーを進める
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // コンポーネントをアンマウント
    unmount();

    // abort メソッドが呼び出されたことを確認
    expect(mockAbort).toHaveBeenCalledTimes(1);
  });

  it("APIエラーが発生した場合、エラー状態が設定されること", async () => {
    // APIエラーのモック
    const errorMessage = "APIエラーが発生しました";
    const mockError = new Error(errorMessage);
    mockCreateFn.mockRejectedValue(mockError);

    // フックをレンダリング
    const { result, waitForNextUpdate } = renderHook(() => useAI("テスト入力"));

    // 初期状態
    expect(result.current.isLoading).toBe(true);

    // タイマーを進めて非同期処理を開始
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // 期待される結果
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe("");
    expect(result.current.error).toEqual(mockError);

    // コンソールにエラーログが出力されることを確認
    expect(console.error).toHaveBeenCalledWith("[🚨ERROR] useAI.ts__error: ", mockError);
  });

  it("APIUserAbortErrorが発生した場合、エラー状態が設定されないこと", async () => {
    // APIUserAbortErrorのモック
    const abortError = new MockAPIUserAbortError("ユーザーによる中断");
    mockCreateFn.mockRejectedValue(abortError);

    // フックをレンダリング
    const { result, waitForNextUpdate } = renderHook(() => useAI("テスト入力"));

    // 初期状態
    expect(result.current.isLoading).toBe(true);

    // タイマーを進めて非同期処理を開始
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // 期待される結果 - エラーが設定されないこと
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe("");
    expect(result.current.error).toBeUndefined();

    // 情報ログが出力されることを確認
    expect(console.log).toHaveBeenCalledWith("[📝INFO] useAI.ts__error: ストリーミング処理が正常に中断されました");
  });

  it("入力テキストが変更された場合、新しいリクエストが発行されること", async () => {
    // モックのAbortコントローラーとそのabortメソッド
    const mockAbort = vi.fn();
    const mockAbortController = {
      signal: { aborted: false },
      abort: mockAbort,
    };

    // AbortControllerのモック
    global.AbortController = vi.fn(() => mockAbortController) as unknown as typeof AbortController;

    // 最初のAPIレスポンスのモック
    mockCreateFn.mockResolvedValue(createMockStream(["最初のレスポンス"]));

    // フックをレンダリング
    const { result, waitForNextUpdate, rerender } = renderHook((props) => useAI(props), {
      initialProps: "テスト入力1",
    });

    // タイマーを進める
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // 入力テキストを変更してコンポーネントをリレンダリング
    mockCreateFn.mockClear(); // クリアして2回目の呼び出しを確認するため
    mockCreateFn.mockResolvedValue(createMockStream(["2回目のレスポンス"]));

    // リレンダリング
    rerender("テスト入力2");

    // 前回のリクエストがabortされたことを確認
    expect(mockAbort).toHaveBeenCalledTimes(1);

    // タイマーを進める
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 新しいAPI呼び出しが行われたことを確認
    expect(mockCreateFn).toHaveBeenCalledTimes(1);
    expect(mockCreateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: "テスト入力2",
          }),
        ]),
      }),
      expect.any(Object),
    );
  });

  it("空の入力テキストの場合、EmptyTextErrorがスローされること", async () => {
    // フックをレンダリング（空の入力で）
    const { result, waitForNextUpdate } = renderHook(() => useAI(""));

    // 初期状態
    expect(result.current.isLoading).toBe(true);

    // タイマーを進めて非同期処理を開始
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // 非同期処理の完了を待つ
    await waitForNextUpdate();

    // 期待される結果
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe("");
    expect(result.current.error).toBeInstanceOf(EmptyTextError);

    // APIが呼び出されないことを確認
    expect(mockCreateFn).not.toHaveBeenCalled();
  });

  it("retry関数を呼び出した場合、生成処理が再実行されること", async () => {
    // APIレスポンスのモック
    const mockResponse = "翻訳されたテキスト";
    mockCreateFn.mockResolvedValue(createMockStream([mockResponse]));

    // フックをレンダリング
    const { result, waitForNextUpdate } = renderHook(() => useAI("テスト入力"));

    // 初期状態のAPI呼び出し
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await waitForNextUpdate();

    // 結果を確認
    expect(result.current.data).toBe(mockResponse);

    // 次のレスポンスのモック
    mockCreateFn.mockClear();
    const retryResponse = "再生成されたテキスト";
    mockCreateFn.mockResolvedValue(createMockStream([retryResponse]));

    // retry関数を呼び出し
    act(() => {
      result.current.retry();
    });

    // データがリセットされたことを確認
    expect(result.current.data).toBe("");
    expect(result.current.isLoading).toBe(true);

    // タイマーを進める
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await waitForNextUpdate();

    // APIが再度呼び出されたことを確認
    expect(mockCreateFn).toHaveBeenCalledTimes(1);

    // 新しい結果を確認
    expect(result.current.data).toBe(retryResponse);
    expect(result.current.isLoading).toBe(false);
  });
});
