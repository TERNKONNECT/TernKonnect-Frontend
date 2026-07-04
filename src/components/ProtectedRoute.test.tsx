import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/my-learning"]}>
      <Routes>
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe("ProtectedRoute", () => {
  it("redirects to /login when the visitor isn't authenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });

    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the protected content once authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "user-1", name: "Jane", email: "jane@example.com", role: "user", joinedAt: "" },
    });

    renderProtected();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
