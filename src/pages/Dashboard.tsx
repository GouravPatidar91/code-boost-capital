
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GitHubIntegration } from '@/components/GitHubIntegration';
import { WalletConnection } from '@/components/WalletConnection';
import { useStartupListings } from '@/hooks/useStartupListings';
import { Github, DollarSign, MessageSquare, Calendar, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { startups, loading } = useStartupListings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Developer Dashboard</h1>
        
        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="funding">My Startups</TabsTrigger>
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
          
          <TabsContent value="funding" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Listed Startups</h2>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Github className="w-4 h-4 mr-2" />
                List New Startup
              </Button>
            </div>

            {loading ? (
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {startups.map((startup) => (
                  <Card key={startup.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{startup.startup_name}</CardTitle>
                          <CardDescription className="mt-1">
                            {startup.github_repositories?.full_name}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={startup.verified ? "default" : "secondary"}
                          className={startup.verified ? "bg-green-100 text-green-800" : ""}
                        >
                          {startup.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm">{startup.description}</p>
                      
                      {/* Funding Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Funding Progress</span>
                          <span className="font-medium">
                            $37,500 / ${startup.funding_goal?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                        <Progress value={15} className="h-2" />
                        <div className="text-xs text-gray-500">15% funded</div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 text-center py-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-lg font-semibold text-purple-600">3</div>
                          <div className="text-xs text-gray-600">Funders</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-600">12</div>
                          <div className="text-xs text-gray-600">Messages</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {startup.github_repositories?.stars_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Stars</div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Stage</span>
                          <p className="font-medium">{startup.project_stage || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Team Size</span>
                          <p className="font-medium">{startup.team_size || 'Not specified'}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat Inbox (12)
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Recent Activity */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>New funding received: $5,000</span>
                            <span className="text-gray-400">2h ago</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>New message from investor</span>
                            <span className="text-gray-400">5h ago</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Repository updated</span>
                            <span className="text-gray-400">1d ago</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
