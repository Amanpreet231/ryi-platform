'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Bell, Check, CheckCheck, MessageCircle, UserPlus, Handshake, IndianRupee, Megaphone } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';

const fade = { hidden: { opacity: 0, y: 10 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.04 } }) };

function XIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>;
}

function getIcon(type: string) {
  switch (type) {
    case 'application_received': return { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'application_accepted': return { icon: Check, color: 'text-green-400', bg: 'bg-green-500/10' };
    case 'application_rejected': return { icon: XIcon, color: 'text-red-400', bg: 'bg-red-500/10' };
    case 'deal_created': return { icon: Handshake, color: 'text-purple-400', bg: 'bg-purple-500/10' };
    case 'deal_completed': return { icon: CheckCheck, color: 'text-green-400', bg: 'bg-green-500/10' };
    case 'deal_paid': return { icon: IndianRupee, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    case 'message_received': return { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'new_campaign': return { icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'connection_received': return { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/10' };
    default: return { icon: Bell, color: 'text-zinc-400', bg: 'bg-zinc-800' };
  }
}

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [markingAll, setMarkingAll] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    setNotifications(data || []);
    setIsLoading(false);
  }, []);

  React.useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) return (
    <div className="space-y-3 max-w-3xl">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div variants={fade} initial="hidden" animate="visible" custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 text-sm font-medium transition-colors disabled:opacity-40">
            {markingAll
              ? <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Marking...</>
              : <><CheckCheck className="h-3.5 w-3.5" />Mark all read</>
            }
          </button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div variants={fade} initial="hidden" animate="visible" custom={1}
          className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-14 text-center">
          <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-7 w-7 text-zinc-600" />
          </div>
          <h3 className="font-semibold text-white mb-1">No notifications yet</h3>
          <p className="text-zinc-500 text-sm">We'll notify you about applications, messages, and deals.</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const { icon: Icon, color, bg } = getIcon(n.type);
            return (
              <motion.div key={n.id} variants={fade} initial="hidden" animate="visible" custom={i + 1}
                className={`bg-zinc-900/60 border rounded-2xl p-4 transition-all ${n.is_read ? 'border-zinc-800/80' : 'border-zinc-700/80'}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-xl ${bg} flex items-center justify-center shrink-0 ${!n.is_read ? 'ring-1 ring-white/10' : ''}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-medium leading-snug ${n.is_read ? 'text-zinc-400' : 'text-white'}`}>{n.title}</p>
                        {n.message && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{n.message}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-600">{formatRelativeTime(n.created_at)}</span>
                        {!n.is_read && (
                          <button onClick={() => markAsRead(n.id)}
                            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-400 transition-colors" title="Mark as read">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {n.link && (
                      <Link href={n.link} onClick={() => markAsRead(n.id)}
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                        View details →
                      </Link>
                    )}
                  </div>
                  {!n.is_read && <div className="h-2 w-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
