import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  text?: string;
  file_url?: string;
  audio_url?: string;
  image_url?: string;
  created_at: string;
  nickname: string;
  avatar_url?: string;
}

interface ChatUser {
  id: number;
  nickname: string;
  user_id: string;
  avatar_url?: string;
}

export default function ChatWindow({ chatUser }: { chatUser: ChatUser }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a?user_id=${user?.id}&chat_with=${chatUser.id}`
      );
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [chatUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await fetch('https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user?.id,
          receiver_id: chatUser.id,
          text: newMessage,
        }),
      });
      
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type: 'image' | 'file' | 'audio') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : type === 'audio' ? 'audio/*' : '*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileUrl = event.target?.result as string;
        
        try {
          await fetch('https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_id: user?.id,
              receiver_id: chatUser.id,
              [`${type}_url`]: fileUrl,
              text: `📎 ${file.name}`,
            }),
          });
          
          await loadMessages();
          toast({
            title: 'Файл отправлен',
            description: `${file.name} успешно отправлен`,
          });
        } catch (error) {
          toast({
            title: 'Ошибка',
            description: 'Не удалось отправить файл',
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={chatUser.avatar_url} />
          <AvatarFallback>{chatUser.nickname[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{chatUser.nickname}</p>
          <p className="text-sm text-muted-foreground">@{chatUser.user_id}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${
              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender_id !== user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.avatar_url} />
                <AvatarFallback>{message.nickname[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === user?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="Изображение"
                  className="rounded mb-2 max-w-full"
                />
              )}
              {message.audio_url && (
                <audio controls className="mb-2">
                  <source src={message.audio_url} />
                </audio>
              )}
              {message.text && <p className="text-sm">{message.text}</p>}
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {message.sender_id === user?.id && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.nickname[0]}</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => handleFileUpload('image')}
          >
            <Icon name="Image" className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => handleFileUpload('audio')}
          >
            <Icon name="Mic" className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => handleFileUpload('file')}
          >
            <Icon name="Paperclip" className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            {loading ? (
              <Icon name="Loader2" className="h-4 w-4 animate-spin" />
            ) : (
              <Icon name="Send" className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
