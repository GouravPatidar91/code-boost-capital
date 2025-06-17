
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AIAnalysisCard } from '@/components/AIAnalysisCard';
import { useFundingData } from '@/hooks/useFundingData';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { Github, MessageSquare, TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StartupCardProps {
  startup: {
    id: string;
    startup_name: string;
    description: string;
    funding_goal: number;
    project_stage?: string;
    team_size?: number;
    verified: boolean;
    created_at: string;
    github_repositories?: {
      full_name: string;
      stars_count: number;
      html_url: string;
    } | null;
    developers?: {
      github_username: string;
    } | null;
  };
}

export const StartupCard = ({ startup }: StartupCardProps) => {
  const { fundingData, loading: fundingLoading } = useFundingData(startup.id);
  const { messages } = useRealTimeChat(startup.id);
  const navigate = useNavigate();

  // Calculate unread messages from funders
  const unreadMessages = messages.filter(msg => msg.sender_type === 'funder').length;
  
  // Use real funding data or fallback to defaults
  const totalRaised = fundingData?.total_raised || 0;
  const fundingGoal = fundingData?.funding_goal || startup.funding_goal;
  const fundingPercentage = fundingData?.funding_percentage || 0;
  const totalFunders = fundingData?.total_funders || 0;

  return (
    <div className="space-y-4">
      {/* Main Startup Card */}
      <Card className="hover:shadow-lg transition-all duration-300">
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
          
          {/* Real Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-medium">
                ${totalRaised.toLocaleString()} / ${fundingGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={fundingPercentage} className="h-2" />
            <div className="text-xs text-gray-500">
              {fundingPercentage.toFixed(1)}% funded
            </div>
          </div>

          {/* Real Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center py-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {fundingLoading ? '...' : totalFunders}
              </div>
              <div className="text-xs text-gray-600">Funders</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600 relative">
                {messages.length}
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
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
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 relative"
              onClick={() => navigate(`/chat/${startup.id}`)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat Inbox
              {unreadMessages > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {unreadMessages}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>

          {/* Recent Activity with Real Data */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {totalRaised > 0 && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Total funding: ${totalRaised.toLocaleString()}</span>
                  <span className="text-gray-400">Live data</span>
                </div>
              )}
              {unreadMessages > 0 && (
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{unreadMessages} new message{unreadMessages > 1 ? 's' : ''} from funders</span>
                  <span className="text-gray-400">Now</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Listed on platform</span>
                <span className="text-gray-400">
                  {new Date(startup.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Card */}
      {startup.github_repositories?.html_url && (
        <AIAnalysisCard
          startupId={startup.id}
          githubRepoUrl={startup.github_repositories.html_url}
          startupName={startup.startup_name}
        />
      )}
    </div>
  );
};
