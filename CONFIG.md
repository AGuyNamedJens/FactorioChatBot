# Configuration
    
  - Rename `config.json.example` to `config.json` by using `mv config.json.example config.json`
  > Open this file in either the terminal (`nano config.json`, `vim config.json` or any other terminal editors) or via any SFTP file manager.

  - Set `"logFile": "file"` to the path you set earlier. 

  - set `"prefix": "?"` to a prefix of your choice. This is used for discord commands.

  - set `"chatChannel": "Channel ID"` with your discord channel ID for the chat messages. ([Help](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-))

  - set `"cleanMessages": false` to true if you want to have clean messages in Factorio. **WARNING: THIS WILL DISABLE ACHIEVEMENTS!**

  - set `"consoleChannel": false` to the channel ID if you want to have a seperate channel for executing factorio commands. This won't return any responses however.. **WARNING: SOME MAY DISABLE ACHIEVEMENTS SUCH AS USING /COMMAND!**

  - set `"logLines": false` to true if you want to have every line in the log file to be logged to console, includes chat, warnings and joins/leaves **WARNING: LOG SIZE WILL INCREASE BY A LOT AFTER A WHILE (GBs)**

  set RconIP (Should remain 127.0.0.1 for localhost)

  set RconPort (Same port you set in your server launch params)

  set RconPassword (Same pass you set in your server launch params)

  set `"token": "Bot Token"` to the bot's token as i mentioned before when creating a new application.
