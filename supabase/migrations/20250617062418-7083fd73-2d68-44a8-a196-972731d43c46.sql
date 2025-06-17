
-- First, let's check what columns exist in funding_transactions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'funding_transactions' 
AND table_schema = 'public';

-- Create table for real-time chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_listing_id UUID REFERENCES public.startup_listings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('funder', 'founder')),
  sender_wallet_address TEXT,
  message_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_startup_id ON public.chat_messages(startup_listing_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
DROP POLICY IF EXISTS "Anyone can view chat messages for verified startups" ON public.chat_messages;
CREATE POLICY "Anyone can view chat messages for verified startups" 
  ON public.chat_messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.startup_listings 
    WHERE id = startup_listing_id AND verified = true
  ));

DROP POLICY IF EXISTS "Authenticated users can send chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can send chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for chat messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.chat_messages;

-- Add startup_listing_id to funding_transactions if it doesn't exist
ALTER TABLE public.funding_transactions 
ADD COLUMN IF NOT EXISTS startup_listing_id UUID REFERENCES public.startup_listings(id) ON DELETE CASCADE;

-- Create view for startup funding summary
CREATE OR REPLACE VIEW public.startup_funding_summary AS
SELECT 
  sl.id as startup_id,
  sl.startup_name,
  sl.funding_goal,
  COALESCE(SUM(ft.amount_usd), 0) as total_raised,
  CASE 
    WHEN sl.funding_goal > 0 THEN 
      LEAST(100, (COALESCE(SUM(ft.amount_usd), 0) / sl.funding_goal * 100))
    ELSE 0 
  END as funding_percentage,
  COUNT(DISTINCT ft.id) as total_funders
FROM public.startup_listings sl
LEFT JOIN public.funding_transactions ft ON sl.id = ft.startup_listing_id 
  AND ft.status = 'completed'
WHERE sl.verified = true
GROUP BY sl.id, sl.startup_name, sl.funding_goal;
