
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
  }, []);

  const connectGitHub = () => {
    const clientId = 'your_github_client_id'; // You'll need to set this up
    const redirectUri = `${window.location.origin}/github/callback`;
    const scope = 'repo,user:email';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    // Open GitHub OAuth in a popup
    const popup = window.open(authUrl, 'github-auth', 'width=600,height=600');
    
    // Listen for the callback
    const messageListener = (event: MessageEvent) => {
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
        
        popup?.close();
        window.removeEventListener('message', messageListener);
      }
    };
    
    window.addEventListener('message', messageListener);
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
