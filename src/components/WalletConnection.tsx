
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCDPWallet } from '@/hooks/useCDPWallet';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, ExternalLink, Copy, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WalletConnection = () => {
  const { isConnected, account, balance, connectWallet, disconnectWallet, fetchBalance } = useCDPWallet();
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthenticatedUser(user);
    };
    checkAuth();
  }, []);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard.",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const handleConnectWallet = async () => {
    if (!authenticatedUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in before connecting your wallet.",
        variant: "destructive"
      });
      return;
    }
    
    await connectWallet();
  };

  // Show authentication required message if user is not logged in
  if (!authenticatedUser) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Shield className="w-6 h-6 text-red-500" />
            <span>Authentication Required</span>
          </CardTitle>
          <CardDescription>
            Please log in to your account to connect your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            You need to be authenticated to connect and manage your wallet.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>Connect CDP Wallet</span>
          </CardTitle>
          <CardDescription>
            Connect your Coinbase wallet to fund startups and receive payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnectWallet} className="w-full">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>CDP Wallet</span>
          </div>
          <Badge variant="secondary">Connected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-mono">{formatAddress(account!)}</span>
              <Button size="sm" variant="ghost" onClick={copyAddress}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold">{balance} ETH</span>
              <Button size="sm" variant="ghost" onClick={fetchBalance}>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on Etherscan
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
