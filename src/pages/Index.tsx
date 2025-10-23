import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  avatar?: string;
}

interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  verified?: boolean;
  online?: boolean;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'auth' | 'chat'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [messageText, setMessageText] = useState('');
  
  const [currentUser] = useState<User>({
    id: 'user_001',
    username: 'alex_space',
    nickname: 'Алекс',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    verified: false,
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Как дела?', sender: 'other', time: '14:23', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
    { id: 2, text: 'Отлично! Работаю над новым проектом 🚀', sender: 'me', time: '14:25' },
    { id: 3, text: 'Звучит круто! Расскажешь подробнее?', sender: 'other', time: '14:26', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  ]);

  const [contacts] = useState<User[]>([
    { id: 'user_002', username: 'maria_dev', nickname: 'Мария', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', verified: true, online: true },
    { id: 'user_003', username: 'ivan_design', nickname: 'Иван', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan', verified: false, online: true },
    { id: 'user_004', username: 'kate_pm', nickname: 'Катя', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate', verified: true, online: false },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView('chat');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView('chat');
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageText,
        sender: 'me',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-2xl animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mb-4 shadow-lg">
              <Icon name="MessageCircle" size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Social Messenger
            </h1>
            <p className="text-muted-foreground">Общайся с друзьями легко и стильно</p>
          </div>

          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-white font-semibold h-12"
                >
                  Войти
                </Button>
                <Button variant="ghost" className="w-full" type="button">
                  Забыли пароль?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Никнейм</label>
                  <Input placeholder="Ваш ник" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Уникальный ID</label>
                  <Input placeholder="user_123" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Icon name="Upload" size={16} />
                    Фото профиля (опционально)
                  </label>
                  <Input type="file" accept="image/*" />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-white font-semibold h-12"
                >
                  Зарегистрироваться
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-muted/30">
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-12 h-12 border-2 border-primary">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.nickname[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{currentUser.nickname}</h2>
                {currentUser.verified && (
                  <Badge variant="secondary" className="bg-accent text-white h-5 px-1.5">
                    <Icon name="CheckCircle2" size={12} />
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
            </div>
            <Button variant="ghost" size="icon">
              <Icon name="Settings" size={20} />
            </Button>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Поиск пользователей..." className="pl-10" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
              Контакты ({contacts.length})
            </div>
            {contacts.map((contact) => (
              <button
                key={contact.id}
                className="w-full p-3 hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-3 text-left"
              >
                <div className="relative">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.nickname[0]}</AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium truncate">{contact.nickname}</p>
                    {contact.verified && (
                      <Icon name="BadgeCheck" size={14} className="text-accent shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{contact.username}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t flex gap-2">
          <Button variant="outline" className="flex-1" size="sm">
            <Icon name="UserPlus" size={16} className="mr-2" />
            Добавить
          </Button>
          <Button variant="outline" size="icon">
            <Icon name="Users" size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" />
              <AvatarFallback>М</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">Мария</p>
                <Icon name="BadgeCheck" size={14} className="text-accent" />
              </div>
              <p className="text-xs text-accent">онлайн</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Icon name="Phone" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Video" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'me' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
              >
                {message.sender === 'other' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback>М</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-md px-4 py-2.5 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t bg-card p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Icon name="Paperclip" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Icon name="Image" size={20} />
            </Button>
            <Input
              placeholder="Напишите сообщение..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" className="shrink-0">
              <Icon name="Mic" size={20} />
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-white shrink-0"
              size="icon"
            >
              <Icon name="Send" size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
