import { createContext, useState, useEffect, ReactNode } from 'react';
import { redirect } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  username: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUsername);
    }
  }, []);

  const login = (newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    // redirect to landing page can be handled in the component calling logout
    redirect('/');
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
