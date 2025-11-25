// File: commands/changeMain.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUser, saveUser } = require('../db/users');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change-main')
        .setDescription('Set a new character as your main')
        .addStringOption(option =>
            option.setName('character')
                .setDescription('The name of your new main character')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.tag;
        const guildId = interaction.guildId;
        const newMainName = interaction.options.getString('character');

        if (!guildId) {
            return interaction.reply({
                content: '❌ This command can only be used in a server.',
                ephemeral: true
            });
        }

        try {
            // Get user data
            let userData = await getUser(guildId, userId);

            if (!userData) {
                // No record yet for this user, create new one
                userData = {
                    discord_username: username,
                    characters: [
                        { name: newMainName, type: 'main' }
                    ]
                };
            } else {
                // Remove previous main
                userData.characters = userData.characters.filter(c => c.type !== 'main');

                const altIndex = userData.characters.findIndex(c => c.name === newMainName);

                if (altIndex !== -1) {
                    // Promote existing alt to main
                    userData.characters.splice(altIndex, 1); // remove as alt
                }

                // Add new main
                userData.characters.push({
                    name: newMainName,
                    type: 'main'
                });
            }

            // Save updated data
            await saveUser(guildId, userId, userData);

            await interaction.reply({
                content: `✅ Your new main character is now **${newMainName}**.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error changing main character:', error);
            await interaction.reply({
                content: '❌ An error occurred while updating your main character.',
                ephemeral: true
            });
        }
    }
};
