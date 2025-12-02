import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, owner, repo, issueData } = await req.json();

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Base44-App'
    };

    switch (action) {
      case 'getUser': {
        const response = await fetch('https://api.github.com/user', { headers });
        const data = await response.json();
        return Response.json(data);
      }

      case 'getRepos': {
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', { headers });
        const data = await response.json();
        return Response.json(data);
      }

      case 'getRepoDetails': {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        const data = await response.json();
        return Response.json(data);
      }

      case 'getIssues': {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=30`, { headers });
        const data = await response.json();
        return Response.json(data);
      }

      case 'createIssue': {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers,
          body: JSON.stringify(issueData)
        });
        const data = await response.json();
        return Response.json(data);
      }

      case 'getCommits': {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`, { headers });
        const data = await response.json();
        return Response.json(data);
      }

      case 'getPullRequests': {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=20`, { headers });
        const data = await response.json();
        return Response.json(data);
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});