
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StartupListing {
  id: string;
  startup_name: string;
  description: string;
  funding_goal: number;
  funding_type: string | null;
  project_stage: string | null;
  team_size: number | null;
  timeline_months: number | null;
  use_of_funds: string | null;
  contact_email: string;
  website_url: string | null;
  tags: string[] | null;
  status: string;
  verified: boolean;
  created_at: string;
  github_repositories: {
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stars_count: number;
    forks_count: number;
  } | null;
  developers: {
    github_username: string;
  } | null;
}

export const useStartupListings = () => {
  const [startups, setStartups] = useState<StartupListing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchVerifiedStartups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('startup_listings')
        .select(`
          *,
          github_repositories (
            name,
            full_name,
            description,
            language,
            stars_count,
            forks_count
          ),
          developers (
            github_username
          )
        `)
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStartups(data || []);
    } catch (error) {
      console.error('Error fetching startups:', error);
      toast({
        title: "Error",
        description: "Failed to fetch startup listings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitStartupListing = async (
    startupData: any,
    selectedRepo: any,
    githubUser: any
  ) => {
    try {
      // First, create or get developer record
      const { data: developer, error: developerError } = await supabase
        .from('developers')
        .upsert({
          github_username: githubUser.login,
          wallet_address: null // Will be set when wallet is connected
        })
        .select()
        .single();

      if (developerError) throw developerError;

      // Create or get GitHub repository record
      const { data: repository, error: repoError } = await supabase
        .from('github_repositories')
        .upsert({
          github_repo_id: selectedRepo.id,
          developer_id: developer.id,
          name: selectedRepo.name,
          full_name: selectedRepo.full_name,
          description: selectedRepo.description,
          html_url: selectedRepo.html_url,
          clone_url: selectedRepo.clone_url,
          language: selectedRepo.language,
          stars_count: selectedRepo.stargazers_count,
          forks_count: selectedRepo.forks_count,
          open_issues_count: selectedRepo.open_issues_count,
          size: selectedRepo.size,
          is_private: selectedRepo.private,
          is_fork: selectedRepo.fork,
          pushed_at: selectedRepo.pushed_at
        })
        .select()
        .single();

      if (repoError) throw repoError;

      // Create startup listing
      const { data: listing, error: listingError } = await supabase
        .from('startup_listings')
        .insert({
          developer_id: developer.id,
          github_repo_id: repository.id,
          startup_name: startupData.startupName,
          description: startupData.description,
          funding_goal: parseFloat(startupData.fundingGoal),
          funding_type: startupData.fundingType || null,
          project_stage: startupData.projectStage || null,
          team_size: startupData.teamSize ? parseInt(startupData.teamSize) : null,
          timeline_months: startupData.timeline ? parseInt(startupData.timeline) : null,
          use_of_funds: startupData.useOfFunds || null,
          contact_email: startupData.contactEmail,
          website_url: startupData.websiteUrl || null,
          tags: startupData.tags ? startupData.tags.split(',').map((tag: string) => tag.trim()) : null
        });

      if (listingError) throw listingError;

      toast({
        title: "Startup Listed Successfully!",
        description: "Your startup has been submitted for review and will be visible to funders once verified.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting startup:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your startup listing. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVerifiedStartups();
  }, []);

  return {
    startups,
    loading,
    fetchVerifiedStartups,
    submitStartupListing
  };
};
