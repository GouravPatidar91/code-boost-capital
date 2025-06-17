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
    html_url: string;
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
            forks_count,
            html_url
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
      console.log('Starting startup submission process...');
      
      // First, try to get existing developer or create new one
      let developer;
      const { data: existingDeveloper, error: checkError } = await supabase
        .from('developers')
        .select('*')
        .eq('github_username', githubUser.login)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing developer:', checkError);
        throw checkError;
      }

      if (existingDeveloper) {
        console.log('Found existing developer:', existingDeveloper);
        developer = existingDeveloper;
      } else {
        console.log('Creating new developer for:', githubUser.login);
        const { data: newDeveloper, error: developerError } = await supabase
          .from('developers')
          .insert({
            github_username: githubUser.login,
            wallet_address: null // Will be set when wallet is connected
          })
          .select()
          .single();

        if (developerError) {
          console.error('Error creating developer:', developerError);
          throw developerError;
        }
        developer = newDeveloper;
      }

      console.log('Developer ready:', developer);

      // Check for existing repository or create new one
      let repository;
      const { data: existingRepo, error: repoCheckError } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('github_repo_id', selectedRepo.id)
        .maybeSingle();

      if (repoCheckError) {
        console.error('Error checking for existing repository:', repoCheckError);
        throw repoCheckError;
      }

      if (existingRepo) {
        console.log('Found existing repository:', existingRepo);
        repository = existingRepo;
        
        // Update repository data in case it changed
        const { data: updatedRepo, error: updateError } = await supabase
          .from('github_repositories')
          .update({
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
          .eq('id', existingRepo.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating repository:', updateError);
          // Continue with existing repo if update fails
        } else {
          repository = updatedRepo;
        }
      } else {
        console.log('Creating new repository for:', selectedRepo.full_name);
        const { data: newRepository, error: repoError } = await supabase
          .from('github_repositories')
          .insert({
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

        if (repoError) {
          console.error('Error creating repository:', repoError);
          throw repoError;
        }
        repository = newRepository;
      }

      console.log('Repository ready:', repository);

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

      if (listingError) {
        console.error('Error creating startup listing:', listingError);
        throw listingError;
      }

      console.log('Startup listing created successfully:', listing);

      toast({
        title: "Startup Listed Successfully!",
        description: "Your startup has been submitted for review and will be visible to funders once verified.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting startup:', error);
      
      let errorMessage = "Failed to submit your startup listing. Please try again.";
      
      if (error.message?.includes('github_username_key')) {
        errorMessage = "A developer profile with this GitHub username already exists.";
      } else if (error.message?.includes('row-level security')) {
        errorMessage = "Authentication required. Please make sure you're logged in.";
      } else if (error.message?.includes('github_repo_id')) {
        errorMessage = "This repository has already been used for a startup listing.";
      }

      toast({
        title: "Submission Failed",
        description: errorMessage,
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
