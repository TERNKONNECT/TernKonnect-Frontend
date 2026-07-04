import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedAdminRoute, SuperAdminRoute } from "./ProtectedAdminRoute";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

function renderAdminRoute(Guard: typeof ProtectedAdminRoute) {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Guard>
              <div>Admin content</div>
            </Guard>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/" element={<div>Public home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function setUser(role: User["role"]) {
  useAuthStore.setState({
    isAuthenticated: true,
    user: { id: "u1", name: "Jane", email: "jane@example.com", role, joinedAt: "" },
  });
}

afterEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
});

describe("ProtectedAdminRoute", () => {
  it("redirects to /login when unauthenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });
    renderAdminRoute(ProtectedAdminRoute);
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("redirects a plain student (role 'user') to the public home", () => {
    setUser("user");
    renderAdminRoute(ProtectedAdminRoute);
    expect(screen.getByText("Public home")).toBeInTheDocument();
  });

  it("allows admin, super-admin, and operator roles through", () => {
    for (const role of ["admin", "super-admin", "operator"] as const) {
      setUser(role);
      const { unmount } = renderAdminRoute(ProtectedAdminRoute);
      expect(screen.getByText("Admin content")).toBeInTheDocument();
      unmount();
    }
  });
});

describe("SuperAdminRoute", () => {
  it("redirects to /login when unauthenticated", () => {
    useAuthStore.setState({ isAuthenticated: false });
    renderAdminRoute(SuperAdminRoute);
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("also lets a plain admin through (current behavior — not restricted to true super-admins)", () => {
    setUser("admin");
    renderAdminRoute(SuperAdminRoute);
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });

  it("blocks a plain student (role 'user')", () => {
    setUser("user");
    renderAdminRoute(SuperAdminRoute);
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("allows a super-admin through", () => {
    setUser("super-admin");
    renderAdminRoute(SuperAdminRoute);
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });
});
