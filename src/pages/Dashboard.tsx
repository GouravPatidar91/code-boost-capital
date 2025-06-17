
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHubIntegration } from '@/components/GitHubIntegration';
import { WalletConnection } from '@/components/WalletConnection';
import { ChatInbox } from '@/components/ChatInbox';
import { StartupCard } from '@/components/StartupCard';
import { useStartupListings } from '@/hooks/useStartupListings';
import { useCDPWallet } from '@/hooks/useCDPWallet';
import { Github } from 'lucide-react';

const Dashboard = () => {
  const { startups, loading, fetchUserStartups } = useStartupListings();
  const { account } = useCDPWallet();
  const [aiAnalysisStartupId, setAiAnalysisStartupId] = useState<string | null>(null);

  const toggleAIAnalysis = (startupId: string) => {
    setAiAnalysisStartupId(aiAnalysisStartupId === startupId ? null : startupId);
  };

  // Fetch user's own startups when account is available
  useEffect(() => {
    if (account) {
      fetchUserStartups();
    }
  }, [account, fetchUserStartups]);

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
                <Github className="w-4 h-4 mr-2" />
                List New Startup
              </Button>
            </div>

            {!account ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-lg text-gray-600 mb-4">Connect your wallet to view your startups</div>
                  <p className="text-gray-500 mb-6">Please connect your wallet to manage your startup listings</p>
                </CardContent>
              </Card>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Loading your startups...</div>
              </div>
            ) : !startups || startups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-lg text-gray-600 mb-4">No startups listed yet</div>
                  <p className="text-gray-500 mb-6">Start by listing your first startup to receive funding</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Github className="w-4 h-4 mr-2" />
                    List Your First Startup
                  </Button>
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

            {!account ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-lg text-gray-600 mb-4">Connect your wallet to view messages</div>
                  <p className="text-gray-500 mb-6">Please connect your wallet to see messages from funders</p>
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
