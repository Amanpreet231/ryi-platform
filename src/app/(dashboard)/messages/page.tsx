'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation, Message } from '@/types';

function UserAvatar({ name, url, size = 'md' }: { name?: string; url?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  if (url) return <img src={url} alt={name} className={`${sizeClass} rounded-full object-cover border border-zinc-700 shrink-0`} />;
  return (
    <div className={`${sizeClass} rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 shrink-0`}>
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [conversations, setConversations] = React.useState<(Conversation & { other_user?: any })[]>([]);
  const [selected, setSelected] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: convos } = await supabase
        .from('conversations').select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (convos) {
        const enriched = await Promise.all(convos.map(async (c) => {
          const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
          const { data: p } = await supabase.from('profiles').select('*').eq('id', otherId).single();
          let profile = p;
          if (p?.user_type === 'influencer') {
            const { data: ip } = await supabase.from('influencer_profiles').select('*').eq('user_id', otherId).single();
            profile = { ...p, ...ip };
          } else if (p?.user_type === 'brand') {
            const { data: bp } = await supabase.from('brand_profiles').select('*').eq('user_id', otherId).single();
            profile = { ...p, ...bp };
          }
          return { ...c, other_user: profile };
        }));
        setConversations(enriched);
      }
      setIsLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    if (!selected) return;
    (async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversation_id', selected.id).order('created_at', { ascending: true });
      setMessages(data || []);
    })();

    const sub = supabase.channel(`msg:${selected.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selected.id}` },
        (p) => setMessages(prev => [...prev, p.new as Message]))
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [selected]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selected || !currentUser) return;
    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    await supabase.from('messages').insert({ conversation_id: selected.id, sender_id: currentUser.id, content });
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', selected.id);
    setIsSending(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const otherName = (c: any) => c?.other_user?.full_name || c?.other_user?.company_name || 'User';

  if (isLoading) return (
    <div className="flex h-[calc(100vh-120px)] bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
      <div className="w-80 border-r border-zinc-800 p-4 space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-zinc-800 rounded-xl animate-pulse" />)}
      </div>
      <div className="flex-1 flex items-center justify-center text-zinc-600">
        <MessageCircle className="h-8 w-8" />
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-120px)] bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-80 border-r border-zinc-800 flex flex-col shrink-0 ${selected ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-3.5 border-b border-zinc-800">
          <h2 className="font-semibold text-white text-sm">Messages</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-600">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Accept an application to start chatting</p>
            </div>
          ) : conversations.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 ${selected?.id === c.id ? 'bg-zinc-800/60' : ''}`}>
              <UserAvatar name={otherName(c)} url={c.other_user?.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-white text-sm truncate">{otherName(c)}</p>
                  {c.last_message_at && <span className="text-xs text-zinc-600 shrink-0">{formatRelativeTime(c.last_message_at)}</span>}
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{c.last_message || 'Start a conversation'}</p>
                {c.other_user?.user_type && <p className="text-xs text-zinc-700 capitalize mt-0.5">{c.other_user.user_type}</p>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selected ? 'hidden md:flex' : 'flex'}`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-zinc-600">
            <div className="text-center">
              <MessageCircle className="h-14 w-14 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
              <button onClick={() => setSelected(null)} className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <UserAvatar name={otherName(selected)} url={selected.other_user?.avatar_url} size="sm" />
              <div>
                <p className="font-semibold text-white text-sm">{otherName(selected)}</p>
                {selected.other_user?.user_type && <p className="text-xs text-zinc-500 capitalize">{selected.other_user.user_type}</p>}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-zinc-600 text-sm py-8">No messages yet — say hello!</div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${isMe ? 'bg-white text-black rounded-br-md' : 'bg-zinc-800 text-white rounded-bl-md'}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-zinc-500' : 'text-zinc-500'}`}>{formatRelativeTime(msg.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message…"
                  disabled={isSending}
                  className="flex-1 bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-40"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim() || isSending}
                  className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-40 shrink-0">
                  {isSending
                    ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    : <Send className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
