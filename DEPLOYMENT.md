# 🚀 Deployment Guide - AWS Serverless

This guide will help you deploy HOF Manager Bot to AWS Lambda using the Serverless Framework.

---

## Prerequisites

1. **Node.js 20+** installed
2. **AWS Account** with appropriate permissions
3. **AWS CLI** configured with credentials
4. **Serverless Framework** installed globally:
   ```bash
   npm install -g serverless
   ```

---

## Step 1: Configure Environment Variables

1. Copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Discord credentials:
   ```env
   DISCORD_PUBLIC_KEY=your_discord_public_key_here
   BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   ```

   **How to get Discord Public Key:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application
   - Go to "General Information"
   - Copy the "Public Key"

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Deploy to AWS (Development)

```bash
npm run deploy:dev
```

This will:
- Create Lambda functions (`interactions` and `dailyReminder`)
- Create DynamoDB tables (`users` and `donations`)
- Create S3 bucket for CSV reports
- Create API Gateway endpoint
- Configure EventBridge cron schedule

**Output:**
```
✔ Service deployed to stack hofmanager-bot-dev

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/interactions

functions:
  interactions: hofmanager-bot-dev-interactions
  dailyReminder: hofmanager-bot-dev-dailyReminder
```

**Copy the `interactions` endpoint URL** - you'll need it for Discord configuration.

---

## Step 4: Configure Discord Interactions URL

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "General Information"
4. In "Interactions Endpoint URL", paste your API Gateway URL:
   ```
   https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/interactions
   ```
5. Click "Save Changes"

Discord will send a verification request. If configured correctly, you'll see a green checkmark ✅

---

## Step 5: Register Slash Commands

```bash
npm run deploy
```

This registers the slash commands with Discord's API.

---

## Step 6: Migrate Data (Optional)

If you're migrating from an existing Replit Database:

1. Ensure your Replit Database is accessible
2. Run the migration script:
   ```bash
   node scripts/migrate-data.js
   ```

This will transfer all users and donations to DynamoDB.

---

## Step 7: Test the Bot

1. Go to your Discord server
2. Try slash commands:
   - `/donation` - Should open a modal
   - `/history-user` - Should show your donation history
   - `/register-char` - Should register a character
   - `/report-week` - Should generate a report with CSV download link

---

## Deploy to Production

When ready for production:

```bash
npm run deploy:prod
```

This creates a separate production stack with a different endpoint URL.

**Remember to update the Discord Interactions URL** with the production endpoint!

---

## Monitoring and Logs

### View logs in real-time:
```bash
npm run logs
```

### View logs in AWS Console:
1. Go to AWS CloudWatch
2. Select "Log groups"
3. Find `/aws/lambda/hofmanager-bot-dev-interactions`

---

## Cost Monitoring

1. Go to AWS Cost Explorer
2. Filter by service: Lambda, DynamoDB, S3, API Gateway
3. Expected cost: **$0.12/month** (after free tier)

---

## Rollback / Cleanup

### Remove all AWS resources:
```bash
npm run remove:dev
```

This will delete:
- Lambda functions
- DynamoDB tables (⚠️ **data will be lost**)
- S3 bucket
- API Gateway
- EventBridge rules

---

## Troubleshooting

### Error: "Invalid signature"
- Check that `DISCORD_PUBLIC_KEY` in `.env` is correct
- Redeploy: `npm run deploy:dev`

### Commands not showing
- Run `npm run deploy` to register commands
- Wait 5-10 minutes for Discord to propagate

### Daily reminders not working
- Check CloudWatch logs for `dailyReminder` function
- Verify cron expression in `serverless.yml`
- Test manually: `serverless invoke --function dailyReminder`

### DynamoDB errors
- Verify table names in AWS Console match `serverless.yml`
- Check IAM permissions for Lambda

---

## Architecture Diagram

```
Discord → API Gateway → Lambda (interactions) → DynamoDB
                                              → S3

      EventBridge (cron) → Lambda (dailyReminder) → Discord (REST API)
```

---

## Security Best Practices

1. **Never commit `.env` file** (already in `.gitignore`)
2. **Use AWS IAM roles** with minimum required permissions
3. **Enable CloudWatch logging** for audit trails
4. **Rotate Discord bot token** periodically
5. **Use separate AWS accounts** for dev and production

---

## Support

For issues, check:
- [Discord.js Guide](https://discordjs.guide/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)

---

**Built for warriors. Managed by champions.** ⚔️
