import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notificationApi';
import { AppNotification } from '../../../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationApi.getAll();
      const data = response.data;
      if (data) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  }, []);

  const markRead = useCallback(async (id: number) => {
    await notificationApi.markRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 🔔 rafraîchit toutes les 30 s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead };
}