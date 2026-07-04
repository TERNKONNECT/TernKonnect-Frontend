import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import VerifyEmail from "./VerifyEmail";
import { Toaster } from "@/components/ui/toaster";

function mockFetchOnce(responses: Record<string, { body: unknown; status?: number }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const key = Object.keys(responses).find((k) => url.includes(k));
      if (!key) return { ok: true, status: 200, json: async () => ({}) };
      const status = responses[key].status ?? 200;
      return { ok: status >= 200 && status < 300, status, json: async () => responses[key].body };
    }),
  );
}

function renderVerify(email = "jane@example.com") {
  return render(
    <MemoryRouter initialEntries={[`/verify-email?email=${encodeURIComponent(email)}`]}>
      <Toaster />
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VerifyEmail page", () => {
  it("pre-fills the email address from the query string", () => {
    renderVerify("jane@example.com");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@example.com");
  });

  it("shows a validation error when submitting without a code", async () => {
    renderVerify();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));

    expect(await screen.findByText(/enter your email and the verification code/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the success view and can continue to login after a correct code", async () => {
    mockFetchOnce({
      "/api/auth/verify-email": { body: { message: "Email verified. You can now log in." } },
    });
    renderVerify();

    fireEvent.change(screen.getByLabelText("Verification Code"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));

    expect(await screen.findByRole("heading", { name: "Email verified" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue to login/i }));
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("shows an error toast for an invalid or expired code", async () => {
    mockFetchOnce({
      "/api/auth/verify-email": { body: { error: "Invalid or expired verification code" }, status: 400 },
    });
    renderVerify();

    fireEvent.change(screen.getByLabelText("Verification Code"), { target: { value: "000000" } });
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));

    expect(await screen.findByText("Invalid or expired verification code")).toBeInTheDocument();
    // Should remain on the form, not the success view.
    expect(screen.getByRole("button", { name: /verify email/i })).toBeInTheDocument();
  });

  it("resends a code and starts the cooldown", async () => {
    mockFetchOnce({
      "/api/auth/resend-verification": { body: { message: "A new verification code has been sent." } },
    });
    renderVerify();

    fireEvent.click(screen.getByRole("button", { name: /resend/i }));

    expect(await screen.findByText("A new verification code has been sent.")).toBeInTheDocument();
    const resendButton = screen.getByRole("button", { name: /resend code in \d+s/i });
    expect(resendButton).toBeDisabled();
  });

  it("only accepts digits in the code field", () => {
    renderVerify();
    const otpInput = screen.getByLabelText("Verification Code");

    fireEvent.change(otpInput, { target: { value: "12a3b456" } });

    expect(otpInput).toHaveValue("123456");
  });
});
