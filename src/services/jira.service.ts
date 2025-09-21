import api, {route} from "@forge/api";

interface Issue {
  key: string;
  self: string;
  transitions: { id: string, name: string }[];
}

export default class JiraService {

  async getIssue(issueKey: string) {
    let data: Issue | null = null;
    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}`);
      if (response.status === 200) {
        data = await response.json();
      } else {
        console.error(`Error getting Jira issue ${issueKey}:`, await response.text())
      }
    } catch (error) {
      console.error(`Error getting Jira issue ${issueKey}:`, error);
    }

    return data;
  }

  async changeIssueStatusToDone(issueKey: string) {
    try {
      const issue = await this.getIssue(issueKey);

      if (!issue) {
        console.error(`Jira issue ${issueKey} not found.`);
        return;
      }

      const transitionsRes = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/transitions`);
      const transitionsData = await transitionsRes.json();

      const doneTransition = transitionsData.transitions.find((t: { name: string }) => t.name.toLowerCase() === 'mark as done');

      if (doneTransition) {
        await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/transitions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transition: { id: doneTransition.id } }),
        });
        console.log(`Jira issue ${issueKey} status changed to Done.`);
      } else {
        console.log(`No 'Done' transition found for issue ${issueKey}.`);
      }
    } catch (error) {
      console.error(`Error changing status for Jira issue ${issueKey}:`, error);
    }
  }
}