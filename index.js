const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

require('./dashboard/app');
require('./handlers/commandHandler')(client);

// Load event files
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('\x1b[32mConnected to MongoDB\x1b[0m'); // Green color

        const commands = client.commands.map(command => command.data.toJSON());
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('\x1b[32mSuccessfully registered application commands.\x1b[0m'); // Green color
        client.login(process.env.TOKEN);
    } catch (error) {
        console.error(error);
    }
})();
