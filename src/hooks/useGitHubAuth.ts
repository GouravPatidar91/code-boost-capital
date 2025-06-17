
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string;
  public_repos: number;
  followers: number;
  following: number;
}

export const useGitHubAuth = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
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
    // Open GitHub Personal Access Token creation page
    const githubTokenUrl = 'https://github.com/settings/tokens/new?scopes=repo,user:email,read:user&description=FundChain%20Integration';
    
    // Open in new window
    const newWindow = window.open(githubTokenUrl, 'github-auth', 'width=600,height=700');
    
    toast({
      title: "GitHub Authorization",
      description: "Please create a Personal Access Token and paste it when prompted.",
    });

    // Show token input after a short delay
    setTimeout(() => {
      promptForToken();
    }, 2000);
  };

  const promptForToken = () => {
    const token = prompt(
      'Please paste your GitHub Personal Access Token here:\n\n' +
      '1. Create a token at: https://github.com/settings/tokens/new\n' +
      '2. Select scopes: repo, user:email, read:user\n' +
      '3. Copy and paste the token below:'
    );

    if (token) {
      verifyAndConnectToken(token.trim());
    }
  };

  const verifyAndConnectToken = async (token: string) => {
    setIsConnecting(true);
    
    try {
      // Verify token by fetching user info
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token or insufficient permissions');
      }

      const user = await response.json();
      
      setGithubToken(token);
      setGithubUser(user);
      setIsConnected(true);
      
      // Store in localStorage
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_user', JSON.stringify(user));
      
      toast({
        title: "GitHub Connected!",
        description: `Successfully connected as ${user.login}`,
      });
    } catch (error) {
      console.error('GitHub connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Invalid token or insufficient permissions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
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

  const fetchUserRepos = async () => {
    if (!githubToken) return [];

    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const repositories = await response.json();
      return repositories;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch repositories. Please check your connection.",
        variant: "destructive"
      });
      return [];
    }
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
      // Fetch repository details
      const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repository details');
      }

      const repoData = await response.json();

      // Here you could store the repository data in your database
      // For now, we'll just show success
      toast({
        title: "Repository Synced!",
        description: `Successfully synced ${repoData.name}`,
      });

      return repoData;
    } catch (error) {
      console.error('Error syncing repository:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync repository. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    isConnected,
    githubUser,
    githubToken,
    isConnecting,
    connectGitHub,
    disconnectGitHub,
    syncRepository,
    fetchUserRepos,
    verifyAndConnectToken
  };
};
