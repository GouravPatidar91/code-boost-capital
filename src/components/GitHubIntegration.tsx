
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { Github, GitBranch, Star, ExternalLink, AlertCircle, Loader2, Key } from 'lucide-react';

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
  const { 
    isConnected, 
    githubUser, 
    isConnecting,
    connectGitHub, 
    disconnectGitHub, 
    fetchUserRepos, 
    syncRepository,
    verifyAndConnectToken
  } = useGitHubAuth();
  
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

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
      await syncRepository(repo.full_name, 'developer-id');
    } finally {
      setSyncing(null);
    }
  };

  const handleTokenSubmit = async () => {
    if (!tokenInput.trim()) return;
    
    await verifyAndConnectToken(tokenInput.trim());
    setTokenInput('');
    setShowTokenInput(false);
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
          <CardContent className="space-y-4">
            {!showTokenInput ? (
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowTokenInput(true)} 
                  className="w-full" 
                  disabled={isConnecting}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Enter Personal Access Token
                </Button>
                <div className="text-center">
                  <span className="text-sm text-gray-500">or</span>
                </div>
                <Button 
                  onClick={connectGitHub} 
                  className="w-full" 
                  variant="outline"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 mr-2" />
                      Create New Token
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="token" className="text-sm font-medium">
                    Personal Access Token
                  </label>
                  <Textarea
                    id="token"
                    placeholder="Paste your GitHub Personal Access Token here..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="min-h-[100px] font-mono text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleTokenSubmit}
                    disabled={!tokenInput.trim() || isConnecting}
                    className="flex-1"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowTokenInput(false);
                      setTokenInput('');
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to get your Personal Access Token:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
              <li>Click "Generate new token (classic)"</li>
              <li>Select scopes: <code>repo</code>, <code>user:email</code>, <code>read:user</code></li>
              <li>Copy the generated token and paste it above</li>
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
            Connected as {githubUser?.login} • {githubUser?.public_repos} repositories
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Repositories</span>
            <Button onClick={loadRepositories} disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading repositories...
            </div>
          ) : repositories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No repositories found</div>
          ) : (
            <div className="grid gap-4">
              {repositories.map((repo) => (
                <div key={repo.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{repo.name}</h3>
                      <p className="text-sm text-gray-600">{repo.description || 'No description'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSyncRepository(repo)}
                        disabled={syncing === repo.full_name}
                      >
                        {syncing === repo.full_name ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          'Sync'
                        )}
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
