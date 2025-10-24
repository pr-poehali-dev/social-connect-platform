import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Chat {
  user_id: number;
  nickname: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  user_id_string: string;
  is_online?: boolean;
  last_online?: string;
}

interface ChatListProps {
  onChatSelect: (chat: { id: number; nickname: string; user_id: string; avatar_url?: string; is_online?: boolean; last_online?: string }) => void;
  selectedChatId?: number;
}

export default function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const { user } = useAuth();

  const loadChats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a?user_id=${user.id}&get_chats=true`
      );
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (chats.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <Icon name="MessageSquare" className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-semibold">Нет активных чатов</h3>
            <p className="text-sm text-muted-foreground">
              Найдите пользователей и начните общение
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Icon name="MessagesSquare" className="h-5 w-5" />
          Чаты
        </h2>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <button
              key={chat.user_id}
              onClick={() =>
                onChatSelect({
                  id: chat.user_id,
                  nickname: chat.nickname,
                  user_id: chat.user_id_string,
                  avatar_url: chat.avatar_url,
                  is_online: chat.is_online,
                  last_online: chat.last_online,
                })
              }
              className={`w-full p-3 rounded-lg hover:bg-accent transition-colors text-left ${
                selectedChatId === chat.user_id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatar_url} />
                    <AvatarFallback>{chat.nickname[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {chat.is_online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{chat.nickname}</p>
                    {chat.unread_count > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                        {chat.unread_count}
                      </Badge>
                    )}
                  </div>
                  {chat.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message}
                    </p>
                  )}
                  {chat.last_message_time && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(chat.last_message_time).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}