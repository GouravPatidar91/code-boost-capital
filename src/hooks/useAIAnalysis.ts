
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysis {
  fraud_risk_score: number;
  growth_potential_score: number;
  code_quality_score: number;
  analysis_summary: string;
  risk_factors: string[];
  growth_indicators: string[];
  recommendations: string[];
  analyzed_at: string;
}

export const useAIAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeStartup = async (startupId: string, githubRepoUrl: string) => {
    setLoading(true);
    try {
      console.log('Starting AI analysis for startup:', startupId);
      
      const { data, error } = await supabase.functions.invoke('ai-startup-analysis', {
        body: {
          startup_id: startupId,
          github_repo_url: githubRepoUrl
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been completed successfully.",
      });

      return data.analysis;
    } catch (error) {
      console.error('Error analyzing startup:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the startup. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeStartup,
    analysis,
    loading
  };
};
