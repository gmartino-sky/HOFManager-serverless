// File: handlers/confirmRegisterChar.js

const { addCharacter } = require('../db/users');

async function handleRegisterCharModal(interaction) {
    const customId = interaction.data.custom_id;
    if (!customId.startsWith('register_char_modal')) return null;

    const discordUserId = interaction.user.id;
    const discordUsername = interaction.user.username;

    // Extract modal field values
    const fields = interaction.data.components;
    const values = {};

    for (const actionRow of fields) {
        for (const component of actionRow.components) {
            values[component.custom_id] = component.value.trim();
        }
    }

    const name = values['character_name'];
    const type = values['character_type'].toLowerCase();
    const clan = values['character_clan'];

    // Validate type
    if (type !== 'main' && type !== 'alt') {
        return {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
                content: '❌ Character type must be either "main" or "alt".',
                flags: 64 // Ephemeral
            }
        };
    }

    try {
        await addCharacter(discordUserId, discordUsername, { name, type, clan });

        return {
            type: 4,
            data: {
                content: `✅ Character **${name}** registered as **${type.toUpperCase()}** in **${clan}**.`,
                flags: 64
            }
        };
    } catch (error) {
        console.error('Error registering character:', error);
        return {
            type: 4,
            data: {
                content: '❌ Error registering character. Please try again.',
                flags: 64
            }
        };
    }
}

module.exports = { handleRegisterCharModal };
