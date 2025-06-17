
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

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showListingForm, setShowListingForm] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Code Boost Capital</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {user.email}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Fund the Future of
              <span className="text-blue-600"> Open Source</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect developers with investors. Build the next generation of developer tools and platforms.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              {user ? (
                <Button 
                  onClick={() => setShowListingForm(true)}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Submit Your Startup
                </Button>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Authenticated User Content */}
        {user && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <GitHubIntegration />
              <WalletConnection />
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard</CardTitle>
                  <CardDescription>View your startup listings and funding status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/dashboard">
                    <Button className="w-full">Go to Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {showListingForm && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Your Startup</CardTitle>
                    <CardDescription>Create a listing for your startup project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StartupListingForm />
                    <Button 
                      onClick={() => setShowListingForm(false)}
                      variant="outline"
                      className="mt-4"
                    >
                      Cancel
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Startup Listings */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Startups</h2>
          
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading startup listings...</p>
            </div>
          )}

          {!loading && (!startups || startups.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No startup listings available yet.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups && startups.map((startup) => (
              <Card key={startup.id} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{startup.startup_name}</CardTitle>
                    {startup.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {startup.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Funding Goal:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${startup.funding_goal?.toLocaleString()}
                      </span>
                    </div>
                    
                    {startup.project_stage && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stage:</span>
                        <Badge variant="outline">{startup.project_stage}</Badge>
                      </div>
                    )}
                    
                    {startup.team_size && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Team Size:</span>
                        <span className="text-sm font-medium">{startup.team_size} members</span>
                      </div>
                    )}
                    
                    {startup.tags && startup.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {startup.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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
