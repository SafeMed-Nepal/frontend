import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/ToastContext';

export default function NotificationBell() {
  const { i18n, t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = i18n.language || 'en';

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, status: 'read' })));
      showToast(t('notifications.allMarkedRead', 'All notifications marked as read'), 'success');
    } catch (err) {
      console.error('Mark all read error:', err);
      showToast(t('notifications.failedMarkRead', 'Failed to mark notifications read'), 'error');
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    try {
      if (notif.status === 'unread') {
        await api.markNotificationAsRead(notif.id);
        setNotifications(
          notifications.map((n) => (n.id === notif.id ? { ...n, status: 'read' } : n))
        );
      }
      
      // Redirect to the admin review / details page if a remedy reference is attached
      if (notif.remedy_id) {
        const targetPath = `/admin/remedy/${notif.remedy_id}`;
        if (window.location.pathname === targetPath) {
          // If we are already on the target review page, trigger custom refresh event
          window.dispatchEvent(
            new CustomEvent('safemed-refresh-remedy', { detail: { remedyId: notif.remedy_id } })
          );
        } else {
          navigate(targetPath);
        }
      }
    } catch (err) {
      console.error('Notification click error:', err);
    }
  };

  const formatTimeAgo = (dateString, lang) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    if (seconds < 60) {
      return lang === 'ne' ? 'भर्खरै' : 'just now';
    }

    for (const [key, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        if (lang === 'ne') {
          const translation = {
            year: 'वर्ष पहिले',
            month: 'महिना पहिले',
            day: 'दिन पहिले',
            hour: 'घण्टा पहिले',
            minute: 'मिनेट पहिले',
          };
          return `${count} ${translation[key]}`;
        }
        return `${count} ${key}${count > 1 ? 's' : ''} ago`;
      }
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600 focus:outline-none transition-all active:scale-95 cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-[100] transition-all duration-200 ease-out origin-top-right">
          {/* Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              {t('notifications.title', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('notifications.markAllRead', 'Mark all read')}</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                {t('notifications.empty', 'No notifications yet')}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 text-left transition hover:bg-amber-50/30 cursor-pointer relative ${
                    notif.status === 'unread' ? 'bg-amber-50/10 font-medium' : ''
                  }`}
                >
                  {/* Unread dot indicator */}
                  {notif.status === 'unread' && (
                    <span className="absolute top-4.5 right-4 w-2 h-2 bg-amber-500 rounded-full"></span>
                  )}
                  
                  <div className="pr-4">
                    <p className={`text-sm text-slate-900 ${notif.status === 'unread' ? 'font-bold' : 'font-semibold'}`}>
                      {currentLang === 'ne' ? notif.title_ne : notif.title_en}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {currentLang === 'ne' ? notif.message_ne : notif.message_en}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-normal">
                      {formatTimeAgo(notif.created_at, currentLang)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
