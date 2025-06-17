
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
import { Github, Plus, AlertCircle, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { startups, loading, fetchUserStartups } = useStartupListings();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [aiAnalysisStartupId, setAiAnalysisStartupId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleAIAnalysis = (startupId: string) => {
    setAiAnalysisStartupId(aiAnalysisStartupId === startupId ? null : startupId);
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check authentication and fetch user data
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthLoading(false);
            navigate('/auth');
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('User authenticated:', session.user.email);
          setUser(session.user);
          setSession(session);
          
          // Fetch user-specific startups
          if (session.user.email) {
            await fetchUserStartups(session.user.email);
          }
        } else if (mounted) {
          console.log('No authenticated user, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          toast({
            title: "Authentication Error",
            description: "Failed to verify authentication. Please log in again.",
            variant: "destructive"
          });
          navigate('/auth');
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setSession(null);
        navigate('/auth');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setSession(session);
        
        // Fetch user-specific startups when user signs in
        if (session.user.email) {
          await fetchUserStartups(session.user.email);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, fetchUserStartups, toast]);

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (this should not be reached due to useEffect redirect)
  if (!user || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with user info and logout */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Developer Dashboard</h1>
            <p className="text-gray-600 flex items-center mt-1">
              <User className="w-4 h-4 mr-2" />
              Welcome, {user.email}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
        
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

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                      disabled={loading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {loading ? 'Loading...' : 'Refresh / Try Again'}
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

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
