
-- Create table for startup listings
CREATE TABLE public.startup_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID REFERENCES public.developers(id) ON DELETE CASCADE,
  github_repo_id UUID REFERENCES public.github_repositories(id) ON DELETE CASCADE,
  startup_name TEXT NOT NULL,
  description TEXT NOT NULL,
  funding_goal NUMERIC NOT NULL,
  funding_type TEXT,
  project_stage TEXT,
  team_size INTEGER,
  timeline_months INTEGER,
  use_of_funds TEXT,
  contact_email TEXT NOT NULL,
  website_url TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'pending',
  verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX idx_startup_listings_developer_id ON public.startup_listings(developer_id);
CREATE INDEX idx_startup_listings_github_repo_id ON public.startup_listings(github_repo_id);
CREATE INDEX idx_startup_listings_status ON public.startup_listings(status);
CREATE INDEX idx_startup_listings_verified ON public.startup_listings(verified);

-- Enable Row Level Security
ALTER TABLE public.startup_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for startup listings
CREATE POLICY "Anyone can view verified startup listings" 
  ON public.startup_listings 
  FOR SELECT 
  USING (verified = true);

CREATE POLICY "Developers can view their own startup listings" 
  ON public.startup_listings 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Developers can create startup listings" 
  ON public.startup_listings 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Developers can update their own startup listings" 
  ON public.startup_listings 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create table to track funding interest
CREATE TABLE public.funding_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_listing_id UUID REFERENCES public.startup_listings(id) ON DELETE CASCADE,
  funder_wallet_address TEXT NOT NULL,
  interest_amount NUMERIC NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for funding interests
ALTER TABLE public.funding_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view funding interests for verified startups" 
  ON public.funding_interests 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.startup_listings 
    WHERE id = startup_listing_id AND verified = true
  ));

CREATE POLICY "Authenticated users can create funding interests" 
  ON public.funding_interests 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
