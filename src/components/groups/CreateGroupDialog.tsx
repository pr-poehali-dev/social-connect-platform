import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  nickname: string;
  user_id: string;
  avatar_url?: string;
}

interface CreateGroupDialogProps {
  friends: User[];
  onGroupCreated: () => void;
}

export default function CreateGroupDialog({ friends, onGroupCreated }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название группы',
        variant: 'destructive',
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одного участника',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_group',
          created_by: user?.id,
          name: groupName,
          description,
          members: selectedMembers,
        }),
      });

      if (!response.ok) throw new Error('Failed to create group');

      toast({
        title: 'Группа создана',
        description: `Группа "${groupName}" успешно создана`,
      });

      setOpen(false);
      setGroupName('');
      setDescription('');
      setSelectedMembers([]);
      onGroupCreated();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать группу',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Icon name="Users" className="mr-2 h-4 w-4" />
          Создать группу
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать групповой чат</DialogTitle>
          <DialogDescription>
            Создайте группу для общения с несколькими пользователями
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Название группы</Label>
            <Input
              id="groupName"
              placeholder="Моя группа"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              placeholder="О чём эта группа..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Участники</Label>
            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3">
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  У вас пока нет друзей
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => toggleMember(friend.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(friend.id)}
                      onCheckedChange={() => toggleMember(friend.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.avatar_url} />
                      <AvatarFallback>{friend.nickname[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{friend.nickname}</p>
                      <p className="text-xs text-muted-foreground">@{friend.user_id}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreateGroup} disabled={loading}>
            {loading ? (
              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon name="Users" className="mr-2 h-4 w-4" />
            )}
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
