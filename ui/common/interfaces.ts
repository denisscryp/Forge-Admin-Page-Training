
export type JiraIssue = {
  key: string;
  self: string;
}

export type PullRequest = {
  id: number;
  title: string;
  url: string;
  number: number;
  jiraIssue: JiraIssue | null;
}

export type RepositoryData = {
  name: string;
  language: string;
  url: string;
  owner: string;
  openPRs: PullRequest[];
}