import { createClient } from '@/lib/supabase';

type NotificationType = 
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'deal_created'
  | 'deal_completed'
  | 'deal_paid'
  | 'message_received'
  | 'new_campaign'
  | 'connection_received';

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}) {
  const supabase = createClient();

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message: message || null,
    link: link || null,
    is_read: false,
  });

  if (error) {
    console.error('Error creating notification:', error);
  }

  return !error;
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'application_received':
      return '📨';
    case 'application_accepted':
      return '✅';
    case 'application_rejected':
      return '❌';
    case 'deal_created':
      return '🤝';
    case 'deal_completed':
      return '🎉';
    case 'deal_paid':
      return '💰';
    case 'message_received':
      return '💬';
    case 'new_campaign':
      return '📢';
    case 'connection_received':
      return '👋';
    default:
      return '🔔';
  }
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'application_accepted':
    case 'deal_completed':
    case 'deal_paid':
      return 'text-green-400';
    case 'application_rejected':
      return 'text-red-400';
    default:
      return 'text-white';
  }
}
