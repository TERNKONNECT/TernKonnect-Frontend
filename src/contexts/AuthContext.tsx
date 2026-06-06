import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useEnrollmentStore } from "@/stores/enrollmentStore";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const { initForUser, userId: enrollmentUserId } = useEnrollmentStore();

  // Re-initialize enrollment store after page refresh (authStore rehydrates
  // from localStorage but enrollmentStore loses userId on every page load)
  useEffect(() => {
    if (user?.id && user.role === "user" && enrollmentUserId !== user.id) {
      initForUser(user.id);
    }
  }, [user?.id, user?.role, enrollmentUserId, initForUser]);

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<User> => {
    return login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading: false,
        login: handleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
