import React, {useEffect, useState} from 'react';
import ForgeReconciler from '@forge/react';
import {invoke} from '@forge/bridge';
import {GithubTokenPage} from "./Pages/GithubTokenPage";
import {GithubRepoListPage} from "./Pages/GithubRepoListPage";

const App = () => {
  const [tokenExists, setTokenExists] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const { token }  = await invoke<{ token: string}>("getToken");
        if (token) {
          setTokenExists(true);
        }
      } catch (error) {
        console.error(error)
      }
    };
    checkToken();
  }, []);
  return (
    <>
      {tokenExists ? <GithubRepoListPage /> : <GithubTokenPage onTokenChange={() => setTokenExists(true)} /> }
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
