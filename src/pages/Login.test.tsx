import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "./Login";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/stores/authStore";

function mockFetchOnce(responses: Record<string, { body: unknown; status?: number }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const key = Object.keys(responses).find((k) => url.includes(k));
      if (!key) return { ok: true, status: 200, json: async () => ([]) };
      const status = responses[key].status ?? 200;
      return { ok: status >= 200 && status < 300, status, json: async () => responses[key].body };
    }),
  );
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Learner home</div>} />
        <Route path="/dashboard" element={<div>Admin dashboard</div>} />
        <Route path="/verify-email" element={<div>Verify email page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

async function submitLogin(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe("Login page", () => {
  it("shows a validation error and does not call the API when fields are empty", async () => {
    renderLogin();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/fill in all fields/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("logs a learner in and sends them to the learner home", async () => {
    mockFetchOnce({
      "/api/auth/login": {
        body: { token: "jwt-abc", user: { _id: "u1", name: "Jane", email: "jane@example.com", role: "user" } },
      },
    });
    renderLogin();

    await submitLogin("jane@example.com", "password123");

    expect(await screen.findByText("Learner home")).toBeInTheDocument();
  });

  it("sends an admin to the dashboard on successful login", async () => {
    mockFetchOnce({
      "/api/auth/login": {
        body: { token: "jwt-abc", user: { _id: "u1", name: "Jane", email: "jane@example.com", role: "admin" } },
      },
    });
    renderLogin();

    await submitLogin("jane@example.com", "password123");

    expect(await screen.findByText("Admin dashboard")).toBeInTheDocument();
  });

  it("shows an error toast on invalid credentials and stays on the login page", async () => {
    mockFetchOnce({
      "/api/auth/login": { body: { error: "Invalid email or password" }, status: 401 },
    });
    renderLogin();

    await submitLogin("jane@example.com", "wrong-password");

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("redirects to the OTP verification page when the account isn't verified yet", async () => {
    mockFetchOnce({
      "/api/auth/login": {
        body: { error: "Please verify your email before logging in.", code: "EMAIL_NOT_VERIFIED" },
        status: 403,
      },
    });
    renderLogin();

    await submitLogin("jane@example.com", "password123");

    expect(await screen.findByText("Verify email page")).toBeInTheDocument();
  });
});
