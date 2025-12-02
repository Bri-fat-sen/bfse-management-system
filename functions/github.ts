import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

Deno.serve(async (req) => {
  try {
    // Check token first
    if (!GITHUB_TOKEN) {
      return Response.json({ error: 'GitHub token not configured', message: 'Please set GITHUB_TOKEN secret' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, owner, repo, issueData, projectId, itemId, fieldId, optionId } = await req.json();

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Base44-App',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const graphqlHeaders = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // Helper to handle GitHub API responses
    const handleResponse = async (response, fallback = null) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('GitHub API error:', response.status, error);
        if (response.status === 401) {
          return { error: 'Invalid GitHub token', status: 401 };
        }
        if (response.status === 403) {
          return { error: 'Rate limited or insufficient permissions', status: 403 };
        }
        return fallback !== null ? fallback : { error: error.message || 'GitHub API error' };
      }
      return response.json();
    };

    switch (action) {
      case 'getUser': {
        const response = await fetch('https://api.github.com/user', { headers });
        const data = await handleResponse(response, null);
        return Response.json(data);
      }

      case 'getRepos': {
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30&affiliation=owner,collaborator', { headers });
        const data = await handleResponse(response, []);
        return Response.json(data);
      }

      case 'getRepoDetails': {
        if (!owner || !repo) {
          return Response.json({ error: 'Owner and repo required' }, { status: 400 });
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        const data = await handleResponse(response, null);
        return Response.json(data);
      }

      case 'getIssues': {
        if (!owner || !repo) {
          return Response.json({ error: 'Owner and repo required' }, { status: 400 });
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=30&sort=updated`, { headers });
        const data = await handleResponse(response, []);
        return Response.json(data);
      }

      case 'createIssue': {
        if (!owner || !repo || !issueData) {
          return Response.json({ error: 'Owner, repo, and issueData required' }, { status: 400 });
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(issueData)
        });
        const data = await handleResponse(response, null);
        return Response.json(data);
      }

      case 'getCommits': {
        if (!owner || !repo) {
          return Response.json({ error: 'Owner and repo required' }, { status: 400 });
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`, { headers });
        const data = await handleResponse(response, []);
        return Response.json(data);
      }

      case 'getPullRequests': {
        if (!owner || !repo) {
          return Response.json({ error: 'Owner and repo required' }, { status: 400 });
        }
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=20`, { headers });
        const data = await handleResponse(response, []);
        return Response.json(data);
      }

      case 'getProjects': {
        // Get user's projects using GraphQL API
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
        if (data.errors) {
          console.error('GraphQL errors:', data.errors);
          return Response.json([]);
        }
        return Response.json(data?.data?.viewer?.projectsV2?.nodes || []);
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
        if (data.errors) {
          console.error('GraphQL errors:', data.errors);
          return Response.json([]);
        }
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