import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  nickname: string;
  user_id: string;
  avatar_url?: string;
}

export default function UserSearch({ onUserSelect }: { onUserSelect: (user: User) => void }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/7f0c4c9e-60c9-483d-b5b3-ef5d39e4ce4e?action=search&query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setUsers(data.users.filter((u: User) => u.id !== user?.id));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить поиск',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: number) => {
    try {
      await fetch('https://functions.poehali.dev/7f0c4c9e-60c9-483d-b5b3-ef5d39e4ce4e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, friend_id: friendId }),
      });
      
      toast({
        title: 'Заявка отправлена',
        description: 'Ожидайте подтверждения',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Поиск по никнейму или ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <Icon name="Loader2" className="h-4 w-4 animate-spin" />
          ) : (
            <Icon name="Search" className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((foundUser) => (
          <Card key={foundUser.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={foundUser.avatar_url} />
                  <AvatarFallback>
                    {foundUser.nickname[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{foundUser.nickname}</p>
                  <p className="text-sm text-muted-foreground">@{foundUser.user_id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUserSelect(foundUser)}
                >
                  <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
                  Написать
                </Button>
                <Button size="sm" onClick={() => handleAddFriend(foundUser.id)}>
                  <Icon name="UserPlus" className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
