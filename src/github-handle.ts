import { Context, Probot } from "probot";
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


export const githubOauthLogin = async (req: any, res: any) => {
  const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${config.GITHUB_OAUTH_CLIENT_ID}&scope=write:discussion,read:discussion`; 
  res.redirect(authorizeUrl);
}

export const githubOauthCallback = async (req: any, res: any) => {
  try {
  const { code } = req.query;
  const tokenResponse = await fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body:
      JSON.stringify({
        client_id: config.GITHUB_OAUTH_CLIENT_ID,
        client_secret: config.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
  });
  const token = await tokenResponse.json();
  const { access_token } = token;
  
  const userResponse = await fetch(`https://api.github.com/user`, {
    headers: {
      authorization: `Bearer ${access_token}`,
      accept: "application/vnd.github+json",
    },
  });
  if(userResponse.ok) {
    console.info(token)
    res.send('You are logged in, you can close this window now')
  }
  else {
    res.send('Something went wrong')
  }
} catch (e) {
  res.send('Something went wrong')
}
}


const getHeaders = () => {
  return  {
    cookie: config.GITHUB_BOT_COOKIE,
    accept: "application/json",
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    origin: 'https://github.com',
    referer: `https://github.com/orgs/${allowedOrgs[0]}/discussions/1`,
    dnt: '1',
    pragma: 'no-cache',
    'sec-ch-ua': '"Chromium";v="116", "Not)A;Brand";v="24", "Brave";v="116"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'x-requested-with': 'XMLHttpRequest',
  }
}


const getAuthenticityTokenDiscussions = async () => {
  const htmlReq = await fetch(`https://github.com/orgs/${allowedOrgs[0]}/discussions/1`, {
    headers: {
      ...getHeaders(),
      accept: 'text/html'
    }
  })
  const html = await htmlReq.text()
  const token = html.match(/<form.*?\/discussions\/1\/comments.*?authenticity_token.*?value=(?:"|')(.*?)(?:"|')/)?.[1]
  console.log(html)
  console.log(token)
  return token || 'Y5yO3IU2D9vQC5fEaZzI2rbD0YkvjYEJPFSCO73NgfGLkaDC234YSW8vssyEPw3Wn3Xe3MIz61ZKxdUNvCfdiQ'
}



export const githubAppMain = (app: Probot) => {

  // const orgAdmin = new Octokit({
  //   auth: config.ORG_TOKEN,
  // });

  // const octoApp = new App({
  //   appId: Number(config.GITHUB_APP_ID),
  //   privateKey: config.GITHUB_APP_PRIVATE_KEY,
  // });

  const announceInvite = async (user: User, repo: string  ) => {
    const timeString = new Date().toLocaleTimeString();
     const formData = new FormData();
      formData.append('timestamp',  String(Date.now() / 1000));
      formData.append('comment[body]', `[Automated] @${user.login} has been invited to the repo ${repo}. Invitation was sent at ${timeString}`);
      formData.append('authenticity_token', await getAuthenticityTokenDiscussions());
      formData.append('required_field_609c', '');
      formData.append('timestamp_secret', '');
      formData.append('saved_reply_id', '');
      formData.append('path', '');
      formData.append('line', '');
      formData.append('start_line', '');
      formData.append('preview_side', '');
      formData.append('preview_start_side', '');
      formData.append('start_commit_oid', '');
      formData.append('end_commit_oid', '');
      formData.append('base_commit_oid', '');
      formData.append('comment_id', '');

 
      fetch(`https://github.com/${allowedOrgs[0]}/discussions-host/discussions/1/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: formData
      }).then(async (res) => console.log(await res.text())).catch(console.error)
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
      const colab = await authApp.repos.addCollaborator(
        {
            owner: allowedOrgs[0],
            repo: repoMap[repo],
            username: context.payload.sender.login,
            permission: "pull",
        })
      await  announceInvite(context.payload.sender,  repoMap[repo]);
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
