import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

export default function ProfileView() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const { toast } = useToast();

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ nickname, bio, avatar_url: avatarUrl });
    setIsEditing(false);
    toast({
      title: 'Профиль обновлён',
      description: 'Изменения успешно сохранены',
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Мой профиль</CardTitle>
        <Button variant="outline" size="sm" onClick={logout}>
          <Icon name="LogOut" className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-4xl">
              {nickname ? nickname[0].toUpperCase() : <Icon name="User" size={48} />}
            </AvatarFallback>
          </Avatar>
          
          {!isEditing ? (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{user.nickname}</h2>
                <p className="text-muted-foreground">@{user.user_id}</p>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
              {user.bio && (
                <p className="text-center text-muted-foreground max-w-md">{user.bio}</p>
              )}
              <Button onClick={() => setIsEditing(true)}>
                <Icon name="Edit" className="mr-2 h-4 w-4" />
                Редактировать профиль
              </Button>
            </>
          ) : (
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Никнейм</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL аватара</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о себе..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Icon name="Check" className="mr-2 h-4 w-4" />
                  Сохранить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setNickname(user.nickname);
                    setBio(user.bio || '');
                    setAvatarUrl(user.avatar_url || '');
                  }}
                  className="flex-1"
                >
                  <Icon name="X" className="mr-2 h-4 w-4" />
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">ID пользователя</span>
            <span className="font-medium">@{user.user_id}</span>
          </div>
          {user.created_at && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Дата регистрации</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
