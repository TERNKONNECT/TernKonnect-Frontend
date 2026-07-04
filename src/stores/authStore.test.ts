import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "./authStore";

// authStore talks to the backend via raw fetch — mock fetch itself rather
// than the store's internals, so the real request-building/error-handling
// logic in the store is what's under test.
function mockFetchOnce(responses: Record<string, unknown>, status: Record<string, number> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const key = Object.keys(responses).find((k) => url.includes(k));
      if (!key) {
        return { ok: false, status: 404, json: async () => ({ error: "not mocked" }) };
      }
      const httpStatus = status[key] ?? 200;
      return {
        ok: httpStatus >= 200 && httpStatus < 300,
        status: httpStatus,
        json: async () => responses[key],
      };
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState(
    { user: null, token: null, isAuthenticated: false },
    false,
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("authStore.login", () => {
  it("stores the user, token, and marks the session authenticated on success", async () => {
    mockFetchOnce({
      "/api/auth/login": {
        token: "jwt-token-abc",
        user: { _id: "user-1", name: "Jane", email: "jane@example.com", role: "user", userType: "learner" },
      },
      "/api/enrollments/my": [],
    });

    const user = await useAuthStore.getState().login("jane@example.com", "password123");

    expect(user.email).toBe("jane@example.com");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe("jwt-token-abc");
    expect(localStorage.getItem("lms_token")).toBe("jwt-token-abc");
    expect(JSON.parse(localStorage.getItem("lms_user") || "{}").email).toBe("jane@example.com");
  });

  it("throws with the server's error message on invalid credentials", async () => {
    mockFetchOnce({ "/api/auth/login": { error: "Invalid email or password" } }, { "/api/auth/login": 401 });

    await expect(
      useAuthStore.getState().login("jane@example.com", "wrong-password"),
    ).rejects.toThrow("Invalid email or password");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("attaches the server's machine-readable error code (e.g. EMAIL_NOT_VERIFIED) to the thrown error", async () => {
    mockFetchOnce(
      { "/api/auth/login": { error: "Please verify your email before logging in.", code: "EMAIL_NOT_VERIFIED" } },
      { "/api/auth/login": 403 },
    );

    let caught: (Error & { code?: string }) | undefined;
    try {
      await useAuthStore.getState().login("jane@example.com", "password123");
    } catch (err) {
      caught = err as Error & { code?: string };
    }

    expect(caught?.code).toBe("EMAIL_NOT_VERIFIED");
  });
});

describe("authStore.signup", () => {
  it("returns the server message without authenticating when email verification is required", async () => {
    mockFetchOnce({
      "/api/auth/register": { message: "Account created. Check your email for a verification code." },
    });

    const message = await useAuthStore.getState().signup("Jane", "jane@example.com", "password123", "learner");

    expect(message).toMatch(/verification code/i);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("throws with the server's error message when signup fails", async () => {
    mockFetchOnce({ "/api/auth/register": { error: "Email already in use" } }, { "/api/auth/register": 400 });

    await expect(
      useAuthStore.getState().signup("Jane", "jane@example.com", "password123", "learner"),
    ).rejects.toThrow("Email already in use");
  });
});

describe("authStore.instructorSignup", () => {
  it("returns the server message without auto-login", async () => {
    mockFetchOnce({
      "/api/auth/register-instructor": { message: "Account created. Check your email for a verification code." },
    });

    const message = await useAuthStore.getState().instructorSignup("Jane", "jane@example.com", "password123");

    expect(message).toMatch(/verification code/i);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe("authStore.logout", () => {
  it("clears session state and persisted storage", () => {
    useAuthStore.setState({
      user: { id: "user-1", name: "Jane", email: "jane@example.com", role: "user", joinedAt: "" },
      token: "jwt-token-abc",
      isAuthenticated: true,
    });
    localStorage.setItem("lms_token", "jwt-token-abc");
    localStorage.setItem("lms_user", JSON.stringify({ id: "user-1" }));

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem("lms_token")).toBeNull();
    expect(localStorage.getItem("lms_user")).toBeNull();
  });
});
