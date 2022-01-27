# Factorio Chat Bot - Typescript Edition
Two-directional chat bot connecting Discord and Factorio chats together, written in TypeScript using Node.js.
[Examples](https://github.com/AGuyNamedJens/FactorioChatBot/wiki/Examples)

This bot does **not**:
- Disable Achievements **BY DEFAULT**.
- Require mods to run.

The guide below and on the [Wiki](https://github.com/AGuyNamedJens/FactorioChatBot/wiki) is made for Factorio servers on Linux. Windows guide might be added on a later date.

# Requirements
  1. A Discord bot
  2. A Factorio server with RCON enabled
  3. A Factorio server with Logging enabled
  4. Node.js V14 (V16 is recommended!)

# Setting up a Discord Application

Head over to [Discord's developer page](https://discord.com/developers/applications) to create a new application

Open [this URL](https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=-1&scope=bot) and replace `CLIENT_ID` in the URL with the `Client ID` found on the application's `General Information` page. This should now show your bot, select your server to invite the bot there.

Now, the bot should have joined the server, and is currently offline.

Head back to [Discord's developer page](https://discord.com/developers/applications), select the application again and head over to the `Bot` page under the settings tab.
Create a bot by pressing "Add Bot" and copy the token to somewhere for a while. You will need this token later for the bot to connect to Discord.

**Keep this token to yourself ONLY!**

# Setting up RCON and Logging
The Factorio server must have RCON and Logging enabled.
Add the following parameters to the run script:

```--rcon-port <port>``` - Port to use for RCON.
  
```--rcon-password <pass>``` - Password for RCON.

```--console-log <path-to-file>``` - File to log the chat messages in.

Full example, with server parameters:

```/opt/factorio/bin/64/factorio --start-server /opt/factorio/saves/map.zip --server-settings /opt/factorio/data/server-settings.json --rcon-port 8080 --rcon-password password --console-log /opt/factorio/Factorio-server.log```

# Node packages
Clone or download the repository.

Navigate to the containing folder and run `npm install` to install required packages.

# Downloading and updating the repository
### Cloning and pulling the repository (recommended)

Run `git clone https://github.com/AGuyNamedJens/FactorioChatBot` in the folder in which to clone the repository to.

New changes can be fetched by running `git pull` in the directory periodically.

To verify Git is installed, run `git --version` in the terminal.

### Downloading the newest release (not recommended)

Grab the newest stable release FactorioChatBot.zip at [the Releases](https://github.com/AGuyNamedJens/FactorioChatBot/releases).

Run the following command within the containing directory to install the required packages.

`npm install`

Please note that releases are not commonly distributed, so cloning and pulling the repo is recommended to keep up-to-date with changes.

# Additional Info

Additional info, including configuration parameters, can be found on the [wiki](https://github.com/AGuyNamedJens/FactorioChatBot/wiki).
