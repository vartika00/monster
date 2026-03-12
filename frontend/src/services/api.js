const API_URL = 'http://localhost:8001';

const api = {
  async getGitHubAuthUrl() {
    const response = await fetch(`${API_URL}/auth/github`);
    if (!response.ok) throw new Error('Failed to get auth URL');
    return response.json();
  },

  async getUserProfile() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get profile');
    return response.json();
  },

  async getUserRepos() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile/repos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get repos');
    return response.json();
  },

  async cloneRepository(data) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to clone repo');
    return response.json();
  },

  async getClonedRepos() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile/cloned`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get cloned repos');
    return response.json();
  },

  async removeClonedRepo(repoName) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile/cloned/${repoName}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to remove repo');
    return response.json();
  },

  async getFixedBranches() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile/fixed-branches`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get fixed branches');
    return response.json();
  },

  async removeFixedBranch(branchName) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/profile/fixed-branch/${branchName}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to remove branch');
    return response.json();
  },

  async runPipeline(repoUrl, teamName, leaderName) {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth header only if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/pipeline/run`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        repo_url: repoUrl,
        team_name: teamName,
        leader_name: leaderName,
        retry_limit: 5
      })
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Pipeline run failed');
    }
    return response.json();
  },

  async getResults(runId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/pipeline/results/${runId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to get results');
    return response.json();
  }
};

export default api;
