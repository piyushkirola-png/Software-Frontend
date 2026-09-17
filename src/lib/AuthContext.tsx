import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { AuthResponse, AuthState, LoginRequest, RegisterRequest } from "../types/auth";
import { User } from "../types/user";
import { tokenStorage } from "./token-storage";
import { authService } from "../api/services/authService";

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => tokenStorage.getUser<User>());
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken());
  const [isLoading, setIsLoading] = useState(false);

  // Keep in sync if another tab logs out
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "su_token") {
        setToken(e.newValue);
        if (!e.newValue) setUserState(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persistAuth = useCallback((res: AuthResponse) => {
    const u: User = {
      id: res.userId,
      name: res.name,
      email: res.email,
      phone: res.phone ?? null,
      avatarUrl: res.avatarUrl ?? null,
      role: res.role,
      isActive: true,
    };
    tokenStorage.setToken(res.token);
    tokenStorage.setUser(u);
    setToken(res.token);
    setUserState(u);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.login(data);
        persistAuth(res);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      try {
        const res = await authService.register(data);
        persistAuth(res);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      tokenStorage.clear();
      setToken(null);
      setUserState(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const me = await authService.me();
      tokenStorage.setUser(me);
      setUserState(me);
    } catch {
      // 401 handled by interceptor
    }
  }, [token]);

  const setUser = useCallback((u: User | null) => {
    if (u) {
      tokenStorage.setUser(u);
      setUserState(u);
    } else {
      tokenStorage.clear();
      setUserState(null);
      setToken(null);
    }
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === "ADMIN",
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      setUser,
    }),
    [user, token, isLoading, login, register, logout, refreshProfile, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}