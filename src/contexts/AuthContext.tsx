import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  nickname: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string, userId: string, avatarUrl?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('https://functions.poehali.dev/1405fd4b-0896-4029-8cb9-f6e84b80ce49', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });

    if (!response.ok) {
      throw new Error('Неверный email или пароль');
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (email: string, password: string, nickname: string, userId: string, avatarUrl?: string) => {
    const response = await fetch('https://functions.poehali.dev/1405fd4b-0896-4029-8cb9-f6e84b80ce49', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'register', 
        email, 
        password, 
        nickname, 
        user_id: userId,
        avatar_url: avatarUrl 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка регистрации');
    }

    const data = await response.json();
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
