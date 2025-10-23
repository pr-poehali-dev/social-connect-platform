import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggle={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggle={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
