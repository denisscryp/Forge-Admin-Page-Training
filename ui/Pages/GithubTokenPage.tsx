import {invoke} from "@forge/bridge";
import {Box, Button, Form, Heading, Inline, Label, Textfield} from "@forge/react";
import {useState} from "react";

type IProps = {
  onTokenChange: () => void;
}

export const GithubTokenPage = ({ onTokenChange }: IProps) => {
  const [tokenValue, setTokenValue] = useState('');

  const onSubmit = async () => {
    await invoke('saveToken', { token: tokenValue });
    onTokenChange();
  };

  return (
    <Box xcss={{maxWidth: 500}}>
      <Heading size={"medium"}>Store your Github API token</Heading>
      <Form onSubmit={onSubmit} >
        <Label labelFor={'token'}>Github API token:</Label>
        <Inline alignBlock={"center"} space={'space.200'}>
          <Textfield
            name="token"
            isCompact
            value={tokenValue}
            onChange={(event) => setTokenValue(event.target.value)}
            placeholder="Your token"
          />
          <Button type={'submit'} appearance={"primary"} onClick={onSubmit}>Save</Button>
        </Inline>
      </Form>
    </Box>
    );
};
