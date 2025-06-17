
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { useStartupListings } from '@/hooks/useStartupListings';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useCDPWallet } from '@/hooks/useCDPWallet';

const Chat = () => {
  const { id } = useParams();
  const [message, setMessage] = useState('');
  const [userType, setUserType] = useState<'funder' | 'founder'>('funder');
  const { startups, loading } = useStartupListings();
  const { messages, loading: chatLoading, sendMessage } = useRealTimeChat(id || '');
  const { account } = useCDPWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const startup = startups?.find(s => s.id === id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() && id) {
      const success = await sendMessage(message.trim(), userType, account || undefined);
      if (success) {
        setMessage('');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading || chatLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Startup not found</div>
          <Button asChild>
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link to="/explore">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Chat with Founder</h1>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://github.com/${startup.developers?.github_username}.png`} />
                  <AvatarFallback>{startup.developers?.github_username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{startup.startup_name}</CardTitle>
                  <CardDescription>Chat with {startup.developers?.github_username}</CardDescription>
                </div>
              </div>
              
              {/* User type selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={userType === 'funder' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserType('funder')}
                  className="text-xs"
                >
                  As Funder
                </Button>
                <Button
                  variant={userType === 'founder' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserType('founder')}
                  className="text-xs"
                >
                  As Founder
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === userType ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_type === userType
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium ${
                          msg.sender_type === userType ? 'text-purple-100' : 'text-gray-600'
                        }`}>
                          {msg.sender_type === 'founder' ? 'Founder' : 'Funder'}
                        </span>
                        {msg.sender_wallet_address && (
                          <span className={`text-xs font-mono ${
                            msg.sender_type === userType ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {msg.sender_wallet_address.substring(0, 6)}...{msg.sender_wallet_address.substring(38)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{msg.message_content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_type === userType ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={!message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Chatting as: <span className="font-medium">{userType === 'founder' ? 'Founder' : 'Funder'}</span>
                {account && (
                  <span className="ml-2">
                    ({account.substring(0, 6)}...{account.substring(38)})
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
