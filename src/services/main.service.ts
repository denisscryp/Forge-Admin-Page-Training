import {storage} from "@forge/api";
import GitHubService from "./github.service";
import JiraService from "./jira.service";

export default class MainService {
  constructor(
    private githubService: GitHubService,
    private jiraService: JiraService
  ) {}

  async getGitHubAndJiraData() {
    const token = await storage.get('github-token');

    if (!token) {
      return { error: 'GitHub token not set. Please go to the Auth screen.' };
    }

    try {
      const repositories = await this.githubService.getRepositories();
      console.log(repositories.map(({name, owner, language, html_url}) => ({
        name,
        owner,
        language,
        html_url,
      })));

      const repoData = await Promise.all(repositories.map(async (repo) => {
        const pullRequests = await this.githubService.getPullRequests(repo.owner.login, repo.name);
        console.log('pullRequests', pullRequests.map(({title, head}) => ({
          title,
          headr: head?.ref
        })));

        const openPRs = await Promise.all(pullRequests.map(async (pr) => {
          const jiraKeyMatch = pr?.title?.match(/([A-Z]+-\d+)/) || pr?.head?.ref?.match(/([A-Z]+-\d+)/);

          const jiraKey = jiraKeyMatch ? jiraKeyMatch[1] : null;
          console.log('jira', jiraKey);

          let jiraIssue = null;
          if (jiraKey) {
            jiraIssue = await this.jiraService.getIssue(jiraKey);
            console.log(jiraIssue);
          }

          return {
            id: pr.id,
            title: pr.title,
            url: pr.html_url,
            number: pr.number,
            jiraIssue
          };
        }));

        return {
          name: repo.name,
          language: repo.language,
          url: repo.html_url,
          owner: repo.owner.login,
          openPRs: openPRs.filter(pr => pr.jiraIssue)
        };
      }));

      return repoData.filter(repo => repo.openPRs.length > 0);

    } catch (error: unknown) {
      console.error('Error fetching GitHub data:', error);
      return { error: (error as Error).message };
    }
  }
}