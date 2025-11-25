# 🎮 HOF Manager Bot (AWS Serverless Edition)

**HOF Manager** is a robust Discord bot designed to manage weekly donations, daily activity reminders, clan member tracking, and character roles for MIR4 communities.

🚀 **Now re-engineered for the Cloud:** This version is built on **AWS Serverless Architecture** (Lambda, DynamoDB, API Gateway, S3), ensuring high scalability, zero maintenance, and cost-efficiency.

---

## ✨ Key Features

- ☁️ **Serverless & Scalable**: Runs on AWS Lambda. No servers to manage.
- 🏢 **Multi-Guild Support**: One bot instance can serve unlimited Discord servers.
- 📅 **Weekly Donations Tracking**: Monitor all main character donations per week.
- ⏰ **Daily Reminder**: Automatic DM reminders at 00:00 GMT-2 for those who haven't donated.
- 👑 **Dynamic Role Configuration**: Each server configures its own Leader and Member roles.
- 🛡️ **Character Registration**: Members can self-register their Main and Alt characters.
- 📊 **Weekly Reports**: Generate detailed CSV reports with one click (sent directly to chat).
- 🌎 **Multilingual Support**: Reminders in English, Spanish Latino, and Simplified Chinese.

---

## 🏗 Architecture

- **Compute**: AWS Lambda (Node.js 20.x)
- **Database**: AWS DynamoDB (Users, Donations, Config)
- **API**: AWS API Gateway (HTTP API)
- **Storage**: AWS S3 (Temporary CSV reports)
- **Framework**: Serverless Framework v3

---

## 🛠 Prerequisites

Before deploying, ensure you have:

1.  **Node.js 20+** installed.
2.  **AWS CLI** installed and configured with your credentials (`aws configure`).
3.  **Serverless Framework** installed globally:
    ```bash
    npm install -g serverless
    ```

---

## 🚀 Setup & Deployment

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd HOFManager
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and fill in your Discord credentials:

```ini
# Discord Configuration
DISCORD_PUBLIC_KEY=your_public_key
BOT_TOKEN=your_bot_token
CLIENT_ID=your_client_id

# Optional: Guild ID for faster development deployment (leave empty for global)
GUILD_ID=
```

### 3. Deploy to AWS

Deploy the entire stack to the `dev` stage:

```bash
npm run deploy:dev
```

This command will:
- Create DynamoDB tables.
- Create S3 bucket.
- Deploy Lambda functions.
- Setup API Gateway.

**Copy the `endpoint` URL from the output.** It will look like:
`https://xyz123.execute-api.us-east-1.amazonaws.com/dev/interactions`

### 4. Configure Discord

1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Select your application.
3.  In **General Information**, paste the endpoint URL into **Interactions Endpoint URL**.
4.  Save changes. You should see a green checkmark ✅.

### 5. Register Commands

Register the slash commands with Discord:

```bash
npm run deploy
```

---

## 📖 Usage Guide

### Initial Setup (Per Server)

1.  **Invite the Bot**: Use the OAuth2 URL Generator (scopes: `bot`, `applications.commands`).
2.  **Configure Roles**:
    ```
    /config-roles member_role:@ClanMember leader_role:@ClanLeader
    ```
    This tells the bot which roles represent members (who need to donate) and leaders (who can manage the bot).

### User Commands

| Command | Description |
|:---|:---|
| `/register-char` | Register your Main or Alt character. |
| `/donation` | Log a donation for one of your characters. |
| `/history-user` | View your personal donation history. |

### Leader Commands

| Command | Description |
|:---|:---|
| `/config-roles` | Set up the Member and Leader roles for the server. |
| `/daily` | Manually trigger the daily reminder check (sends DMs to those missing donations). |
| `/report-week` | Generate a CSV report of the current week's donations. |

---

## 📂 Project Structure

- `lambda/`: AWS Lambda function handlers (`interactions.js`, `dailyReminder.js`).
- `commands/`: Slash command definitions and logic.
- `db/`: DynamoDB interaction layers.
- `serverless.yml`: Infrastructure as Code configuration.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

_"Built for warriors. Managed by champions."_ ⚔️
