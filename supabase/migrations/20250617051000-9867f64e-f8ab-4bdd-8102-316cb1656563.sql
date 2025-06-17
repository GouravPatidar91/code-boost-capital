
-- Add missing RLS policies for github_repositories table
CREATE POLICY "Authenticated users can view github repositories" 
  ON public.github_repositories 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create github repositories" 
  ON public.github_repositories 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their github repositories" 
  ON public.github_repositories 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Add missing RLS policies for developers table
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view developers" 
  ON public.developers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create developer profiles" 
  ON public.developers 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their developer profiles" 
  ON public.developers 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
