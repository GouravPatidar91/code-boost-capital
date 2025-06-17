
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGitHubAuth = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already has GitHub token in localStorage
    const token = localStorage.getItem('github_token');
    const user = localStorage.getItem('github_user');
    
    if (token && user) {
      setGithubToken(token);
      setGithubUser(JSON.parse(user));
      setIsConnected(true);
    }

    // Handle OAuth callback from URL parameters
    const checkOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state === 'github_oauth') {
        try {
          // Exchange code for access token via our edge function
          const { data, error } = await supabase.functions.invoke('github-oauth', {
            body: { code }
          });

          if (error) throw error;

          const { access_token, user } = data;
          
          setGithubToken(access_token);
          setGithubUser(user);
          setIsConnected(true);
          
          // Store in localStorage
          localStorage.setItem('github_token', access_token);
          localStorage.setItem('github_user', JSON.stringify(user));
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "GitHub Connected!",
            description: "Successfully connected to your GitHub account.",
          });
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to complete GitHub authentication.",
            variant: "destructive"
          });
        }
      }
    };

    checkOAuthCallback();
  }, [toast]);

  const connectGitHub = () => {
    // GitHub OAuth configuration
    const clientId = 'YOUR_GITHUB_CLIENT_ID'; // This will be set in the edge function
    const redirectUri = `${window.location.origin}/dashboard`;
    const scope = 'repo,user:email';
    const state = 'github_oauth';

    // Redirect to GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
    
    window.location.href = githubAuthUrl;
  };

  const disconnectGitHub = () => {
    setIsConnected(false);
    setGithubUser(null);
    setGithubToken(null);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    
    toast({
      title: "GitHub Disconnected",
      description: "Successfully disconnected from GitHub.",
    });
  };

  const syncRepository = async (repoFullName: string, developerId: string) => {
    if (!githubToken) {
      toast({
        title: "Error",
        description: "GitHub token not available. Please reconnect.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('github-sync', {
        body: {
          action: 'sync-repository',
          repoData: { full_name: repoFullName },
          developerId,
          githubToken
        }
      });

      if (error) throw error;

      toast({
        title: "Repository Synced!",
        description: "Successfully synced repository data.",
      });

      return data;
    } catch (error) {
      console.error('Error syncing repository:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync repository. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchUserRepos = async () => {
    if (!githubToken) return [];

    try {
      const { data, error } = await supabase.functions.invoke('github-sync', {
        body: {
          action: 'fetch-user-repos',
          githubToken
        }
      });

      if (error) throw error;
      return data.repositories || [];
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }
  };

  return {
    isConnected,
    githubUser,
    githubToken,
    connectGitHub,
    disconnectGitHub,
    syncRepository,
    fetchUserRepos
  };
};
