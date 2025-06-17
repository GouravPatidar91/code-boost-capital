import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Github, Shield, Star, DollarSign, Wallet } from 'lucide-react';
import { useStartupListings } from '@/hooks/useStartupListings';
import { useCDPWallet } from '@/hooks/useCDPWallet';
import { useFundingData } from '@/hooks/useFundingData';
import { useToast } from '@/hooks/use-toast';

const Fund = () => {
  const { id } = useParams();
  const { startups, loading } = useStartupListings();
  const { isConnected, account, balance, connectWallet, sendTransaction } = useCDPWallet();
  const { fundingData, loading: fundingLoading, recordFundingTransaction } = useFundingData(id);
  const { toast } = useToast();
  const [fundingAmount, setFundingAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const startup = startups?.find(s => s.id === id);

  const handleFunding = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to fund this startup.",
        variant: "destructive"
      });
      return;
    }

    if (!fundingAmount || parseFloat(fundingAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid funding amount.",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(fundingAmount) > parseFloat(balance) * 3000) { // Convert ETH to USD
      toast({
        title: "Insufficient balance",
        description: "You don't have enough ETH to complete this transaction.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert USD to ETH (simplified conversion - in real app you'd use current exchange rate)
      const ethAmount = (parseFloat(fundingAmount) / 3000).toFixed(6); // Assuming 1 ETH = $3000

      // For demo purposes, we'll use a placeholder recipient address
      // In a real app, this would be the startup's wallet address from the developers table
      const recipientAddress = '0x742d35Cc6634C0532925a3b8D4e7C02FFDF5fBE';

      const transactionHash = await sendTransaction(recipientAddress, ethAmount);

      if (transactionHash && startup && account) {
        // Record the funding transaction in the database
        await recordFundingTransaction(
          startup.id,
          account,
          parseFloat(fundingAmount),
          parseFloat(ethAmount),
          'ETH',
          transactionHash
        );

        toast({
          title: "Funding Successful!",
          description: `Successfully sent $${fundingAmount} to ${startup?.startup_name}`,
        });

        // Reset form
        setFundingAmount('');
        setMessage('');
      }
    } catch (error) {
      console.error('Funding error:', error);
      toast({
        title: "Funding Failed",
        description: "There was an error processing your funding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || fundingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading startup details...</div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Startup not found</div>
          <Button asChild>
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Use real funding data or fallback to default values
  const totalRaised = fundingData?.total_raised || 0;
  const fundingGoal = fundingData?.funding_goal || startup.funding_goal || 250000;
  const fundingPercentage = fundingData?.funding_percentage || 0;
  const totalFunders = fundingData?.total_funders || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link to="/explore">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Explore
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Fund Startup</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Startup Details */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://github.com/${startup.developers?.github_username}.png`} />
                    <AvatarFallback>{startup.developers?.github_username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{startup.startup_name}</CardTitle>
                    <p className="text-sm text-gray-500">by {startup.developers?.github_username}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <CardDescription className="text-base leading-relaxed">
                {startup.description}
              </CardDescription>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Github className="w-4 h-4" />
                  <span>{startup.github_repositories?.full_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{startup.github_repositories?.stars_count}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Funding Goal</span>
                  <span className="font-semibold text-lg">
                    ${fundingGoal?.toLocaleString()}
                  </span>
                </div>
                <Progress value={fundingPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>${totalRaised?.toLocaleString()} raised</span>
                  <span>{fundingPercentage.toFixed(1)}% of goal</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{totalFunders}</span> {totalFunders === 1 ? 'funder' : 'funders'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Project Stage</span>
                  <p className="font-medium">{startup.project_stage || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Team Size</span>
                  <p className="font-medium">{startup.team_size || 'Not specified'}</p>
                </div>
              </div>

              {startup.tags && startup.tags.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Tags</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {startup.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funding Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Fund This Startup</span>
              </CardTitle>
              <CardDescription>
                Support this startup by providing funding. Connect your wallet to proceed.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Wallet Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Wallet Status</h4>
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Connected Address</span>
                      <span className="font-mono text-xs">
                        {account?.substring(0, 6)}...{account?.substring(38)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Balance</span>
                      <span className="font-semibold">{balance} ETH</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Wallet className="w-3 h-3 mr-1" />
                      Wallet Connected
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">No wallet connected</p>
                    <Button onClick={connectWallet} className="w-full">
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect CDP Wallet
                    </Button>
                  </div>
                )}
              </div>

              {isConnected && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Funding Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      min="100"
                      step="100"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                    />
                    {fundingAmount && (
                      <p className="text-xs text-gray-500">
                        ≈ {(parseFloat(fundingAmount) / 3000).toFixed(6)} ETH
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a message to the founder..."
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Funding Terms</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Milestone-based payment release</li>
                      <li>• Smart contract secured transactions</li>
                      <li>• Full transparency on fund usage</li>
                      <li>• Regular progress updates</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600" 
                      size="lg"
                      onClick={handleFunding}
                      disabled={isProcessing || !fundingAmount}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : `Fund $${fundingAmount || '0'}`}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By funding this startup, you agree to our terms and conditions. 
                      Funds will be held in escrow until milestones are met.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Fund;
