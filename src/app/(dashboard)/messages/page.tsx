'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button, Input, Avatar, Card, Spinner } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation, Message, User } from '@/types';

export default function MessagesPage() {
  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [conversations, setConversations] = React.useState<(Conversation & { other_user?: any; last_message_preview?: string })[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<any>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchUserAndConversations();
  }, []);

  React.useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      const subscription = subscribeToMessages(selectedConversation.id);
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [selectedConversation]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserAndConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const { data: convos } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (convos) {
      const enrichedConvos = await Promise.all(
        convos.map(async (convo) => {
          const otherUserId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1;
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single();
          
          let otherUserProfile = otherUser;
          if (otherUser?.user_type === 'influencer') {
            const { data: infProfile } = await supabase
              .from('influencer_profiles')
              .select('*')
              .eq('user_id', otherUserId)
              .single();
            otherUserProfile = { ...otherUser, ...infProfile };
          } else if (otherUser?.user_type === 'brand') {
            const { data: brandProfile } = await supabase
              .from('brand_profiles')
              .select('*')
              .eq('user_id', otherUserId)
              .single();
            otherUserProfile = { ...otherUser, ...brandProfile };
          }

          return {
            ...convo,
            other_user: otherUserProfile,
          };
        })
      );
      setConversations(enrichedConvos);
    }

    setIsLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const subscribeToMessages = (conversationId: string) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    
    setIsSending(true);
    
    await supabase.from('messages').insert({
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    await supabase
      .from('conversations')
      .update({
        last_message: newMessage.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', selectedConversation.id);

    setNewMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-zinc-800 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversation(convo)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-zinc-800 transition-colors text-left ${
                  selectedConversation?.id === convo.id ? 'bg-zinc-800' : ''
                }`}
              >
                <Avatar 
                  src={convo.other_user?.avatar_url}
                  fallback={convo.other_user?.full_name || convo.other_user?.company_name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white truncate">
                      {convo.other_user?.full_name || convo.other_user?.company_name || 'User'}
                    </p>
                    <span className="text-xs text-zinc-500">
                      {convo.last_message_at ? formatRelativeTime(convo.last_message_at) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">
                    {convo.last_message || 'Start a conversation'}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize">
                    {convo.other_user?.user_type}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Accept an application to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar 
                src={selectedConversation.other_user?.avatar_url}
                fallback={selectedConversation.other_user?.full_name || selectedConversation.other_user?.company_name}
                size="md"
              />
              <div>
                <p className="font-medium text-white">
                  {selectedConversation.other_user?.full_name || selectedConversation.other_user?.company_name}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {selectedConversation.other_user?.user_type}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender_id === user?.id
                        ? 'bg-white text-black rounded-br-md'
                        : 'bg-zinc-800 text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === user?.id ? 'text-zinc-600' : 'text-zinc-500'
                    }`}>
                      {formatRelativeTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  isLoading={isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm mt-1">Choose from your existing conversations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
