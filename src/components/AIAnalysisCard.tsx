
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { 
  Brain, 
  Shield, 
  TrendingUp, 
  Code, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AIAnalysisCardProps {
  startupId: string;
  githubRepoUrl: string;
  startupName: string;
}

export const AIAnalysisCard = ({ startupId, githubRepoUrl, startupName }: AIAnalysisCardProps) => {
  const { analyzeStartup, analysis, loading } = useAIAnalysis();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnalyze = async () => {
    await analyzeStartup(startupId, githubRepoUrl);
  };

  const getRiskBadgeColor = (score: number) => {
    if (score < 30) return "bg-green-100 text-green-800";
    if (score < 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getGrowthBadgeColor = (score: number) => {
    if (score > 70) return "bg-green-100 text-green-800";
    if (score > 40) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Analysis</CardTitle>
          </div>
          {!analysis && (
            <Button 
              onClick={handleAnalyze}
              disabled={loading}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Analyzing...' : 'Analyze Project'}
            </Button>
          )}
        </div>
        <CardDescription>
          AI-powered fraud detection and growth assessment
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Analyzing repository code...</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Scores Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-xs font-medium">Fraud Risk</span>
                </div>
                <Badge className={getRiskBadgeColor(analysis.fraud_risk_score)}>
                  {analysis.fraud_risk_score}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-xs font-medium">Growth</span>
                </div>
                <Badge className={getGrowthBadgeColor(analysis.growth_potential_score)}>
                  {analysis.growth_potential_score}%
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Code className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-xs font-medium">Code Quality</span>
                </div>
                <Badge variant="outline">
                  {analysis.code_quality_score}%
                </Badge>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg p-3 border">
              <h4 className="text-sm font-medium mb-2">Analysis Summary</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {analysis.analysis_summary}
              </p>
            </div>

            {/* Expandable Details */}
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="space-y-3 border-t pt-3">
                {/* Risk Factors */}
                {analysis.risk_factors && analysis.risk_factors.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium">Risk Factors</span>
                    </div>
                    <div className="space-y-1">
                      {analysis.risk_factors.map((risk, index) => (
                        <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {risk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Growth Indicators */}
                {analysis.growth_indicators && analysis.growth_indicators.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Growth Indicators</span>
                    </div>
                    <div className="space-y-1">
                      {analysis.growth_indicators.map((indicator, index) => (
                        <div key={index} className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          {indicator}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <Brain className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">Recommendations</span>
                    </div>
                    <div className="space-y-1">
                      {analysis.recommendations.map((rec, index) => (
                        <div key={index} className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Analyzed on {new Date(analysis.analyzed_at).toLocaleDateString()}
            </div>
          </>
        )}

        {!analysis && !loading && (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">
              Click "Analyze Project" to get AI insights about this startup
            </p>
            <div className="text-xs text-gray-400">
              • Fraud risk assessment<br/>
              • Growth potential analysis<br/>
              • Code quality evaluation
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
