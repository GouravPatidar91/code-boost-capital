
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  startup_listing_id: string;
  sender_type: 'funder' | 'founder';
  sender_wallet_address?: string;
  message_content: string;
  created_at: string;
}

export const useRealTimeChat = (startupId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('startup_listing_id', startupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'funder' | 'founder'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch chat messages.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [startupId, toast]);

  const sendMessage = async (
    messageContent: string,
    senderType: 'funder' | 'founder',
    senderWalletAddress?: string
  ) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          startup_listing_id: startupId,
          sender_type: senderType,
          sender_wallet_address: senderWalletAddress,
          message_content: messageContent
        });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Your message has been sent successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `startup_listing_id=eq.${startupId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = {
            ...payload.new,
            sender_type: payload.new.sender_type as 'funder' | 'founder'
          } as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [startupId, fetchMessages]);

  return {
    messages,
    loading,
    sendMessage,
    fetchMessages
  };
};
