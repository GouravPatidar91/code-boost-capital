
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useCDPWallet } from '@/hooks/useCDPWallet';
import { MessageSquare, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatInboxProps {
  startupId: string;
  startupName: string;
}

export const ChatInbox = ({ startupId, startupName }: ChatInboxProps) => {
  const { account } = useCDPWallet();
  const { messages, loading } = useRealTimeChat(startupId, account);
  const navigate = useNavigate();
  
  // Group messages by funder (since founder sees all conversations)
  const conversations = messages.reduce((acc, message) => {
    // Skip founder messages when grouping (they are responses)
    if (message.sender_type === 'founder') return acc;
    
    const key = message.sender_wallet_address || 'anonymous';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(message);
    return acc;
  }, {} as Record<string, typeof messages>);

  const conversationList = Object.entries(conversations).map(([senderAddress, msgs]) => {
    const lastMessage = msgs[msgs.length - 1];
    const messageCount = msgs.length;
    // Count unread messages from this specific funder
    const unreadCount = msgs.filter(msg => 
      msg.sender_type === 'funder' && 
      msg.sender_wallet_address === senderAddress
    ).length;
    
    return {
      senderAddress,
      lastMessage,
      messageCount,
      unreadCount,
      messages: msgs
    };
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Inbox
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Inbox
          </div>
          {conversationList.length > 0 && (
            <Badge variant="secondary">
              {conversationList.reduce((total, conv) => total + conv.unreadCount, 0)} new
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Messages from potential funders for {startupName}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {conversationList.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">Funders will appear here when they message you</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {conversationList.map((conversation) => (
                <div
                  key={conversation.senderAddress}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/chat/${startupId}`)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          Funder: {conversation.senderAddress.substring(0, 6)}...{conversation.senderAddress.substring(38)}
                        </p>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.message_content}
                      </p>
                      
                      <div className="mt-1 text-xs text-gray-500">
                        {conversation.messageCount} message{conversation.messageCount > 1 ? 's' : ''} from this funder
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {conversationList.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate(`/chat/${startupId}`)}
            >
              View All Conversations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
