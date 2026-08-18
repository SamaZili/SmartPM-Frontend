import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../features/Notifications/hooks/useNotifications';
import styles from './NotificationBell.module.css';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    return new Date(iso).toLocaleDateString('fr-FR');
  };

  return (
    <div className={styles.bellContainer} ref={ref}>
      <button className={styles.bellButton} onClick={() => setOpen(o => !o)}>
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllRead}>Tout marquer lu</button>
            )}
          </div>
          <div className={styles.list}>
            {notifications.length === 0 && <p className={styles.empty}>Aucune notification.</p>}
            {notifications.map(n => (
              <button
                key={n.id}
                className={`${styles.item} ${n.is_read ? '' : styles.unread}`}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <span className={styles.itemMessage}>{n.message}</span>
                <span className={styles.itemTime}>{timeAgo(n.created_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;