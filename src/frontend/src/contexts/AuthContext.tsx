import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in with resilient storage access
    try {
      const authToken = sessionStorage.getItem('admin_auth');
      if (authToken === 'true') {
        // Validate that credentials still exist
        const storedCreds = localStorage.getItem('admin_credentials');
        if (storedCreds) {
          setIsAuthenticated(true);
        } else {
          // Clear invalid session
          sessionStorage.removeItem('admin_auth');
        }
      }
    } catch (error) {
      console.error('Error accessing storage:', error);
      // Gracefully handle storage access failures
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Verify credentials against stored admin credentials
      const storedCreds = localStorage.getItem('admin_credentials');
      
      if (!storedCreds) {
        return false;
      }

      const { username: storedUsername, passwordHash } = JSON.parse(storedCreds);
      
      // Hash the input password and compare
      const inputHash = await hashPassword(password);
      
      if (username === storedUsername && inputHash === passwordHash) {
        sessionStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    return false;
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('admin_auth');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Force state update even if storage fails
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Cryptographic hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to create admin credentials on first-time setup
export async function createAdminCredentials(username: string, password: string): Promise<void> {
  const passwordHash = await hashPassword(password);
  localStorage.setItem('admin_credentials', JSON.stringify({ username, passwordHash }));
}

// Check if admin credentials already exist
export function hasAdminCredentials(): boolean {
  try {
    return !!localStorage.getItem('admin_credentials');
  } catch (error) {
    console.error('Error checking admin credentials:', error);
    return false;
  }
}
