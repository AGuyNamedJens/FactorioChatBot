# Factorio Chat Bot
Two-Directional chat bot connecting Discord and Factorio chats together, written in nodejs.
[Examples](https://github.com/AGuyNamedJens/FactorioChatBot/wiki/Examples)

This bot does **not**:
- Disable Achievements **BY DEFAULT**.
- Require mods to run.

The guide below and on the [Wiki](https://github.com/AGuyNamedJens/FactorioChatBot/wiki) is made for factorio servers on Linux. Windows guide might be added on a later date.

# Requirements
  1. A Discord Bot
  2. A factorio server with RCON enabled
  3. A factorio server with Logging enabled
  4. Node.JS V14 (V16 is recommended!)

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

## Node packages
Clone or download the repository.

Navigate to the containing folder and run `npm install` to install required packages.

# Downloading and updating the repository
### Cloning and pulling the repository (recommended)

Run `git clone https://github.com/AGuyNamedJens/FactorioChatBot` in the folder in which to clone the repository to.

New changes can be fetched by running `git pull` in the directory periodically.


### Downloading the newest release

Grab the newest stable release FactorioChatBot.zip at [the Releases](https://github.com/AGuyNamedJens/FactorioChatBot/releases)

Unzip the ZIP file.

Go back to your terminal.
`cd <repo name>` to navigate to the folder you have the Factorio Chat Bot uploaded at.

Run the following command within that directory to install the required packages.

`npm install`

Please note that releases are not commonly distributed, so cloning and pulling the repo is recommended to keep up-to-date with changes.

# Configuration

See [CONFIG](https://github.com/AGuyNamedJens/FactorioChatBot/wiki/Configuration) for configuring the bot!

# Running the bot from the terminal

This will however stop the bot as soon as you hit CTRL+C or exit the terminal.

`node .` or `node FactorioChatBot.js`. 

# Running the bot as a service

This will keep the bot running when you exit the terminal.
Follow the guide below or press the link on installing and setting up [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

Run the following command as root to install pm2 globally:

`npm install pm2@latest -g`

After pm2 has been installed, you should be able to start the bot by running the following command in the dir of the bot:

`pm2 start index.js --name factoriochatbot` (You can change the name)

To manage the newly created process, these commands exist:

`pm2 restart app_name`,
`pm2 reload app_name`,
`pm2 stop app_name` and
`pm2 delete app_name`

For listing all applications:

`pm2 [list|ls|status]`

![Image](https://i.imgur.com/LmRD3FN.png)

There is a way to view logs, which you can access by running:

`pm2 logs app_name` and `pm2 logs app_name --lines 200` to dig into older logs.