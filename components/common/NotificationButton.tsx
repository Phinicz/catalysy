import { useState } from "react";
import { BellRing } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-text-primary"
      >
        <BellRing className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full text-text-inverse text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg shadow-lg border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="font-medium text-text-primary">Notifications</h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-text-secondary text-center">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-[var(--color-border)] ${
                    !notification.read ? "bg-background" : ""
                  }`}
                >
                  <h4 className="font-medium text-text-primary">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-text-secondary mt-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-text-tertiary mt-2 block">
                    {notification.date}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
