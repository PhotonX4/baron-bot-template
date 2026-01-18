# 🛡️ Veyra Sentinel — Empire Combat Sentinel

**A Powerful Discord Bot for Real-Time Wave 3 & Olympus Monitoring**

> Veyra Sentinel is an advanced Discord bot that monitors Wave 3 (Grakthar) and Olympus boss spawn timers from Demonic Scans. It provides real-time alerts, role-based commands, and automatic Cloudflare bypass detection for seamless game monitoring.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Commands](#commands)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Support](#support)

---

## 🎯 Overview

Veyra Sentinel is built to provide **real-time, reliable boss spawn monitoring** for game communities. It tracks two major systems:

- **⭐ Wave 3 (Grakthar)**: Monitor Generals and Lizard King spawn/defeat timers
- **🏛️ Olympus**: Monitor Oceanus and Poseidon boss cycles

The bot automatically detects **Cloudflare protection** on monitoring sites and notifies users when servers are unreachable. All timers are configurable and support role-based mentions.

---

## ✨ Features

✅ **Real-time Boss Monitoring** - Continuously tracks Wave 3 and Olympus timers  
✅ **Automatic Alerts** - Sends embeds when bosses spawn or die  
✅ **Role-Based Pinging** - Mention specific roles for each system  
✅ **Admin Control** - Override timers with custom durations  
✅ **Cloudflare Bypass Detection** - Detects and reports website protection  
✅ **Debug Logs** - Built-in system logging for troubleshooting  
✅ **IST Timestamps** - All logs use India Standard Time  
✅ **Zero Downtime** - Deploy once, runs 24/7 on Railway  
✅ **Slash Commands** - Modern Discord command interface  
✅ **Customizable** - Easy to modify for other games/systems

---

## 🏗️ Architecture

### Core Structure

```
bot.js
├── ENV Configuration (Discord Token, Client ID)
├── Site URLs (Olympus, Grakthar endpoints)
├── Role Definitions (Admin, Control, Debug roles)
├── Color Scheme & Images
├── Default Timer Values
├── State Management
├── Helper Functions
├── Website Monitoring (Cloudflare detection)
├── Alert Functions (Email-like embeds)
├── Slash Command Definitions
├── Event Handlers (interactions)
└── Auto-Login
```

### Timers

- **Olympus Oceanus**: Spawns every 12 hours, alive for 5 hours
- **Olympus Poseidon**: Spawns every 48 hours, alive for 24 hours
- **Wave 3 Generals**: Spawn every 6 hours, alive for 2 hours
- **Wave 3 Lizard King**: Spawns every 8 hours, alive for 2 hours

---

## 🚀 Installation

### Prerequisites

- **Node.js** v16 or higher
- **npm** or yarn
- **Discord Bot Token** from Discord Developer Portal
- **Client ID** from Discord Developer Portal
- **Railway Account** (for deployment)

### Step 1: Clone Repository

```bash
git clone https://github.com/PhotonX4/baron-bot-template.git
cd baron-bot-template
```

### Step 2: Install Dependencies

```bash
npm install
```

Required packages:
- `discord.js` - Discord API wrapper
- `@discordjs/builders` - Slash command builders
- `dotenv` - Environment variable management

### Step 3: Setup Environment File

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
NODE_ENV=production
```

⚠️ **NEVER** commit `.env` to version control!

### Step 4: Test Locally

```bash
node bot.js
```

You should see: `🤖 Online as YourBotName#0000`

---

## ⚙️ Configuration

### 1. Discord Server Setup

**Create Roles** (in Discord server settings):
- `Emperor` - Full control
- `Overseers` - Debug access
- `Dukes` - Timer control
- `Commanders` - Timer control
- `Council Elders` - Admin access

**Create Alert Channel**:
- Channel for receiving all bot alerts (recommend: #bot-alerts)

### 2. Configure Bot in Code

Edit lines in `bot.js`:

```javascript
// Line 13-14: Define admin roles
const ADMIN_ROLES = ["Council Elders", "Commanders", "Dukes", "Overseers", "Emperor"];

// Line 22-27: Edit URLs if game servers change
const GAME_SITES = {
  olympus: "https://demonicscans.org/active_wave.php?gate=5&wave=9",
  grakthar: "https://demonicscans.org/active_wave.php?gate=3&wave=8"
};
```

### 3. First Time Commands

Run these slash commands in Discord:

```
/set-channel #bot-alerts
/set-role system:Grakthar role:@YourGraktharRole
/set-role system:Olympus role:@YourOlympusRole
```

---

## 💬 Commands

### General Commands

**`/ping`** - Check bot latency and uptime
- Usage: `/ping`
- Response: Shows ms latency and uptime hours

**`/about`** - View bot information and features
- Usage: `/about`
- Response: Full feature list (private)

### Monitoring Commands

**`/w3-status`** - View Wave 3 boss timers
- Shows time until Generals spawn/die
- Shows time until Lizard King spawn/die
- Includes gate image

**`/olympus-status`** - View Olympus boss timers
- Shows Oceanus timer
- Shows Poseidon timer
- Includes temple image

### Alert Commands

**`/w3-alert type`** - Manually send Wave 3 alert
- Options: `general` or `lizard`
- Mentions configured Grakthar role
- Includes boss images

**`/olympus-alert boss:state`** - Manually send Olympus alert
- Boss: `oceanus` or `poseidon`
- State: `spawn` or `death`
- Mentions configured Olympus role

### Admin Commands

**`/set-channel channel`** - Set alert broadcast channel
- Admin only
- All alerts will be sent to this channel

**`/set-role system:role`** - Configure ping role
- Admin only
- System: `grakthar` or `olympus`
- Role: Discord role to mention

**`/w3-control boss:state:time`** - Override Wave 3 timers
- Admin only
- Boss: `generals` or `lizard`
- State: `spawn` or `death`
- Time: hours, minutes, seconds (optional)
- Use 0 time to reset to default cycle

**`/olympus-control boss:state:time`** - Override Olympus timers
- Admin only
- Same parameters as w3-control

**`/debug`** - View system debug log
- Overseers & Emperor only
- Shows last 10 system events
- Times displayed in IST

---

## 🚢 Deployment

### Deploy to Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy bot"
   git push origin main
   ```

2. **Connect Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add environment variables in Railway dashboard

3. **Configure Environment**
   ```
   DISCORD_TOKEN: your_token
   CLIENT_ID: your_client_id
   NODE_ENV: production
   ```

4. **Start Service**
   - Railway auto-deploys on push
   - Check logs in Railway dashboard
   - Service restarts automatically if it crashes

### Using Procfile

Railway uses the included `Procfile`:

```
worker: node bot.js
```

---

## 🐛 Troubleshooting

### Bot Not Responding
- Check if bot is online: `/ping`
- Verify bot has **Send Messages** permission
- Check `.env` file has correct TOKEN and CLIENT_ID
- View Railway logs for errors

### Commands Not Showing
- Invite bot with `applications.commands` scope
- Wait 1 minute for Discord to cache commands
- Try `/` command in a different server first

### Timers Not Updating
- Check website is accessible: Visit URLs in `.env`
- Verify bot has internet connection
- Check Railway resource limits aren't exceeded

### Alerts Not Sending
- Verify alert channel is set: `/set-channel`
- Check bot has Send Messages permission in that channel
- Verify role is configured: `/set-role`

### Cloudflare Detected
- Bot detected website protection (403/429 status)
- Timers pause until protection is lifted
- You'll see: "☁️ Olympus Shielded" message

---

## 🔒 Security

### Environment Variables

Sensitive data is **never** stored in code:
- `DISCORD_TOKEN` - Kept in `.env` (git ignored)
- `CLIENT_ID` - Kept in `.env` (git ignored)

The bot.js in this public repository has these redacted.

### Permissions

- Bot only executes commands from authorized members
- Admin commands restricted to specified roles
- Debug logs only shown to Overseers

### What Gets Logged

- Cloudflare detection events (time-stamped)
- Admin command executions (who, what, when)
- System errors (if any)

**No sensitive data is logged.**

---

## 📞 Support

### Getting Help

- **Bot Status**: Use `/ping` to check if bot is online
- **Debug Info**: Use `/debug` to view system logs
- **Bot Info**: Use `/about` to see all features

### Issues

If you encounter bugs:
1. Check [GitHub Issues](https://github.com/PhotonX4/baron-bot-template/issues)
2. View bot logs in Railway dashboard
3. Run `/debug` command for system info
4. Create a detailed issue report

---

## 📄 License

This project is provided as a public template. Modify freely for your community needs.

---

## 👏 Credits

- **Bot Name**: Veyra Sentinel
- **Created by**: Phantom Gaming
- **Built with**: Discord.js, Node.js, Railway
- **Game Data**: Demonic Scans
- **Timezone**: Asia/Kolkata (IST)

---

## 🔧 Quick Reference

| Command | Admin | Purpose |
|---------|-------|----------|
| `/ping` | No | Check status |
| `/about` | No | View features |
| `/w3-status` | No | Wave 3 timers |
| `/olympus-status` | No | Olympus timers |
| `/set-channel` | Yes | Configure alerts |
| `/set-role` | Yes | Configure mentions |
| `/w3-control` | Yes | Override W3 timers |
| `/olympus-control` | Yes | Override Olympus timers |
| `/debug` | Overseer | View logs |

---

**Last Updated**: January 2026  
**Version**: 2.0 (Wave 3 + Olympus)  
**Status**: Production Ready ✅
