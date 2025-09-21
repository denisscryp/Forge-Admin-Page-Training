import api, {storage} from "@forge/api";

const GITHUB_API_BASE_URL = 'https://api.github.com';

interface Repository {
  name: string;
  owner: { login: string };
  html_url: string;
  language: string;
}

interface PullRequest {
  id: number;
  title: string;
  html_url: string;
  number: number;
  head: { ref: string };
}

export default class GitHubService {

  async getRepositories() {
    return this.callGithubApi<Repository[]>('/user/repos');
  }

  async getPullRequests(owner: string, repo: string) {
    return this.callGithubApi<PullRequest[]>(`/repos/${owner}/${repo}/pulls?state=open`);
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number): Promise<{ success: boolean }> {
    return this.callGithubApi<{ success: boolean }>(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, 'PUT');
  }

  private async callGithubApi<T>(url: string, method: string = 'GET', body: object | null = null): Promise<T> {
    const token = await storage.get('github-token');

    if (!token) {
      throw new Error('GitHub token not found in storage.');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const options = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    };

    const response = await api.fetch(`${GITHUB_API_BASE_URL}${url}`, options);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
    }


    if (response.status === 204) {
      return { success: true } as T;
    }

    return response.json();
  }
}
