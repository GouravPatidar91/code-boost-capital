
import { useState, useEffect } from 'react';
import { CoinbaseWallet } from '@coinbase/wallet-sdk';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCDPWallet = () => {
  const [wallet, setWallet] = useState<CoinbaseWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Coinbase Wallet SDK
    const coinbaseWallet = new CoinbaseWallet({
      appName: 'FundChain',
      appLogoUrl: 'https://your-app-logo.com/logo.png',
      darkMode: false
    });

    setWallet(coinbaseWallet);

    // Check if already connected
    const checkConnection = async () => {
      try {
        const accounts = await coinbaseWallet.getProvider().request({
          method: 'eth_accounts'
        });
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await fetchBalance(accounts[0]);
        }
      } catch (error) {
        console.log('Not connected to wallet');
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (!wallet) {
      toast({
        title: "Wallet Error",
        description: "Wallet SDK not initialized",
        variant: "destructive"
      });
      return;
    }

    try {
      const accounts = await wallet.getProvider().request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0];
        setAccount(walletAddress);
        setIsConnected(true);
        await fetchBalance(walletAddress);

        // Store wallet connection in database
        await storeWalletConnection(walletAddress);

        toast({
          title: "Wallet Connected!",
          description: `Connected to ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setBalance('0');
    
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from wallet.",
    });
  };

  const fetchBalance = async (address: string) => {
    if (!wallet) return;

    try {
      const provider = wallet.getProvider();
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      // Convert from wei to ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const storeWalletConnection = async (address: string) => {
    try {
      const { error } = await supabase
        .from('wallet_connections')
        .upsert({
          wallet_type: 'cdp',
          address: address,
          is_active: true,
          last_used_at: new Date().toISOString(),
          metadata: {
            connected_via: 'web_app',
            chain: 'ethereum'
          }
        });

      if (error) {
        console.error('Error storing wallet connection:', error);
      }
    } catch (error) {
      console.error('Error storing wallet connection:', error);
    }
  };

  const sendTransaction = async (to: string, amount: string) => {
    if (!wallet || !account) {
      toast({
        title: "Wallet Error",
        description: "Wallet not connected",
        variant: "destructive"
      });
      return null;
    }

    try {
      const provider = wallet.getProvider();
      
      // Convert amount to wei
      const amountInWei = '0x' + (parseFloat(amount) * Math.pow(10, 18)).toString(16);
      
      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: to,
          value: amountInWei,
        }]
      });

      toast({
        title: "Transaction Sent!",
        description: `Transaction hash: ${transactionHash}`,
      });

      return transactionHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    wallet,
    isConnected,
    account,
    balance,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    fetchBalance: () => account ? fetchBalance(account) : Promise.resolve()
  };
};
