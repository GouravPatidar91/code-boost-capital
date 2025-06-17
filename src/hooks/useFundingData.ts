
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
      let query = supabase
        .from('startup_funding_summary')
        .select('*');

      if (id) {
        query = query.eq('startup_id', id).single();
        const { data, error } = await query;
        if (error && error.code !== 'PGRST116') throw error;
        setFundingData(data);
      } else {
        const { data, error } = await query;
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
      const { error } = await supabase
        .from('funding_transactions')
        .insert({
          startup_listing_id: startupListingId,
          funder_wallet_address: funderWalletAddress,
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
