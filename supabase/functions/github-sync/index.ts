
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, repoData, developerId, githubToken } = await req.json()

    if (action === 'sync-repository') {
      // Fetch repository details from GitHub
      const repoResponse = await fetch(`https://api.github.com/repos/${repoData.full_name}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!repoResponse.ok) {
        throw new Error('Failed to fetch repository from GitHub')
      }

      const repo = await repoResponse.json()

      // Insert or update repository in database
      const { data: repoRecord, error: repoError } = await supabaseClient
        .from('github_repositories')
        .upsert({
          developer_id: developerId,
          github_repo_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          default_branch: repo.default_branch,
          language: repo.language,
          stars_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          open_issues_count: repo.open_issues_count,
          size: repo.size,
          pushed_at: repo.pushed_at,
          is_private: repo.private,
          is_fork: repo.fork,
          archived: repo.archived,
          disabled: repo.disabled,
        })
        .select()
        .single()

      if (repoError) throw repoError

      // Fetch recent commits
      const commitsResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=50`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (commitsResponse.ok) {
        const commits = await commitsResponse.json()
        
        for (const commit of commits) {
          await supabaseClient
            .from('github_commits')
            .upsert({
              repository_id: repoRecord.id,
              sha: commit.sha,
              author_name: commit.commit.author.name,
              author_email: commit.commit.author.email,
              message: commit.commit.message,
              timestamp: commit.commit.author.date,
            })
        }
      }

      return new Response(JSON.stringify({ success: true, repository: repoRecord }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'fetch-user-repos') {
      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch user repositories')
      }

      const repos = await reposResponse.json()
      
      return new Response(JSON.stringify({ success: true, repositories: repos }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in github-sync function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
