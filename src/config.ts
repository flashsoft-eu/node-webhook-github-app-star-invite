import 'dotenv/config'


const fields  = [
  'NODE_ENV',
  'GITHUB_APP_ID',
  'GITHUB_APP_PK_BASE64',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_WEBHOOK_SECRET',
  'ORG_TOKEN',
  'GITHUB_OAUTH_CLIENT_ID',
  'GITHUB_OAUTH_CLIENT_SECRET',
  'BOT_COOKIE_BASE64'
]

export const config = process.env as  Record<typeof fields[number], string>

const checkConfig = () => {
  const missingFields = fields.filter(field => !config[field])
  if(missingFields.length > 0) {
    throw new Error(`Missing fields in .env file: ${missingFields.join(', ')}`)
  }
}

const printConfigLength = () => {
  for(const field of fields) {
    console.log(field, config[field].length)
  }
}

checkConfig()
printConfigLength()