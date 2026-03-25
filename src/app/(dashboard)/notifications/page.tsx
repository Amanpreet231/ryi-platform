'use client';

import * as React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Bell, Check, CheckCheck, MessageCircle, UserPlus, Handshake, DollarSign, Megaphone } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = React.useState(false);

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setIsLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true);
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setIsMarkingAllRead(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_received':
        return <UserPlus className="h-5 w-5 text-blue-400" />;
      case 'application_accepted':
        return <Check className="h-5 w-5 text-green-400" />;
      case 'application_rejected':
        return <X className="h-5 w-5 text-red-400" />;
      case 'deal_created':
        return <Handshake className="h-5 w-5 text-purple-400" />;
      case 'deal_completed':
        return <CheckCheck className="h-5 w-5 text-green-400" />;
      case 'deal_paid':
        return <DollarSign className="h-5 w-5 text-yellow-400" />;
      case 'message_received':
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
      case 'new_campaign':
        return <Megaphone className="h-5 w-5 text-orange-400" />;
      case 'connection_received':
        return <UserPlus className="h-5 w-5 text-purple-400" />;
      default:
        return <Bell className="h-5 w-5 text-white" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-zinc-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            isLoading={isMarkingAllRead}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`transition-colors ${
                !notification.is_read 
                  ? 'bg-zinc-900 border-zinc-700' 
                  : 'bg-zinc-900/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full bg-zinc-800 ${
                    !notification.is_read ? 'ring-2 ring-white/20' : ''
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium ${!notification.is_read ? 'text-white' : 'text-zinc-400'}`}>
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {notification.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-500">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {notification.link && (
                      <Link 
                        href={notification.link}
                        className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300"
                        onClick={() => markAsRead(notification.id)}
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No notifications yet</h3>
            <p className="text-zinc-400">
              We&apos;ll notify you when something happens - applications, messages, and more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
