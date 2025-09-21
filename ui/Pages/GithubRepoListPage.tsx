import {useEffect, useState} from "react";
import {invoke} from "@forge/bridge";
import {Button, Heading, Link, SectionMessage, Text, DynamicTable} from "@forge/react";

type JiraIssue = {
  key: string;
  self: string;
}

type PullRequest = {
  id: number;
  title: string;
  url: string;
  number: number;
  jiraIssue: JiraIssue | null;
}

type RepositoryData = {
  name: string;
  language: string;
  url: string;
  owner: string;
  openPRs: PullRequest[];
}

const head = {
  cells: [
    {
      key: 'repo',
      content: 'Repo',
      width: 20,
    },
    {
      key: 'lang',
      content: 'Languages',
      width: 20,
    },
    {
      key: 'github',
      content: 'GitHub PR#',
      width: 10,
    },
    {
      key: 'title',
      content: 'PR Title',
      width: 40,
    },
    {
      key: 'jira',
      content: 'Jira Ticket',
      width: 20,
    },
    {
      key: 'action',
      content: 'Action',
      width: 30,
    },
  ],
};

export const GithubRepoListPage = () => {
  const [data, setData] = useState<RepositoryData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const result: any = await invoke('getGitHubAndJiraData');

      if (result && result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result as RepositoryData[]);
        setError(null);
      }
    } catch (e: any) {
      console.error(e);
      setError('Failed to load data. Make sure your GitHub token is valid.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMerge = async (owner: string, repo: string, prNumber: number) => {
    setLoading(true)
    try {
      await invoke('mergePullRequest', {owner, repo, prNumber});
    } catch (error) {
      setError('Failed to Merge Pull Request');
      console.error(error);
    }
    fetchData();
  }

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return (
      <SectionMessage title="Error" appearance="warning">
        <Text>{error}</Text>
      </SectionMessage>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SectionMessage title="No Open Pull Requests" appearance="information">
        <Text>You have no opened pull requests related to a Jira task.</Text>
      </SectionMessage>
    );
  }
  const dataRows = []
  const mergeButton = (owner: string, repo: string, prNumber: number) => <Button onClick={() => handleMerge(owner, repo, prNumber)}>Merge</Button>
  for (const repo of data) {
    for (const pr of repo.openPRs) {
      dataRows.push({
        cells: [
          { key: 'repo', content: <Link href={repo.url}>{repo.name}</Link> },
          { key: 'lang', content: repo.language },
          { key: 'github', content: <Link href={pr.url}>#{pr.number}</Link> },
          { key: 'title', content: pr.title },
          { key: 'jira', content: pr.jiraIssue ? <Link href={pr.jiraIssue.self}>{pr.jiraIssue.key}</Link> : null },
          { key: 'action', content: mergeButton(repo.owner, repo.name, pr.number) },
        ]
      })
    }
  }

  return <>
    <Heading size="large">Pull Requests:</Heading>
    <DynamicTable
      head={head}
      rows={dataRows}
    />
  </>;
}