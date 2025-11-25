// File: handlers/confirmDonation.js

const { addDonation } = require('../db/donations');
const { DateTime } = require('luxon');

async function handleDonationModal(interaction) {
    const customId = interaction.data.custom_id;
    if (!customId.startsWith('donation_modal')) return null;

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

    const character = values['character_name'];
    const method = values['donation_method'].toLowerCase();
    const clan = values['clan_name'];
    const donationDateStr = values['donation_date'];

    // Parse the date
    const donationDate = DateTime.fromISO(donationDateStr, { zone: 'America/Sao_Paulo' });

    if (!donationDate.isValid) {
        return {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
                content: '❌ Invalid date format. Please use YYYY-MM-DD.',
                flags: 64 // Ephemeral
            }
        };
    }

    // Calculate the correct week ending based on the Saturday
    const saturday = donationDate.endOf('week').minus({ days: 1 });
    const week = `Week ending ${saturday.toFormat('dd')} - ${saturday.toFormat('LLLL')}`;

    const donationRecord = {
        discord_user_id: discordUserId,
        discord_username: discordUsername,
        character_name: character,
        donation_type: method,
        clan,
        date: donationDate.toISODate(),
        week
    };

    try {
        await addDonation(donationRecord);

        return {
            type: 4,
            data: {
                content: `✅ Donation from **${character}** registered successfully for **${week}**.`,
                flags: 64
            }
        };
    } catch (error) {
        console.error('Error saving donation:', error);
        return {
            type: 4,
            data: {
                content: '❌ Error saving donation. Please try again.',
                flags: 64
            }
        };
    }
}

module.exports = { handleDonationModal };
