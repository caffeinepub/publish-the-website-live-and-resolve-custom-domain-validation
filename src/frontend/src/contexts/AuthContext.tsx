import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility: SHA-256 hash
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Module-level actor cache (avoids re-creating on every call)
let cachedActor: backendInterface | null = null;
async function getAnonActor(): Promise<backendInterface> {
  if (!cachedActor) {
    cachedActor = (await createActorWithConfig()) as backendInterface;
  }
  return cachedActor;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  // Keep a ref so login/logout can use it without stale closure
  const sessionTokenRef = useRef<string | null>(null);

  const updateSessionToken = (token: string | null) => {
    sessionTokenRef.current = token;
    setSessionToken(token);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = sessionStorage.getItem("admin_session_token");
        if (storedToken) {
          const actor = await getAnonActor();
          const valid = await actor.validateAdminSession(storedToken);
          if (valid) {
            sessionTokenRef.current = storedToken;
            setSessionToken(storedToken);
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem("admin_session_token");
          }
        }
      } catch (error) {
        console.error("Session restore error:", error);
        sessionStorage.removeItem("admin_session_token");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []); // intentionally empty — runs once on mount

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const passwordHash = await hashText(password);
      const actor = await getAnonActor();
      const token = await actor.adminLogin(username, passwordHash);
      if (token) {
        sessionStorage.setItem("admin_session_token", token);
        updateSessionToken(token);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      const currentToken = sessionTokenRef.current;
      if (currentToken) {
        const actor = await getAnonActor();
        await actor.adminLogout(currentToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("admin_session_token");
      updateSessionToken(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, sessionToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
