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
Install or update NodeJS https://nodejs.org/en/ (Version 12 or higher)

To verify node is installed open an elevated cmd prompt and do "node -v" 
the node version should be returned

Navigate in the cmd prompt to the folder you have the Factorio Chat Bot at.

Run the following commands within that directory

`npm install discord.js --save`

`npm install chokidar --save`

`npm isntall rcon --save`

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

node FactorioChatBot.js

--To run as a service--

Follow the guide to install and set up [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)