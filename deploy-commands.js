require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

// ✅ Reemplazá estos 3 valores a mano:
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.BOT_TOKEN;

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.warn(`⚠️ The command at ./commands/${file} is missing \"data\" or \"execute\" property.`);
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(`🛠️ Started refreshing ${commands.length} application (/) commands.`);

        const route = guildId
            ? Routes.applicationGuildCommands(clientId, guildId)
            : Routes.applicationCommands(clientId);

        console.log(`Target: ${guildId ? `Guild (${guildId})` : 'Global'}`);

        await rest.put(
            route,
            { body: commands }
        );

        console.log('✅ Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
