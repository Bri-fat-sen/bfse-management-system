import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const { action, owner, repo, issueData, projectId, itemId, fieldId, optionId, skipCache } = await req.json();

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Base44-App'
    };

    const graphqlHeaders = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'getUser': {
        const cacheKey = 'user';
        if (!skipCache) {
          const cached = getCached(cacheKey);
          if (cached) return Response.json(cached);
        }
        const response = await fetch('https://api.github.com/user', { headers });
        const data = await response.json();
        setCache(cacheKey, data);
        return Response.json(data);
      }

      case 'getRepos': {
        const cacheKey = 'repos';
        if (!skipCache) {
          const cached = getCached(cacheKey);
          if (cached) return Response.json(cached);
        }
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', { headers });
        const data = await response.json();
        setCache(cacheKey, data);
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

      case 'getProjects': {
        const cacheKey = 'projects';
        if (!skipCache) {
          const cached = getCached(cacheKey);
          if (cached) return Response.json(cached);
        }
        const query = `
          query {
            viewer {
              projectsV2(first: 20) {
                nodes {
                  id
                  title
                  shortDescription
                  url
                  closed
                  fields(first: 20) {
                    nodes {
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                        options {
                          id
                          name
                          color
                        }
                      }
                      ... on ProjectV2Field {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: graphqlHeaders,
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        const projects = data?.data?.viewer?.projectsV2?.nodes || [];
        setCache(cacheKey, projects);
        return Response.json(projects);
      }

      case 'getDashboard': {
        // Batch fetch: user, repos, and projects in parallel
        const cacheKey = 'dashboard';
        if (!skipCache) {
          const cached = getCached(cacheKey);
          if (cached) return Response.json(cached);
        }

        const [userRes, reposRes, projectsRes] = await Promise.all([
          fetch('https://api.github.com/user', { headers }),
          fetch('https://api.github.com/user/repos?sort=updated&per_page=10', { headers }),
          fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: graphqlHeaders,
            body: JSON.stringify({
              query: `query {
                viewer {
                  projectsV2(first: 10) {
                    nodes { id title url closed }
                  }
                }
              }`
            })
          })
        ]);

        const [userData, reposData, projectsData] = await Promise.all([
          userRes.json(),
          reposRes.json(),
          projectsRes.json()
        ]);

        const result = {
          user: userData,
          repos: Array.isArray(reposData) ? reposData : [],
          projects: projectsData?.data?.viewer?.projectsV2?.nodes || []
        };
        setCache(cacheKey, result);
        return Response.json(result);
      }

      case 'getProjectItems': {
        // Get items from a specific project
        const query = `
          query($projectId: ID!) {
            node(id: $projectId) {
              ... on ProjectV2 {
                items(first: 50) {
                  nodes {
                    id
                    fieldValues(first: 10) {
                      nodes {
                        ... on ProjectV2ItemFieldTextValue {
                          text
                          field { ... on ProjectV2Field { name } }
                        }
                        ... on ProjectV2ItemFieldSingleSelectValue {
                          name
                          color
                          field { ... on ProjectV2SingleSelectField { name } }
                        }
                        ... on ProjectV2ItemFieldDateValue {
                          date
                          field { ... on ProjectV2Field { name } }
                        }
                      }
                    }
                    content {
                      ... on Issue {
                        id
                        title
                        number
                        state
                        url
                        labels(first: 5) {
                          nodes {
                            name
                            color
                          }
                        }
                      }
                      ... on DraftIssue {
                        title
                        body
                      }
                    }
                  }
                }
              }
            }
          }
        `;
        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: graphqlHeaders,
          body: JSON.stringify({ query, variables: { projectId } })
        });
        const data = await response.json();
        return Response.json(data?.data?.node?.items?.nodes || []);
      }

      case 'addItemToProject': {
        // Add an issue to a project
        const query = `
          mutation($projectId: ID!, $contentId: ID!) {
            addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
              item {
                id
              }
            }
          }
        `;
        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: graphqlHeaders,
          body: JSON.stringify({ query, variables: { projectId, contentId: itemId } })
        });
        const data = await response.json();
        return Response.json(data);
      }

      case 'updateProjectItemStatus': {
        // Update the status field of a project item
        const query = `
          mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
            updateProjectV2ItemFieldValue(input: {
              projectId: $projectId
              itemId: $itemId
              fieldId: $fieldId
              value: { singleSelectOptionId: $optionId }
            }) {
              projectV2Item {
                id
              }
            }
          }
        `;
        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: graphqlHeaders,
          body: JSON.stringify({ query, variables: { projectId, itemId, fieldId, optionId } })
        });
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