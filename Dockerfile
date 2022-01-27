FROM node:16

# Set the working directory
WORKDIR /opt/FactorioChatBot

# Copy the required files to the container
COPY index.js /opt/FactorioChatBot/index.js
COPY package.json package-lock.json /opt/FactorioChatBot/

# Install dependencies
RUN cd /opt/FactorioChatBot
RUN npm install

# Mount the docker volume to the host
VOLUME /opt/FactorioChatBot

# Bind the log file which could be created by another container.
VOLUME /opt/factorio/Factorio-server.log

# Run the bot
CMD ["node", "."]