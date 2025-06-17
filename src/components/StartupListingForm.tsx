import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGitHubAuth } from '@/hooks/useGitHubAuth';
import { useStartupListings } from '@/hooks/useStartupListings';
import { Github, ArrowLeft, DollarSign, Users, Calendar, Target } from 'lucide-react';

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
  fork: boolean;
  clone_url: string;
  open_issues_count: number;
  size: number;
  pushed_at: string;
}

interface StartupListingFormProps {
  onBack: () => void;
}

export const StartupListingForm = ({ onBack }: StartupListingFormProps) => {
  const { isConnected, fetchUserRepos, githubUser } = useGitHubAuth();
  const { submitStartupListing } = useStartupListings();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [formData, setFormData] = useState({
    startupName: '',
    description: '',
    fundingGoal: '',
    fundingType: '',
    projectStage: '',
    teamSize: '',
    timeline: '',
    useOfFunds: '',
    contactEmail: '',
    websiteUrl: '',
    tags: ''
  });

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

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    setFormData(prev => ({
      ...prev,
      startupName: repo.name,
      description: repo.description || ''
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedRepo) {
      return;
    }

    if (!formData.startupName || !formData.description || !formData.fundingGoal || !formData.contactEmail) {
      return;
    }

    setSubmitting(true);
    const success = await submitStartupListing(formData, selectedRepo, githubUser);
    setSubmitting(false);
    
    if (success) {
      onBack();
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>GitHub Connection Required</CardTitle>
          <CardDescription>
            Please connect your GitHub account first to list your startup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">List Your Startup</h2>
      </div>

      {!selectedRepo ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Github className="w-5 h-5" />
              <span>Select Repository</span>
            </CardTitle>
            <CardDescription>
              Choose the GitHub repository that represents your startup project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading repositories...</div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No repositories found</div>
            ) : (
              <div className="grid gap-4">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRepoSelect(repo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{repo.name}</h3>
                        <p className="text-sm text-gray-600">{repo.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {repo.language && (
                          <Badge variant="secondary">{repo.language}</Badge>
                        )}
                        {repo.private && (
                          <Badge variant="outline">Private</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🍴 {repo.forks_count}</span>
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Repository Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Selected Repository</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold">{selectedRepo.name}</h3>
                <p className="text-sm text-gray-600">{selectedRepo.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {selectedRepo.language && (
                  <Badge variant="secondary">{selectedRepo.language}</Badge>
                )}
                {selectedRepo.private && (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <div>⭐ {selectedRepo.stargazers_count} stars</div>
                <div>🍴 {selectedRepo.forks_count} forks</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRepo(null)}
                className="w-full"
              >
                Change Repository
              </Button>
            </CardContent>
          </Card>

          {/* Startup Details Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Startup Details</CardTitle>
              <CardDescription>
                Provide information about your startup and funding requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Startup Name *</label>
                  <Input
                    value={formData.startupName}
                    onChange={(e) => handleInputChange('startupName', e.target.value)}
                    placeholder="Enter your startup name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Email *</label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your startup, what problem it solves, and your vision..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Funding Goal (USD) *</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.fundingGoal}
                      onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                      placeholder="50000"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Funding Type</label>
                  <Select value={formData.fundingType} onValueChange={(value) => handleInputChange('fundingType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grant">Grant</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue-share">Revenue Share</SelectItem>
                      <SelectItem value="milestone-based">Milestone Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Stage</label>
                  <Select value={formData.projectStage} onValueChange={(value) => handleInputChange('projectStage', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="prototype">Prototype</SelectItem>
                      <SelectItem value="mvp">MVP</SelectItem>
                      <SelectItem value="beta">Beta</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Size</label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      placeholder="3"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeline (months)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      placeholder="12"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website URL</label>
                  <Input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://yourstartup.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Use of Funds</label>
                <Textarea
                  value={formData.useOfFunds}
                  onChange={(e) => handleInputChange('useOfFunds', e.target.value)}
                  placeholder="Describe how you plan to use the funding (development, marketing, team expansion, etc.)"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., DeFi, AI, Web3, SaaS (comma separated)"
                />
              </div>

              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Your startup listing will be reviewed before going live. Make sure all information is accurate and complete.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={submitting || !formData.startupName || !formData.description || !formData.fundingGoal || !formData.contactEmail}
                >
                  {submitting ? 'Submitting...' : 'Submit Startup Listing'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedRepo(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
