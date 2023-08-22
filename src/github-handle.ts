import type { Context, Probot } from "npm:probot";

type TUsedContexts = "star.created" | "star.deleted";
type AppContexts = Context<TUsedContexts>;
type User = AppContexts["payload"]["sender"];

const allowedOrgs = ["flashsoft-eu", "andrei0x309"];
const allowedRepos = ["deno-slack-api-backup"];

export const githubAppMain = (app: Probot) => {
  const announceInvite = async (user: User) => {
    const authApp = await app.auth();
    const timeString = new Date().toLocaleTimeString();
    await authApp.teams.createDiscussionCommentInOrg({
      org: "flashsoft-eu",
      team_slug: "flashsoft-eu",
      discussion_number: 1,
      body:
        `@${user.login} has been invited to the organization. Invitation was sent at ${timeString}`,
    });
  };

  const isUserinOrg = async ({
    org,
    user,
  }: { org: string; user: User }) => {
    const authApp = await app.auth();
    const isUserinOrg = await authApp.orgs.checkMembershipForUser({
      org: org,
      username: user.login,
    });
    return isUserinOrg;
  };

  const hwdStarCreated = async (context: AppContexts) => {
    if (
      await isUserinOrg({ org: "flashsoft-eu", user: context.payload.sender })
    ) {
      return 0;
    }
    const starGazerUser = context.payload.sender.id;
    const authApp = await app.auth();
    authApp.orgs.createInvitation({
      org: "flashsoft-eu",
      invitation_id: starGazerUser,
      invitee_id: starGazerUser,
    });
    await announceInvite(context.payload.sender);
    return 0;
  };

  const hwdStarDeleted = async (context: AppContexts) => {
    if (
      !(await isUserinOrg({
        org: "flashsoft-eu",
        user: context.payload.sender,
      }))
    ) {
      return 0;
    }
    const starGazerUser = context.payload.sender.login;
    const authApp = await app.auth();
    authApp.orgs.removeMember({
      org: "flashsoft-eu",
      username: starGazerUser,
    });
    return 0;
  };

  function currieFilter(context: AppContexts) {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    const { fn } = this;
    try {
      const [org, repo] = context.payload.repository.full_name.split("/");
      if (!allowedOrgs.includes(org) || !allowedRepos.includes(repo)) {
        throw new Error("Skip Org or Repo not on allowed list");
      }
      return fn(context);
    } catch (e) {
      app.log.info(e);
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
