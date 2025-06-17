
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Shield, Star, DollarSign, MessageSquare, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStartupListings } from '@/hooks/useStartupListings';

const Explore = () => {
  const { startups, loading } = useStartupListings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Explore Startups</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">DeFi</Button>
              <Button variant="outline" size="sm">AI</Button>
              <Button variant="outline" size="sm">Gaming</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading startups...</div>
          </div>
        ) : !startups || startups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">No verified startups found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <Card key={startup.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`https://github.com/${startup.developers?.github_username}.png`} />
                        <AvatarFallback>{startup.developers?.github_username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{startup.startup_name}</CardTitle>
                        <p className="text-sm text-gray-500">by {startup.developers?.github_username}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-100 text-green-800"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {startup.description}
                  </CardDescription>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Github className="w-3 h-3" />
                      <span>{startup.github_repositories?.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{startup.github_repositories?.stars_count}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Funding Goal</span>
                      <span className="font-medium">
                        ${startup.funding_goal?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{startup.project_stage || 'Not specified'}</span>
                    <span>{new Date(startup.created_at).toLocaleDateString()}</span>
                  </div>

                  {startup.tags && startup.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {startup.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600" size="sm" asChild>
                      <Link to={`/fund/${startup.id}`}>
                        <DollarSign className="w-4 h-4 mr-1" />
                        Fund
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/chat/${startup.id}`}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
