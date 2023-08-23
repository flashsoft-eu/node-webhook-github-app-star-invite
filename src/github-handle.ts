import type { Context, Probot } from "probot";
import { Octokit } from "@octokit/rest";
import { config } from './config'
// import { App } from "octokit";

type TUsedContexts = "star.created" | "star.deleted";
type AppContexts = Context<TUsedContexts>;
type User = AppContexts["payload"]["sender"];
type ProbotOktokit = Awaited<ReturnType<Probot["auth"]>>

const allowedOrgs = ["flashsoft-eu", "andrei0x309"];
const allowedRepos = ["deno-slack-api-backup-preview"];

const repoMap = { 
  "deno-slack-api-backup-preview": "deno-slack-user-api",
} as Record<string, string>;

const installationIdMap = {
  'flashsoft-eu': 40959841,
  'andrei0x309': 40959837
} as Record<string, number>;

export const githubAppMain = (app: Probot) => {

  const orgAdmin = new Octokit({
    auth: config.ORG_TOKEN,
  });
  
  // const octoApp = new App({
  //   appId: Number(config.GITHUB_APP_ID),
  //   privateKey: config.GITHUB_APP_PRIVATE_KEY,
  // });

  const announceInvite = async (user: User, repo: string, authApp: ProbotOktokit  ) => {
    const timeString = new Date().toLocaleTimeString();

    console.log(await orgAdmin.teams.listDiscussionsInOrg({
      org: allowedOrgs[0],
      team_slug: 'public',
    }))

    await authApp.teams.createDiscussionCommentInOrg({
      org: allowedOrgs[0],
      team_slug: 'public',
      discussion_number: 1,
      body:
        `@${user.login} has been invited to the repo ${repo}. Invitation was sent at ${timeString}`,
    });
  };

  const isUserColab = async ({
    org,
    user,
    repo  
  }: { org: string, repo:string,  user: User }) => {
    const authApp = await app.auth(installationIdMap[org]);
    let isColab = false
    try {
    await authApp.repos.checkCollaborator({
      owner: org,
      repo,
      username: user.login,
    });
    isColab = true
    }  catch (e) {
      console.error(e);
    }
    return { isColab, authApp };
  }

 

  const hwdStarCreated = async (context: AppContexts) => {
    const [, repo] = context.payload.repository.full_name.split("/");
    const { isColab, authApp } = await isUserColab({ org: allowedOrgs[0], user: context.payload.sender, repo: repoMap[repo] })
    if (
      isColab
    ) {
      return 0;
    }
    try {
      // await authApp.repos.addCollaborator(
      //   {
      //       owner: allowedOrgs[0],
      //       repo: repoMap[repo],
      //       username: context.payload.sender.login,
      //       permission: "pull",
      //   })

      await  announceInvite(context.payload.sender,  repoMap[repo], authApp);
  } catch (e) {
    app.log.error(e as string);
  }    return 0;
  };

  const hwdStarDeleted = async (context: AppContexts) => {
    const [, repo] = context.payload.repository.full_name.split("/");
    const { isColab, authApp } = await isUserColab({ org: allowedOrgs[0], user: context.payload.sender, repo: repoMap[repo] })
    if (
      !isColab
    ) {
      return 0;
    }
    try {
      await authApp.repos.removeCollaborator(
        {
            owner: allowedOrgs[0],
            repo: repoMap[repo],
            username: context.payload.sender.login,
        })
    } catch (e) {
      app.log.error(e as string);
    }
    return 0;
  };

  function currieFilter(context: AppContexts) {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    const { fn } = this;
    try {
      const [org, repo] = context.payload.repository.full_name.split("/");
      console.log(org, repo);
      if (!allowedOrgs.includes(org) || !allowedRepos.includes(repo)) {
        throw new Error("Skip Org or Repo not on allowed list");
      }
      return fn(context);
    } catch (e) {
      app.log.info(e as string);
    }
  }

  const eventHandlers = {
    "star.created": currieFilter.bind({ fn: hwdStarCreated }),
    "star.deleted": currieFilter.bind({ fn: hwdStarDeleted }),
  } as Record<string, Parameters<Probot["on"]>[1]>;

  for (const event of Object.keys(eventHandlers)) {
    app.on(event as TUsedContexts, eventHandlers[event]);
  }
};
