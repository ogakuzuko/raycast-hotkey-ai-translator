import { vi } from "vitest";

// グローバル設定
vi.mock("@raycast/api", () => import("./__mocks__/raycast-api"));
