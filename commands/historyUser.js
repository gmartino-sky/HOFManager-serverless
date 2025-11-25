// File: commands/historyUser.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { getUserCharacters } = require('../db/users');
const { getDonationsByUser } = require('../db/donations');
const { DateTime } = require('luxon');

function generateLast4Weeks() {
    const weeks = [];
    let now = DateTime.now().setZone('America/Sao_Paulo');

    for (let i = 0; i < 4; i++) {
        const targetWeek = now.minus({ weeks: i });
        const saturday = targetWeek.endOf('week').minus({ days: 1 });
        const formatted = `Week ending ${saturday.toFormat('dd')} - ${saturday.toFormat('LLLL')}`;
        weeks.push(formatted);
    }

    return weeks;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('history-user')
        .setDescription('View your character donation history.'),

    async execute(interaction) {
        const discordUserId = interaction.member ? interaction.member.user.id : interaction.user.id;
        const guildId = interaction.guild_id;

        const characters = await getUserCharacters(guildId, discordUserId);

        if (!characters.length) {
            return {
                type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                data: {
                    content: '❌ No characters found linked to your account.\n💡 Use `/register-char` to link your character first.',
                    flags: 64 // Ephemeral
                }
            };
        }

        const donations = await getDonationsByUser(discordUserId);
        const last4Weeks = generateLast4Weeks();

        const fields = [];

        const orderedCharacters = [
            ...characters.filter(c => c.type === 'main'),
            ...characters.filter(c => c.type === 'alt')
        ];

        orderedCharacters.forEach(character => {
            fields.push({
                name: `${character.name} (${character.type.toUpperCase()})`,
                value: last4Weeks.map(week => {
                    const donated = donations.some(d => d.week === week && d.character_name === character.name);
                    return `${donated ? '✅' : '❌'} ${week}`;
                }).join('\n'),
                inline: false
            });
        });

        const embed = {
            title: 'Your Donation History',
            color: 0x00AE86,
            fields: fields
        };

        return {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
                embeds: [embed],
                flags: 64 // Ephemeral
            }
        };
    }
};
