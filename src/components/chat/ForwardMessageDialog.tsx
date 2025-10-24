import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Chat {
  id: number;
  name: string;
  avatar_url?: string;
  is_group?: boolean;
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: number;
  chats: Chat[];
}

export default function ForwardMessageDialog({
  open,
  onOpenChange,
  messageId,
  chats,
}: ForwardMessageDialogProps) {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleForward = async () => {
    if (!selectedChat) {
      toast({
        title: 'Ошибка',
        description: 'Выберите чат для пересылки',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await fetch('https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'forward_message',
          message_id: messageId,
          sender_id: user?.id,
          target_chat_id: selectedChat,
        }),
      });

      toast({
        title: 'Сообщение переслано',
        description: 'Сообщение успешно отправлено',
      });

      onOpenChange(false);
      setSelectedChat(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось переслать сообщение',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Переслать сообщение</DialogTitle>
          <DialogDescription>
            Выберите чат, в который хотите переслать сообщение
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-accent transition-colors ${
                  selectedChat === chat.id ? 'bg-accent' : ''
                }`}
              >
                <Avatar>
                  <AvatarImage src={chat.avatar_url} />
                  <AvatarFallback>{chat.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium flex items-center gap-2">
                    {chat.name}
                    {chat.is_group && (
                      <Icon name="Users" className="h-3 w-3 text-muted-foreground" />
                    )}
                  </p>
                </div>
                {selectedChat === chat.id && (
                  <Icon name="Check" className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleForward} disabled={loading || !selectedChat}>
            {loading ? (
              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon name="Forward" className="mr-2 h-4 w-4" />
            )}
            Переслать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
