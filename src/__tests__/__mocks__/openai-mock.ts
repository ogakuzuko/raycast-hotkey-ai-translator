import { vi } from "vitest";

// ストリーミングレスポンスをシミュレートするためのヘルパー関数
export const createMockStream = (chunks: string[]) => {
  // チャンクごとのレスポンスを作成
  const mockChunks = chunks.map((content) => ({
    choices: [
      {
        delta: { content },
      },
    ],
  }));

  // AsyncIterableなストリームをシミュレート
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of mockChunks) {
        yield chunk;
      }
    },
  };
};

// APIUserAbortErrorの代替
export class MockAPIUserAbortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIUserAbortError";
  }
}

export const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

export const mockOpenAIInstance = () => mockOpenAI;
