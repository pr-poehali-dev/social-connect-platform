import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const checkNewMessages = async () => {
      try {
        const response = await fetch(
          `https://functions.poehali.dev/4db8cfd7-ba0d-41f9-bc91-0c715944684a?user_id=${user.id}&get_chats=true`
        );
        const data = await response.json();
        
        const totalUnread = data.chats?.reduce(
          (sum: number, chat: { unread_count: number }) => sum + chat.unread_count,
          0
        ) || 0;

        if (totalUnread > unreadCount && unreadCount > 0) {
          toast({
            title: '📬 Новое сообщение',
            description: 'У вас есть непрочитанные сообщения',
          });

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Новое сообщение', {
              body: 'У вас есть непрочитанные сообщения',
              icon: '/favicon.ico',
            });
          }
        }

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Failed to check notifications:', error);
      }
    };

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkNewMessages();
    const interval = setInterval(checkNewMessages, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id, unreadCount]);

  return { unreadCount };
}
