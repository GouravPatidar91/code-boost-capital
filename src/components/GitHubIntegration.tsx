
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { Github, GitBranch, Star, ExternalLink, AlertCircle } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  private: boolean;
}

export const GitHubIntegration = () => {
  const { isConnected, githubUser, connectGitHub, disconnectGitHub, fetchUserRepos, syncRepository } = useGitHubAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      loadRepositories();
    }
  }, [isConnected]);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const repos = await fetchUserRepos();
      setRepositories(repos);
    } catch (error) {
      console.error('Error loading repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRepository = async (repo: Repository) => {
    setSyncing(repo.full_name);
    try {
      await syncRepository(repo.full_name, 'developer-id'); // You'll need to get the actual developer ID
    } finally {
      setSyncing(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Github className="w-6 h-6" />
              <span>Connect GitHub</span>
            </CardTitle>
            <CardDescription>
              Connect your GitHub account to sync repositories and track contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectGitHub} className="w-full">
              <Github className="w-4 h-4 mr-2" />
              Connect with GitHub
            </Button>
          </CardContent>
        </Card>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Required:</strong> To use real GitHub integration, you need to:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Create a GitHub OAuth App in your GitHub Developer Settings</li>
              <li>Add your GitHub Client ID and Client Secret to the project secrets</li>
              <li>Set the Authorization callback URL to: <code>{window.location.origin}/dashboard</code></li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Github className="w-6 h-6" />
              <span>GitHub Integration</span>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectGitHub}>
              Disconnect
            </Button>
          </CardTitle>
          <CardDescription>
            Connected as {githubUser?.login}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Repositories</span>
            <Button onClick={loadRepositories} disabled={loading} size="sm">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading repositories...</div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No repositories found</div>
          ) : (
            <div className="grid gap-4">
              {repositories.map((repo) => (
                <div key={repo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{repo.name}</h3>
                      <p className="text-sm text-gray-600">{repo.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSyncRepository(repo)}
                        disabled={syncing === repo.full_name}
                      >
                        {syncing === repo.full_name ? 'Syncing...' : 'Sync'}
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {repo.language && (
                      <Badge variant="secondary">{repo.language}</Badge>
                    )}
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitBranch className="w-3 h-3" />
                      <span>{repo.forks_count}</span>
                    </div>
                    {repo.private && (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
