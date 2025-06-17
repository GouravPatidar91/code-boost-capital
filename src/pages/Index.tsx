
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitHubIntegration } from '@/components/GitHubIntegration';
import { StartupListingForm } from '@/components/StartupListingForm';
import { WalletConnection } from '@/components/WalletConnection';
import { useStartupListings } from '@/hooks/useStartupListings';
import { User, Session } from '@supabase/supabase-js';
import { Building2, TrendingUp, Users, Wallet, Github, Star, GitBranch } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [activeSection, setActiveSection] = useState<'funder' | 'founder'>('founder');
  const { startups, loading } = useStartupListings();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">CodeChain</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-300">Welcome, {user.email}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl">
              Fund the Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> Open Source</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
              Connect developers with investors. Build the next generation of developer tools and platforms.
            </p>
          </div>
        </div>
      </div>

      {/* Main Section Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                activeSection === 'funder' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400 shadow-lg shadow-green-500/25' 
                  : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveSection('funder')}
            >
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white" />
                <h2 className="text-2xl font-bold text-white">Funder</h2>
                <p className="text-gray-200 mt-2">Invest in promising open source projects</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                activeSection === 'founder' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 shadow-lg shadow-blue-500/25' 
                  : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
              }`}
              onClick={() => setActiveSection('founder')}
            >
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-white" />
                <h2 className="text-2xl font-bold text-white">Founder</h2>
                <p className="text-gray-200 mt-2">Get funding for your innovative ideas</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dynamic Content Based on Selection */}
        {activeSection === 'founder' && (
          <div className="space-y-8">
            {user ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Github className="w-5 h-5" />
                        <span>GitHub Integration</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GitHubIntegration />
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-white">
                        <Wallet className="w-5 h-5" />
                        <span>Wallet Connection</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <WalletConnection />
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Submit Startup</CardTitle>
                      <CardDescription className="text-gray-300">
                        Create a listing for your project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setShowListingForm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Your Startup
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {showListingForm && (
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Submit Your Startup</CardTitle>
                      <CardDescription className="text-gray-300">
                        Create a listing for your startup project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StartupListingForm onBack={() => setShowListingForm(false)} />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Launch Your Startup?</h3>
                <p className="text-gray-300 mb-8">Connect your GitHub and wallet to get started</p>
                <Link to="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started as Founder
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeSection === 'funder' && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-white mb-4">Discover Investment Opportunities</h3>
            <p className="text-gray-300 mb-8">Browse and fund innovative open source projects</p>
            {!user ? (
              <Link to="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Get Started as Funder
                </Button>
              </Link>
            ) : (
              <p className="text-gray-300">Explore the featured startups below to start investing</p>
            )}
          </div>
        )}

        {/* Featured Startups Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Featured Startups</h2>
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
              {startups?.length || 0} Projects
            </Badge>
          </div>
          
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading startup listings...</p>
            </div>
          )}

          {!loading && (!startups || startups.length === 0) && (
            <Card className="bg-gray-800/30 border-gray-600">
              <CardContent className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No startup listings available yet.</p>
                <p className="text-gray-500 mt-2">Be the first to submit your project!</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups && startups.map((startup) => (
              <Card key={startup.id} className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white">{startup.startup_name}</CardTitle>
                    {startup.verified && (
                      <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 text-gray-300">
                    {startup.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-400">Funding Goal:</span>
                      <span className="text-lg font-bold text-green-400">
                        ${startup.funding_goal?.toLocaleString()}
                      </span>
                    </div>
                    
                    {startup.project_stage && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Stage:</span>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                          {startup.project_stage}
                        </Badge>
                      </div>
                    )}
                    
                    {startup.team_size && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Team Size:</span>
                        <span className="text-sm font-medium text-white">{startup.team_size} members</span>
                      </div>
                    )}

                    {startup.github_repositories && (
                      <div className="pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{startup.github_repositories.name}</span>
                          <div className="flex items-center space-x-3 text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{startup.github_repositories.stars_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GitBranch className="w-3 h-3" />
                              <span>{startup.github_repositories.forks_count}</span>
                            </div>
                          </div>
                        </div>
                        {startup.github_repositories.language && (
                          <Badge variant="secondary" className="mt-2 bg-gray-700 text-gray-300">
                            {startup.github_repositories.language}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {startup.tags && startup.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {startup.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-purple-600/20 text-purple-300 border-purple-500/30">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
