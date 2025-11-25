// File: commands/weekReport.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { DateTime } = require('luxon');
const { getMainCharacters } = require('../db/users');
const { getDonationsByWeek } = require('../db/donations');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { createObjectCsvStringifier } = require('csv-writer');

const s3Client = new S3Client({ region: process.env.AWS_REGION });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report-week')
        .setDescription('Generate a weekly donation report for all main characters.'),

    async execute(interaction) {
        console.log('Starting report-week execution');
        const now = DateTime.now().setZone('America/Sao_Paulo');
        const saturday = now.endOf('week').minus({ days: 1 });
        const currentWeek = `Week ending ${saturday.toFormat('dd')} - ${saturday.toFormat('LLLL')}`;
        const guildId = interaction.guild_id;
        console.log(`Generating report for week: ${currentWeek}, Guild: ${guildId}`);

        try {
            console.log('Fetching data...');
            const [mainCharacters, donations] = await Promise.all([
                getMainCharacters(guildId),
                getDonationsByWeek(currentWeek)
            ]);

            console.log(`Found ${mainCharacters.length} main characters`);
            console.log(`Found ${donations.length} donations for this week`);

            const charactersWhoDonated = [];
            const charactersMissingDonation = [];
            const fullCsvData = [];

            for (const main of mainCharacters) {
                const donation = donations.find(d => d.character_name === main.name);
                if (donation) {
                    charactersWhoDonated.push(main.name);
                    fullCsvData.push({
                        character_name: main.name,
                        discord_username: main.discord_username,
                        type: 'MAIN',
                        donation_status: 'Donated',
                        clan: donation.clan,
                        donation_date: donation.date
                    });
                } else {
                    charactersMissingDonation.push(main.name);
                    fullCsvData.push({
                        character_name: main.name,
                        discord_username: main.discord_username,
                        type: 'MAIN',
                        donation_status: 'Missing',
                        clan: '',
                        donation_date: ''
                    });
                }
            }

            // Create CSV content
            const csvStringifier = createObjectCsvStringifier({
                header: [
                    { id: 'character_name', title: 'Character Name' },
                    { id: 'discord_username', title: 'Discord Username' },
                    { id: 'type', title: 'Type' },
                    { id: 'donation_status', title: 'Donation Status' },
                    { id: 'clan', title: 'Clan' },
                    { id: 'donation_date', title: 'Donation Date' }
                ]
            });

            const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(fullCsvData);
            const fileName = `weekly-report-${currentWeek.replace(/\s+/g, '-')}.csv`;

            const embed = {
                title: `Weekly Donation Report - ${currentWeek}`,
                color: 0x00AE86,
                fields: [
                    {
                        name: '✅ Donations registered',
                        value: `${charactersWhoDonated.length}/${mainCharacters.length}`,
                        inline: true
                    },
                    {
                        name: '🔴 Missing donations',
                        value: `${charactersMissingDonation.length}`,
                        inline: true
                    }
                ]
            };

            if (charactersWhoDonated.length > 0) {
                embed.fields.push({
                    name: '✅ Characters who donated',
                    value: charactersWhoDonated.slice(0, 20).map(c => `• ${c}`).join('\n') +
                        (charactersWhoDonated.length > 20 ? `\n... and ${charactersWhoDonated.length - 20} more` : ''),
                    inline: false
                });
            }

            if (charactersMissingDonation.length > 0) {
                embed.fields.push({
                    name: '🔴 Characters missing donation',
                    value: charactersMissingDonation.slice(0, 20).map(c => `• ${c}`).join('\n') +
                        (charactersMissingDonation.length > 20 ? `\n... and ${charactersMissingDonation.length - 20} more` : ''),
                    inline: false
                });
            }

            console.log('Sending response with file attachment via REST...');

            const { REST } = require('@discordjs/rest');
            const { Routes } = require('discord-api-types/v10');
            const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

            await rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
                body: {
                    type: 4,
                    data: {
                        embeds: [embed],
                        flags: 64 // Ephemeral
                    }
                },
                files: [{
                    attachment: Buffer.from(csvContent, 'utf-8'),
                    name: fileName
                }]
            });

            console.log('Response sent successfully via REST');
            return null; // Signal to interactions.js that we handled the response

        } catch (error) {
            console.error('Error generating report:', error);
            // If we haven't sent the response yet, return an error message
            return {
                type: 4,
                data: {
                    content: '❌ Error generating report. Please check logs.',
                    flags: 64
                }
            };
        }
    }
};
