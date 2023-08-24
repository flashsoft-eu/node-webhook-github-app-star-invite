// const refreshAccessToken = async () => {
//     const tokenResponse = await fetch(`https://github.com/login/oauth/access_token`, {
//       method: "POST",
//       headers: {
//         accept: "application/json",
//         "content-type": "application/json",
//       },
//       body:
//         JSON.stringify({
//           client_id: config.GITHUB_OAUTH_CLIENT_ID,
//           client_secret: config.GITHUB_OAUTH_CLIENT_SECRET,
//           refresh_token: config.GUTHUB_OWNER_REFRESH_TOKEN,
//           grant_type: 'refresh_token'
//         }),
//     });
//     const token = await tokenResponse.json();
//     return token.access_token
//   }
  
//   const checkToken = async (token: string) => {
//     const response = await fetch(`https://api.github.com/applications/${config.GITHUB_OAUTH_CLIENT_ID}/tokens/${token}`, {
//       headers: {
//         authorization: `Bearer ${token}`,
//         accept: "application/vnd.github+json",
//       },
//     });
//     return response.ok
//   }
  