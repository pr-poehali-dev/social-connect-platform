import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

export default function RegisterForm({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, password, nickname, userId, avatarUrl || undefined);
      toast({
        title: 'Регистрация успешна!',
        description: 'Добро пожаловать в наш мессенджер',
      });
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Регистрация</CardTitle>
        <CardDescription className="text-center">
          Создайте новый аккаунт
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">
                {nickname ? nickname[0].toUpperCase() : <Icon name="User" size={32} />}
              </AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
              <Label htmlFor="avatarUrl">URL фото профиля (необязательно)</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Никнейм</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Ваш никнейм"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">Уникальный ID</Label>
            <Input
              id="userId"
              type="text"
              placeholder="@username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Регистрация...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={onToggle}
              className="text-primary hover:underline font-medium"
            >
              Войти
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
