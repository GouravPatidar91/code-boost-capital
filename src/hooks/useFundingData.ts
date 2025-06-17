
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FundingData {
  startup_id: string;
  startup_name: string;
  funding_goal: number;
  total_raised: number;
  funding_percentage: number;
  total_funders: number;
}

export const useFundingData = (startupId?: string) => {
  const [fundingData, setFundingData] = useState<FundingData | null>(null);
  const [allFundingData, setAllFundingData] = useState<FundingData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFundingData = async (id?: string) => {
    setLoading(true);
    try {
      if (id) {
        const { data, error } = await supabase
          .from('startup_funding_summary')
          .select('*')
          .eq('startup_id', id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        setFundingData(data);
      } else {
        const { data, error } = await supabase
          .from('startup_funding_summary')
          .select('*');
        
        if (error) throw error;
        setAllFundingData(data || []);
      }
    } catch (error) {
      console.error('Error fetching funding data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch funding data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const recordFundingTransaction = async (
    startupListingId: string,
    funderWalletAddress: string,
    amountUsd: number,
    amountCrypto: number,
    currency: string,
    transactionHash?: string
  ) => {
    try {
      // For demo purposes, we'll use a placeholder recipient address
      // In a real app, this would be the startup's wallet address from the developers table
      const recipientAddress = '0x742d35Cc6634C0532925a3b8D4e7C02FFDF5fBE';

      const { error } = await supabase
        .from('funding_transactions')
        .insert({
          startup_listing_id: startupListingId,
          funder_wallet_address: funderWalletAddress,
          recipient_wallet_address: recipientAddress,
          amount_usd: amountUsd,
          amount_crypto: amountCrypto,
          currency: currency,
          transaction_hash: transactionHash,
          status: 'completed'
        });

      if (error) throw error;

      // Refresh funding data after recording transaction
      await fetchFundingData(startupListingId);

      toast({
        title: "Transaction Recorded!",
        description: "Funding transaction has been recorded successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error recording funding transaction:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to record funding transaction.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchFundingData(startupId);
  }, [startupId]);

  return {
    fundingData,
    allFundingData,
    loading,
    fetchFundingData,
    recordFundingTransaction
  };
};
