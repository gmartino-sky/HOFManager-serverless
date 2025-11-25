// File: commands/configRoles.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { saveGuildConfig } = require('../db/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config-roles')
        .setDescription('[Admin] Configure clan member and leader roles for the bot')
        .addRoleOption(option =>
            option.setName('member-role')
                .setDescription('Role for clan members who should receive notifications')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('leader-role')
                .setDescription('Role for clan leaders who can use admin commands')
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.member;

        // Check if user is administrator or has manage server permission
        const permissions = member.permissions ? BigInt(member.permissions) : BigInt(0);
        const ADMINISTRATOR = BigInt(0x8);
        const MANAGE_GUILD = BigInt(0x20);

        const hasAdminPermission = (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
            (permissions & MANAGE_GUILD) === MANAGE_GUILD;

        console.log(`User ${interaction.member.user.username} permissions: ${permissions.toString()} (Admin: ${hasAdminPermission})`);

        if (!hasAdminPermission) {
            return {
                type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
                data: {
                    content: `❌ You need **Administrator** or **Manage Server** permission to configure roles.\nYour permissions: \`${permissions.toString()}\``,
                    flags: 64 // Ephemeral
                }
            };
        }

        // Get roles from options
        const options = interaction.data.options || [];
        const memberRoleOption = options.find(opt => opt.name === 'member-role');
        const leaderRoleOption = options.find(opt => opt.name === 'leader-role');

        const memberRoleId = memberRoleOption?.value;
        const leaderRoleId = leaderRoleOption?.value;

        try {
            // Save to DynamoDB
            const userId = interaction.member ? interaction.member.user.id : interaction.user.id;

            await saveGuildConfig(interaction.guild_id, {
                memberRoleId,
                leaderRoleId,
                configuredBy: userId,
                configuredAt: new Date().toISOString()
            });

            return {
                type: 4,
                data: {
                    content: `✅ **Roles configured successfully!**\n\n` +
                        `👥 **Member Role:** <@&${memberRoleId}>\n` +
                        `👑 **Leader Role:** <@&${leaderRoleId}>\n\n` +
                        `Users with the Member role will receive daily donation reminders.\n` +
                        `Users with the Leader role can use admin commands like \`/daily\` and \`/report-week\`.`,
                    flags: 64
                }
            };
        } catch (error) {
            console.error('Error saving role configuration:', error);
            return {
                type: 4,
                data: {
                    content: '❌ Error saving role configuration. Please try again.',
                    flags: 64
                }
            };
        }
    }
};
