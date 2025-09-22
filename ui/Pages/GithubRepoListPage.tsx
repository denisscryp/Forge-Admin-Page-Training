import {useEffect, useState} from "react";
import {invoke} from "@forge/bridge";
import {Button, Heading, Link, SectionMessage, Text, DynamicTable, Box} from "@forge/react";
import {RepositoryData} from "../common/interfaces";

const head = {
  cells: [
    {
      key: 'github',
      content: 'GitHub PR#',
      width: 20,
    },
    {
      key: 'title',
      content: 'PR Title',
      width: 60,
    },
    {
      key: 'jira',
      content: 'Jira Ticket',
      width: 20,
    },
    {
      key: 'action',
      content: 'Action',
      width: 20,
    },
  ],
};

export const GithubRepoListPage = () => {
  const [data, setData] = useState<RepositoryData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string| null>(null);
  const [success, setSuccess] = useState<string| null>(null);

  const fetchData = async () => {
    try {
      const result = await invoke('getGitHubAndJiraData');

      if (result && (result as {error: string}).error) {
        setError((result as {error: string}).error);
        setSuccess(null);
        setData(null);
      } else {
        setData(result as RepositoryData[]);
        setError(null);
        setSuccess(null);
      }
    } catch (e: unknown) {
      console.error(e);
      setError('Failed to load data.');
      setSuccess(null);
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
      setSuccess("Merged pull request");
    } catch (error) {
      setLoading(false)
      setError('Failed to Merge Pull Request');
      console.error(error);
    }
    fetchData();
  }

  if (loading) {
    return (
      <>
        <Text>Loading...</Text>
        {success && (
          <SectionMessage title="Success" appearance="success">
            <Text>{success}</Text>
          </SectionMessage>
        )}
      </>
    );
  }

  if (error) {
    return (
      <SectionMessage title="Error" appearance="error">
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
  const repos = [];
  const mergeButton = (owner: string, repo: string, prNumber: number) =>
    <Button appearance={"primary"} onClick={() => handleMerge(owner, repo, prNumber)}>Merge</Button>

  for (const repo of data) {
    const dataRows = []
    for (const pr of repo.openPRs) {
      dataRows.push({
        cells: [
          { key: 'github', content: <Link href={pr.url}>#{pr.number}</Link> },
          { key: 'title', content: pr.title },
          { key: 'jira', content: pr.jiraIssue ? <Link href={pr.jiraIssue.self}>{pr.jiraIssue.key}</Link> : null },
          { key: 'action', content: mergeButton(repo.owner, repo.name, pr.number) },
        ]
      })
    }

    repos.push({
      repo: <Link href={repo.url}>{repo.name}</Link> ,
      language: repo.language,
      dataRows,
    });
  }

  return (
    <Box xcss={{maxWidth: 700}}>
      <Heading size="medium">Pull Requests:</Heading>
      {repos.map((repo, index) => (
        <Box key={index} xcss={{ backgroundColor: 'color.background.neutral', padding: 'space.200', marginTop: 'space.200' }}>
          <Text >Repository: {repo.repo} Language: {repo.language}</Text>
          <Box key={index} xcss={{ marginTop: 'space.200' }}>
            <DynamicTable
              head={head}
              rows={repo.dataRows}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}