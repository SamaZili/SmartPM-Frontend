import { get, put } from '../../../services/api';
import { AppNotification } from '../../../types';

export interface NotificationsPayload {
  notifications: AppNotification[];
  unread_count: number;
}

export const notificationApi = {
  getAll: () => get<NotificationsPayload>('/notifications'),
  markRead: (id: number) => put(`/notifications/${id}/read`, {}),
  markAllRead: () => put('/notifications/read-all', {}),
};