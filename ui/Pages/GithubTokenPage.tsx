import {invoke} from "@forge/bridge";
import {Form, Label, Text, Textfield} from "@forge/react";
import { useState} from "react";
import {SerialisableEvent} from "@atlaskit/forge-react-types/src/components/__generated__/types.codegen";

type IProps = {
  onTokenChange: (token: string) => void;
}

export const GithubTokenPage = ({ onTokenChange }: IProps) => {
  const [tokenValue, setTokenValue] = useState('');

  const handleTokenChange = (event: SerialisableEvent) => {
    setTokenValue(event.target.value);
  };

  const onSubmit = async () => {
    await invoke('saveToken', { token: tokenValue });
    onTokenChange(tokenValue);
  }

  return (
    <>
      <Text>Store your Github API token</Text>
      <Form onSubmit={onSubmit}>
        <Label labelFor={'token'}>Github API token:</Label>
        <Textfield
          name="token"
          value={tokenValue}
          onChange={handleTokenChange}
          placeholder="Your token"
        />
      </Form>
    </>
    );
};
