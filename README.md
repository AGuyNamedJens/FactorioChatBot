# Factorio Chat Bot
Two-directional chat bot connecting Discord and Factorio chats together, written in Node.js.
[Examples](https://github.com/MikhailMCraft/FactorioChatBot/blob/master/EXAMPLES.md)

This bot does **not**:
- Disable achievements **BY DEFAULT**.
- Require mods to run.

# Requirements
  1. A Discord Bot
  2. A Factorio server with RCON enabled
  3. A Factorio server with Logging enabled
  4. Node.js V14 (V16 is recommended!)

# Setting up a Discord Application

Head over to [Discord's developer page](https://discord.com/developers/applications) to create a new application

Open [this URL](https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=-1&scope=bot) and replace `CLIENT_ID` in the URL with the `Client ID` found on the application's `General Information` page. This should now show your bot, select your server to invite the bot there.

Now, the bot should have joined the server, albeit offline.

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

# Dependencies
## Node.js
### Windows
Install or update Node.js on Windows: [Node.js Installer](https://nodejs.org/en/) (Version **14** or higher)

To verify Node is installed run `node -v` in a terminal.

### Linux
Install or update Node.js on Linux by running these 2 commands:

`curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -`

`sudo apt -y install nodejs`

To verify Node is installed run `node -v` in a terminal.

## Git
### Windows
Git for Windows can be found [on their website](https://git-scm.com/download/win)

To verify Git is installed, run `git --version` in the terminal.

### Linux
`sudo apt install git -y` to install Git.

To verify Git is installed, run `git --version` in the terminal.

## Node packages
Clone or download the repository (read [Downloading and updating the repository](https://github.com/MikhailMCraft/FactorioChatBot#Downloading_and_updating_the_repository)).

Navigate to the containing folder and run `npm install` to install required packages.

# Downloading and updating the repository
### Cloning and pulling the repository (recommended)

Run `git clone https://github.com/MikhailMCraft/FactorioChatBot` in the folder in which to clone the repository to.

New changes can be fetched by running `git pull` in the directory periodically.

### Downloading the newest release (not recommended)

Grab the newest stable release FactorioChatBot.zip at [the Releases](https://github.com/MikhailMCraft/FactorioChatBot/releases).

Run the following command within the containing directory to install the required packages.

`npm install`

Note that releases are not commonly distributed, so cloning and pulling the repo is recommended to keep up-to-date with changes.

# Configuration

See [CONFIG.MD](https://github.com/MikhailMCraft/FactorioChatBot/blob/master/CONFIG.md) for configuring the bot!

# Running the bot from the terminal

The bot can be run from the terminal by using `ts-node .` in the directory the bot is located.