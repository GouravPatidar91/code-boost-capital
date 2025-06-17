
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

    // Handle OAuth callback from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        const { token, user } = event.data;
        setGithubToken(token);
        setGithubUser(user);
        setIsConnected(true);
        
        // Store in localStorage
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_user', JSON.stringify(user));
        
        toast({
          title: "GitHub Connected!",
          description: "Successfully connected to your GitHub account.",
        });
      } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
        toast({
          title: "Connection Failed",
          description: event.data.error || "Failed to connect to GitHub.",
          variant: "destructive"
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast]);

  const connectGitHub = () => {
    // For demo purposes, we'll simulate the OAuth flow
    // In a real implementation, you would need to set up GitHub OAuth app
    // and handle the actual OAuth flow through Supabase Auth or a custom implementation
    
    toast({
      title: "GitHub OAuth Setup Required",
      description: "Please configure GitHub OAuth credentials in your project settings.",
      variant: "destructive"
    });

    // Temporary demo connection for testing
    setTimeout(() => {
      const demoUser = {
        login: 'demo-user',
        id: 123456,
        avatar_url: 'https://github.com/github.png',
        name: 'Demo User',
        email: 'demo@example.com'
      };
      
      const demoToken = 'demo-token-' + Date.now();
      
      setGithubToken(demoToken);
      setGithubUser(demoUser);
      setIsConnected(true);
      
      localStorage.setItem('github_token', demoToken);
      localStorage.setItem('github_user', JSON.stringify(demoUser));
      
      toast({
        title: "Demo Mode",
        description: "Connected in demo mode. Configure GitHub OAuth for real integration.",
      });
    }, 1000);
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

    // In demo mode, return mock repositories
    if (githubToken.startsWith('demo-token')) {
      return [
        {
          id: 1,
          name: 'awesome-project',
          full_name: 'demo-user/awesome-project',
          description: 'An awesome demo project',
          html_url: 'https://github.com/demo-user/awesome-project',
          language: 'TypeScript',
          stargazers_count: 42,
          forks_count: 7,
          updated_at: new Date().toISOString(),
          private: false
        },
        {
          id: 2,
          name: 'react-components',
          full_name: 'demo-user/react-components',
          description: 'Reusable React components library',
          html_url: 'https://github.com/demo-user/react-components',
          language: 'JavaScript',
          stargazers_count: 15,
          forks_count: 3,
          updated_at: new Date().toISOString(),
          private: false
        }
      ];
    }

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
