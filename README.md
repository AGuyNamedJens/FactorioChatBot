# Factorio Chat Bot
Two-Directional chat bot connecting Discord and Factorio chats together, written in nodejs.

This bot does **not**:
- Disable Achievements unless specified.
- Require mods to run.

The guide below is made for factorio servers on Linux.

# Requirements
  1. A factorio server with RCON enabled
  2. A factorio server with Logging enabled
  3. Ability to host the bridge locally on the same machine as the game server.

# Setting up RCON and Logging
The Factorio server must have RCON and Logging enabled.
Add these params to the factorio's run script.

```--rcon-port <port>```	Port to use for RCON
  
```--rcon-password <pass>```	Password for RCON

```--console-log <path-to-file>```  File to log the chat messages in

Full Example (including server params):

```/opt/factorio/bin/64/factorio --start-server /opt/factorio/saves/map.zip --server-settings /opt/factorio/data/server-settings.json --rcon-port 8080 --rcon-password password --console-log /opt/factorio/Factorio-server.log```

# Dependencies
Install or update NodeJS on Windows: [NodeJS Installer](https://nodejs.org/en/) (Version 12 or higher)

Install or update NodeJS on Linux by running these 2 commands:

`curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -`

`sudo apt -y install nodejs`

To verify node is installed run "node -v" in a cmd prompt.
the node version should be returned

Navigate in the cmd prompt to the folder you have the Factorio Chat Bot at.

Run the following command within that directory to install the required packages.

`npm install`


# Configuration
    
  Rename `config.json.example` to `config.json`

  Set `"logFile": "file"` to the path you set earlier. 

  set `"chatChannel": "Channel ID"` with your discord channel ID for the chat messages. ([Help](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-))

  Set `"cleanMessages": "false"` to true if you want to have clean messages in Factorio. **WARNING: THIS WILL DISABLE ACHIEVEMENTS!**

  Set `"consoleChannel": "false"` to the channel ID if you want to have a seperate channel for executing factorio commands. **WARNING: SOME MAY DISABLE ACHIEVEMENTS!**

  set RconIP (Should remain 127.0.0.1 for localhost)

  set RconPort (Same port you set in your server launch params)

  set RconPassword (Same pass you set in your server launch params)


# Running the bot
--To run from console do the following in the dir of the bot-- 

`node .` or `node FactorioChatBot.js`

--To run as a service--

Follow the guide below or press the link on installing and setting up [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

Run the following command as root to install pm2 globally:

`npm install pm2@latest -g`

After pm2 has been installed, you should be able to start the bot by running the following command in the dir of the bot:

`pm2 start index.js --name factoriochatbot` (You can change the name)

To manage the newly created process, these commands exist:

`pm2 restart app_name`

`pm2 reload app_name`

`pm2 stop app_name`

`pm2 delete app_name`

For listing all applications:

`pm2 [list|ls|status]`

![Image](https://i.imgur.com/LmRD3FN.png)

There are also logs, which you can access by running:

`pm2 logs app_name` and `pm2 logs app_name --lines 200` to dig into older logs.