import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import MainService from "../services/main.service";
import JiraService from "../services/jira.service";
import GitHubService from "../services/github.service";

const resolver = new Resolver();
const githubService = new GitHubService();
const jiraService = new JiraService();
const mainService = new MainService(githubService, jiraService);

resolver.define('getGitHubAndJiraData', async () => {
  try {
    return await mainService.getGitHubAndJiraData();
  } catch (error: unknown) {
    console.error('Error fetching GitHub data:', error);
    return { error: (error as Error).message };
  }
});

resolver.define('mergePullRequest', async ({ payload }) => {
  try {
    const { owner, repo, prNumber } = payload;
    await githubService.mergePullRequest(owner, repo, prNumber);
    return { success: true, message: 'Pull request merged successfully!' };
  } catch (error: unknown) {
    console.error('Error merging pull request:', error);
    return { success: false, message: (error as Error).message };
  }
});

resolver.define('saveToken', async ({ payload }) => {
  const { token } = payload;
  if (!token) {
    return { success: false };
  }
  await storage.setSecret('github-token', token);
  return { success: true };
});

resolver.define('hasToken', async () => {
  const token = await storage.getSecret('github-token');
  return { tokenExists: typeof token === 'string' };
});

export async function webhookHandler(event: { body: string }) {
  const payload = JSON.parse(event.body);

  if (payload.pull_request && payload.action === 'closed' && payload.pull_request.merged_at) {
    const prTitle = payload.pull_request.title;
    const prBranch = payload.pull_request.head.ref;

    const jiraKeyMatch = prTitle.match(/([A-Z]+-\d+)/) || prBranch.match(/([A-Z]+-\d+)/);
    const jiraKey = jiraKeyMatch ? jiraKeyMatch[1] : null;

    if (jiraKey) {
      await jiraService.changeIssueStatusToDone(jiraKey);
    } else {
      console.log('No Jira key found in PR title or branch name.');
    }
  }

  return {
    statusCode: 200,
    body: 'OK'
  };
}

export const handler = resolver.getDefinitions();
