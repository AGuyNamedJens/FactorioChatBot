# Configuration

  Rename `config.json.example` to `config.json` by using `mv config.json.example config.json`
  > Open this file in either the terminal (`nano config.json`, `vim config.json` or any other terminal editors) or via any SFTP file manager.

  - Set `"logFile": "file"` to the path you set earlier.

  - set `"chatChannel": "Channel ID"` with your Discord channel ID for the chat messages. ([Help](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-))

  - set `"cleanMessages": false` to true if you want to have clean messages in Factorio. **WARNING: THIS WILL DISABLE ACHIEVEMENTS!**

  - set `"adminsCanRunCommands": false` to true if you want users with administrative permissions on the Discord server to be able to remotely run Factorio commands as the server via `/command`.

  - set `"sendServerMessages": false` to true if you want the server to send messages to the chat channel.

  - set `"logLines": false` to true if you want to have every line in the log file to be logged to console, includes chat, warnings and joins/leaves. **WARNING: LOG SIZE WILL INCREASE BY A LOT AFTER A WHILE (GBs)**

  - set `factorioPath` to the absolute path of your Factorio file, including the extension.

  - set `"autoCheckUpdates": false` to true if you want to have the bot check for latest Factorio packages on startup. **YOU MUST CLONE https://github.com/narc0tiq/factorio-updater AND MOVE `update_factorio.py` TO THIS DIRECTORY IN ORDER FOR THIS TO WORK**

  - set `"autoCheckModUpdates": false` to true if you want to have the bot check for mod updates on startup. **YOU MUST CLONE https://github.com/pollen00/factorio-mod-updater AND MOVE `mod_updater.py` TO THIS DIRECTORY IN ORDER FOR THIS TO WORK**

  - set ``"factorioModsPath": "/opt/factorio/mods"`` to the path of your Factorio mods folder.

  - set ``"factorioSettingsPath": "/opt/factorio/data/server-settings.json"`` to the path of your Factorio server settings json file.

  - set `"userToNotify": "User ID"` to the Discord user ID of the user in which to notify if you would like the bot to notify the user when newer Factorio packages are found.

  - set `"checkTime` to the time, in milliseconds, of the delay between checking for Factorio packages. Set to -1 to only check on startup.

  - set `"silentCheck": true` to false if you want the console to report whether or not newer Factorio packages were found.

  - set `RconIP` to the RCON IP (should normally remain localhost, or 127.0.0.1, unless connecting to a remote Factorio server).

  - set `RconPort` to the RCON port (should normally remain 8080, unless connecting to a remote Factorio server).

  - set `RconPassword` to the RCON password as set with the --rcon-password launch flag.

  - set `RconTimeout` to the timeout, in milliseconds, without a packet before the bot will raise an exception.

  - set `"token": "Bot Token"` to the bot's token as mentioned when creating a new application.