import { createContext, useState, useEffect, ReactNode } from 'react';
import API from '../utils/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  instaUsername?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  username: null,
  user: null,
  loading: true,
  login: () => { },
  logout: () => { },
  updateUser: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUsername = localStorage.getItem('username');

      if (storedToken) {
        setToken(storedToken);
        setUsername(storedUsername);

        try {
          // Fetch full user details
          const res = await API.get('/users/current-user');
          if (res.data && res.data.data) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch user details", error);
          // If token is invalid, maybe logout? For now just keep token but no user data
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);

    // Fetch user details immediately after login
    API.get('/users/current-user')
      .then(res => {
        if (res.data && res.data.data) {
          setUser(res.data.data);
        }
      })
      .catch(err => console.error("Failed to fetch user after login", err));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        username,
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
