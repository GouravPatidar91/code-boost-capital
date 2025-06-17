import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Wallet, Shield, TrendingUp, Users, MessageSquare, Star, GitCommit, DollarSign, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StartupListingForm } from '@/components/StartupListingForm';

const Index = () => {
  const [userRole, setUserRole] = useState<'founder' | 'funder'>('funder');
  const [showListingForm, setShowListingForm] = useState(false);

  const mockStartups = [
    {
      id: 1,
      name: "DefiLend Protocol",
      description: "Decentralized lending platform with AI-powered risk assessment",
      founder: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      githubRepo: "sarahchen/defilend-protocol",
      trustScore: 92,
      raised: 150000,
      goal: 500000,
      backers: 47,
      commits: 234,
      contributors: 8,
      tags: ["DeFi", "AI", "Lending"],
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      name: "ChainVault",
      description: "Multi-chain asset management with institutional-grade security",
      founder: "Alex Rodriguez",
      avatar: "/api/placeholder/40/40",
      githubRepo: "alexrod/chainvault",
      trustScore: 87,
      raised: 75000,
      goal: 300000,
      backers: 23,
      commits: 156,
      contributors: 5,
      tags: ["Security", "Multi-chain", "Vault"],
      lastActivity: "1 day ago"
    },
    {
      id: 3,
      name: "ZKProof Labs",
      description: "Zero-knowledge privacy solutions for enterprise applications",
      founder: "Maya Patel",
      avatar: "/api/placeholder/40/40",
      githubRepo: "mayap/zkproof-labs",
      trustScore: 95,
      raised: 200000,
      goal: 750000,
      backers: 62,
      commits: 387,
      contributors: 12,
      tags: ["ZK", "Privacy", "Enterprise"],
      lastActivity: "4 hours ago"
    }
  ];

  if (showListingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <StartupListingForm onBack={() => setShowListingForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                FundChain
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={userRole === 'funder' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserRole('funder')}
                  className="text-xs"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Funder
                </Button>
                <Button
                  variant={userRole === 'founder' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserRole('founder')}
                  className="text-xs"
                >
                  <Github className="w-3 h-3 mr-1" />
                  Founder
                </Button>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Fund the Future of Web3
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover, analyze, and invest in promising startups through AI-verified GitHub projects. 
              Secure funding with CDP Wallet integration and milestone-based payouts.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="flex items-center space-x-2 text-gray-700">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium">AI Trust Score</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Github className="w-5 h-5 text-purple-600" />
                <span className="font-medium">GitHub Integration</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span className="font-medium">CDP Wallet</span>
              </div>
            </div>

            {userRole === 'founder' ? (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-3"
                onClick={() => setShowListingForm(true)}
              >
                <Github className="w-5 h-5 mr-2" />
                List Your Startup
              </Button>
            ) : (
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-3">
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore Startups
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800">
              {userRole === 'founder' ? 'Your Projects' : 'Trending Startups'}
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">DeFi</Button>
              <Button variant="outline" size="sm">AI</Button>
              <Button variant="outline" size="sm">Gaming</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStartups.map((startup) => (
              <Card key={startup.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={startup.avatar} />
                        <AvatarFallback>{startup.founder.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{startup.name}</CardTitle>
                        <p className="text-sm text-gray-500">by {startup.founder}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${
                        startup.trustScore >= 90 ? 'bg-green-100 text-green-800' :
                        startup.trustScore >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {startup.trustScore}% Trust
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
                      <span>{startup.githubRepo}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitCommit className="w-3 h-3" />
                      <span>{startup.commits}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Funding Progress</span>
                      <span className="font-medium">
                        ${startup.raised.toLocaleString()} / ${startup.goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(startup.raised / startup.goal) * 100} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{startup.backers} backers</span>
                    <span>{startup.lastActivity}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {startup.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600" size="sm">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Fund
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Platform Stats</h3>
            <p className="text-purple-100">Building the future of decentralized funding</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">$2.4M</div>
              <div className="text-purple-100">Total Funded</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">156</div>
              <div className="text-purple-100">Active Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,247</div>
              <div className="text-purple-100">Total Backers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">94%</div>
              <div className="text-purple-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">FundChain</h4>
              </div>
              <p className="text-gray-400 text-sm">
                The future of startup funding through blockchain and AI verification.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Platform</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>How it Works</li>
                <li>Trust Scoring</li>
                <li>Security</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Community</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Discord</li>
                <li>Twitter</li>
                <li>GitHub</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Status</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 FundChain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
