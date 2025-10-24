import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import ProfileView from '@/components/profile/ProfileView';
import UserSearch from '@/components/search/UserSearch';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatList from '@/components/chat/ChatList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ChatUser {
  id: number;
  nickname: string;
  user_id: string;
  avatar_url?: string;
}

export default function Messenger() {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Icon name="MessageSquare" className="h-8 w-8" />
            Messenger
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <Button onClick={logout} variant="outline">
            <Icon name="LogOut" className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Tabs defaultValue="chats" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="chats" className="relative">
                  <Icon name="MessagesSquare" className="mr-2 h-4 w-4" />
                  Чаты
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 min-w-5 px-1"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="search">
                  <Icon name="Search" className="mr-2 h-4 w-4" />
                  Поиск
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <Icon name="User" className="mr-2 h-4 w-4" />
                  Профиль
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chats" className="mt-0">
                <ChatList
                  onChatSelect={setSelectedChat}
                  selectedChatId={selectedChat?.id}
                />
              </TabsContent>
              <TabsContent value="search" className="mt-0">
                <UserSearch onUserSelect={setSelectedChat} />
              </TabsContent>
              <TabsContent value="profile" className="mt-0">
                <ProfileView />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-2">
            {selectedChat ? (
              <ChatWindow chatUser={selectedChat} />
            ) : (
              <div className="flex items-center justify-center h-[600px] bg-card rounded-lg border">
                <div className="text-center space-y-4">
                  <Icon name="MessageCircle" className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold">Выберите чат</h3>
                    <p className="text-muted-foreground">
                      Выберите чат из списка или найдите нового собеседника
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}