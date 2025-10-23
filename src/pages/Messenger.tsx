import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileView from '@/components/profile/ProfileView';
import UserSearch from '@/components/search/UserSearch';
import ChatWindow from '@/components/chat/ChatWindow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface ChatUser {
  id: number;
  nickname: string;
  user_id: string;
  avatar_url?: string;
}

export default function Messenger() {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="search">
                  <Icon name="Search" className="mr-2 h-4 w-4" />
                  Поиск
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <Icon name="User" className="mr-2 h-4 w-4" />
                  Профиль
                </TabsTrigger>
              </TabsList>
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
                      Найдите пользователя через поиск, чтобы начать общение
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
