import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import type { User, LoginResponse, ApiError, UserRole } from "@/types/apiTypes";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("mentee");
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const savedRole = localStorage.getItem("currentRole") as UserRole;

      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        if (savedRole) {
          setCurrentRole(savedRole);
        }
      }
    } catch (error) {
      console.error("Failed to load auth state from storage", error);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserRole> => {
    try {
      const response = await api.post<LoginResponse>("/users/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      setUser(user);
      setToken(token);
      setCurrentRole(user.role);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("currentRole", user.role);

      return user.role;
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      let errorMessage = "Login failed. Please try again.";

      if (error.response && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.request) {
        errorMessage = "Cannot connect to server.";
      }

      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCurrentRole("mentee");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("selectedRole");
  };

  const handleSetCurrentRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem("currentRole", role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
        currentRole,
        setCurrentRole: handleSetCurrentRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
