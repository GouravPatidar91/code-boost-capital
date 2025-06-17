
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startup_id, github_repo_url } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing startup:', startup_id, 'repo:', github_repo_url);

    // Extract repo info from URL
    const repoMatch = github_repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoMatch) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = repoMatch;

    // Fetch repository data from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    const repoData = await repoResponse.json();

    // Fetch repository contents (README, package.json, etc.)
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`);
    const contentsData = await contentsResponse.json();

    // Fetch commit activity
    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`);
    const commitsData = await commitsResponse.json();

    // Prepare analysis data
    const analysisData = {
      repository: {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: repoData.open_issues_count,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        size: repoData.size,
        topics: repoData.topics || []
      },
      files: contentsData.slice(0, 10).map((file: any) => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      commits: commitsData.slice(0, 10).map((commit: any) => ({
        message: commit.commit.message,
        date: commit.commit.author.date,
        author: commit.commit.author.name
      }))
    };

    // Call OpenAI for analysis
    const analysisPrompt = `
    You are an AI expert in startup analysis and fraud detection. Analyze the following GitHub repository data and provide a comprehensive assessment.

    Repository Data:
    ${JSON.stringify(analysisData, null, 2)}

    Please provide a JSON response with the following structure:
    {
      "fraud_risk_score": <number 0-100>,
      "growth_potential_score": <number 0-100>,
      "code_quality_score": <number 0-100>,
      "analysis_summary": "<brief summary>",
      "risk_factors": ["<factor1>", "<factor2>"],
      "growth_indicators": ["<indicator1>", "<indicator2>"],
      "recommendations": ["<rec1>", "<rec2>"]
    }

    Consider factors like:
    - Repository activity and commit patterns
    - Code structure and documentation quality
    - Project maturity and sustainability
    - Community engagement (stars, forks, issues)
    - Technical debt indicators
    - Innovation and market potential
    - Team consistency and development practices
    `;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert startup analyst. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisText = openAIData.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    // Add timestamp
    analysis.analyzed_at = new Date().toISOString();

    // Store analysis in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: dbError } = await supabase
      .from('startup_ai_analysis')
      .upsert({
        startup_id,
        analysis_data: analysis,
        analyzed_at: analysis.analyzed_at
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway, return the analysis
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
