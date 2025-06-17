
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHubIntegration } from '@/components/GitHubIntegration';
import { WalletConnection } from '@/components/WalletConnection';
import { ChatInbox } from '@/components/ChatInbox';
import { StartupCard } from '@/components/StartupCard';
import { useStartupListings } from '@/hooks/useStartupListings';
import { supabase } from '@/integrations/supabase/client';
import { Github, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { startups, loading, fetchUserStartups } = useStartupListings();
  const [user, setUser] = useState(null);
  const [aiAnalysisStartupId, setAiAnalysisStartupId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleAIAnalysis = (startupId: string) => {
    setAiAnalysisStartupId(aiAnalysisStartupId === startupId ? null : startupId);
  };

  // Check authentication and fetch user startups
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: "Authentication Error",
            description: "Failed to get user session.",
            variant: "destructive"
          });
          return;
        }

        if (session?.user) {
          console.log('User authenticated:', session.user.email);
          setUser(session.user);
          
          // Fetch user startups using the authenticated user's email
          if (session.user.email) {
            await fetchUserStartups(session.user.email);
          }
        } else {
          console.log('No authenticated user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user data.",
          variant: "destructive"
        });
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        console.log('Auth state changed - user logged in:', session.user.email);
        setUser(session.user);
        
        // Fetch user startups when auth state changes
        if (session.user.email) {
          await fetchUserStartups(session.user.email);
        }
      } else {
        console.log('Auth state changed - user logged out');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserStartups, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
        
        <Tabs defaultValue="funding" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funding">My Startups</TabsTrigger>
            <TabsTrigger value="chat">Funder Messages</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="funding" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">My Listed Startups</h2>
                <p className="text-gray-600 mt-1">Manage your startups and chat with potential funders</p>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                List New Startup
              </Button>
            </div>

            {!user ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-lg text-gray-600 mb-4">Authentication Required</div>
                  <p className="text-gray-500 mb-6">Please log in to see your startups</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Log In
                  </Button>
                </CardContent>
              </Card>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Loading your startups...</div>
              </div>
            ) : !startups || startups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <div className="text-lg text-gray-600 mb-4">No startups found</div>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any startups associated with your account ({user.email}).
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Make sure you're using the same email address that you used when creating your startup listing.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={() => fetchUserStartups(user.email)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Refresh / Try Again
                    </Button>
                    <div className="text-xs text-gray-400">
                      or
                    </div>
                    <Button variant="outline" className="border-purple-200">
                      <Github className="w-4 h-4 mr-2" />
                      List Your First Startup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {startups.map((startup) => (
                  <StartupCard 
                    key={startup.id} 
                    startup={startup}
                    showAIAnalysis={aiAnalysisStartupId === startup.id}
                    onToggleAIAnalysis={() => toggleAIAnalysis(startup.id)}
                    isFounderView={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Funder Messages</h2>
                <p className="text-gray-600">Messages from potential funders interested in your startups</p>
              </div>
            </div>

            {!user ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-lg text-gray-600 mb-4">Authentication Required</div>
                  <p className="text-gray-500 mb-6">Please log in to see your messages</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Log In
                  </Button>
                </CardContent>
              </Card>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Loading chat data...</div>
              </div>
            ) : !startups || startups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-lg text-gray-600 mb-4">No startups listed</div>
                  <p className="text-gray-500 mb-6">List a startup first to receive messages from funders</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Github className="w-4 h-4 mr-2" />
                    List Your First Startup
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {startups.map((startup) => (
                  <ChatInbox
                    key={startup.id}
                    startupId={startup.id}
                    startupName={startup.startup_name}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GitHubIntegration />
              <WalletConnection />
            </div>
          </TabsContent>
          
          <TabsContent value="repositories">
            <GitHubIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
