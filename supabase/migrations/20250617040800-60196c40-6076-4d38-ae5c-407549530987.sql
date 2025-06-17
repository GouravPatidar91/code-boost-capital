
-- Create table for GitHub repositories
CREATE TABLE public.github_repositories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES public.developers(id) ON DELETE CASCADE,
  github_repo_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  html_url TEXT NOT NULL,
  clone_url TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  language TEXT,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  open_issues_count INTEGER DEFAULT 0,
  size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pushed_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN DEFAULT false,
  is_fork BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  disabled BOOLEAN DEFAULT false
);

-- Create table for GitHub commits tracking
CREATE TABLE public.github_commits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID REFERENCES public.github_repositories(id) ON DELETE CASCADE,
  sha TEXT NOT NULL,
  author_name TEXT,
  author_email TEXT,
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for wallet connections
CREATE TABLE public.wallet_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES public.developers(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL DEFAULT 'cdp',
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Create table for funding transactions
CREATE TABLE public.funding_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE,
  funder_wallet_address TEXT NOT NULL,
  recipient_wallet_address TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  amount_crypto NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  transaction_hash TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  milestone_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for github_repositories
CREATE POLICY "Anyone can view public repositories" 
  ON public.github_repositories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Developers can manage their own repositories" 
  ON public.github_repositories 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Policies for github_commits
CREATE POLICY "Anyone can view commits" 
  ON public.github_commits 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert commits" 
  ON public.github_commits 
  FOR INSERT 
  WITH CHECK (true);

-- Policies for wallet_connections
CREATE POLICY "Users can view their own wallet connections" 
  ON public.wallet_connections 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own wallet connections" 
  ON public.wallet_connections 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Policies for funding_transactions
CREATE POLICY "Anyone can view funding transactions" 
  ON public.funding_transactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create transactions" 
  ON public.funding_transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_github_repositories_developer_id ON public.github_repositories(developer_id);
CREATE INDEX idx_github_commits_repository_id ON public.github_commits(repository_id);
CREATE INDEX idx_wallet_connections_developer_id ON public.wallet_connections(developer_id);
CREATE INDEX idx_funding_transactions_grant_id ON public.funding_transactions(grant_id);
CREATE INDEX idx_funding_transactions_hash ON public.funding_transactions(transaction_hash);
