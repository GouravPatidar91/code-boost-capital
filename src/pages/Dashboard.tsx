
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubIntegration } from '@/components/GitHubIntegration';
import { WalletConnection } from '@/components/WalletConnection';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
        
        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GitHubIntegration />
              <WalletConnection />
            </div>
          </TabsContent>
          
          <TabsContent value="repositories">
            <GitHubIntegration />
          </TabsContent>
          
          <TabsContent value="funding">
            <WalletConnection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
