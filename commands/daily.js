// File: commands/daily.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { getGuildRoles } = require('../db/config');

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Send a daily reminder to specific clan members')
        .addUserOption(option =>
            option.setName('user1')
                .setDescription('First user to remind')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user2')
                .setDescription('Second user to remind')
                .setRequired(false)
        )
        .addUserOption(option =>
            option.setName('user3')
                .setDescription('Third user to remind')
                .setRequired(false)
        ),

    async execute(interaction) {
        const member = interaction.member;
        const guildId = interaction.guild_id;

        // Get guild configuration
        const roles = await getGuildRoles(guildId);

        if (!roles || !roles.leaderRoleId) {
            return {
                type: 4,
                data: {
                    content: '❌ Roles are not configured for this server. Please ask an admin to run `/config-roles` first.',
                    flags: 64
                }
            };
        }

        // Check for leader role
        const hasLeaderRole = member.roles.includes(roles.leaderRoleId);

        if (!hasLeaderRole) {
            return {
                type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                data: {
                    content: `❌ You do not have permission to use this command. You need the <@&${roles.leaderRoleId}> role.`,
                    flags: 64 // Ephemeral
                }
            };
        }

        // Get user options
        const targets = [];
        const options = interaction.data.options || [];

        for (const option of options) {
            if (option.type === 6) { // USER type
                targets.push(option.value); // User ID
            }
        }

        if (targets.length === 0) {
            return {
                type: 4,
                data: {
                    content: '⚠️ You must select at least one user.',
                    flags: 64
                }
            };
        }

        // Send DMs directly
        let success = 0;
        for (const userId of targets) {
            try {
                // Create DM channel
                const dmChannel = await rest.post(Routes.userChannels(), {
                    body: { recipient_id: userId }
                });

                const reminderMessage =
                    `📣 Hey! Don't forget to complete your daily donations today. The clan depends on you! 🙌\n` +
                    `📣 ¡Hola! No olvides completar tus donaciones diarias hoy. ¡El clan depende de ti! 🙌\n` +
                    `📣 嘿！今天不要忘记完成你的每日捐赠。公会需要你！🙌`;

                await rest.post(Routes.channelMessages(dmChannel.id), {
                    body: { content: reminderMessage }
                });

                success++;
            } catch (err) {
                console.error(`❌ Failed to DM user ${userId}:`, err);
            }
        }
        console.log(`Daily reminder sent to ${success}/${targets.length} users`);

        return {
            type: 4,
            data: {
                content: `✅ Daily reminders sent to ${success}/${targets.length} user(s).`,
                flags: 64
            }
        };
    }
};
