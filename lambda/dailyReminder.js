// File: lambda/dailyReminder.js

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { getAllUsersAcrossGuilds } = require('../db/users');
const { getDonationsByUserAndWeek } = require('../db/donations');
const { getGuildRoles } = require('../db/config');
const { getCurrentWeekLabel } = require('../utils/dateUtils');

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

/**
 * Get all guild members who have a specific role
 * @param {string} guildId - Discord guild ID
 * @param {string} roleId - Discord role ID
 * @returns {Promise<Set<string>>} Set of user IDs with the role
 */
async function getGuildMembersWithRole(guildId, roleId) {
    try {
        console.log(`Fetching members with role ${roleId} from guild ${guildId}`);

        // Fetch guild members (max 1000 per request)
        const members = await rest.get(Routes.guildMembers(guildId), {
            query: new URLSearchParams({ limit: '1000' })
        });

        console.log(`Total members fetched: ${members.length}`);

        // Filter members who have the specific role
        const membersWithRole = new Set();
        for (const member of members) {
            if (member.roles.includes(roleId)) {
                membersWithRole.add(member.user.id);
            }
        }

        console.log(`Members with role ${roleId}: ${membersWithRole.size}`);
        return membersWithRole;

    } catch (error) {
        console.error(`Error fetching guild members with role:`, error);
        // Return empty set on error to avoid breaking the reminder flow
        return new Set();
    }
}

/**
 * Lambda handler for daily reminder cron job
 * Runs at 03:00 UTC (00:00 GMT-2)
 * Sends reminders to users across ALL guilds
 */
exports.handler = async (event) => {
    console.log('Starting daily reminder job...');

    try {
        const currentWeek = getCurrentWeekLabel();
        console.log(`Current week: ${currentWeek}`);

        // Get all users from ALL guilds
        const allUsers = await getAllUsersAcrossGuilds();
        console.log(`Found ${allUsers.length} users across all guilds`);

        // Group users by guild to minimize API calls
        const usersByGuild = {};
        for (const user of allUsers) {
            if (!usersByGuild[user.guildId]) {
                usersByGuild[user.guildId] = [];
            }
            usersByGuild[user.guildId].push(user);
        }

        console.log(`Processing ${Object.keys(usersByGuild).length} guilds`);

        let totalSent = 0;
        let totalErrors = 0;
        let totalSkippedNoRole = 0;

        // Process each guild
        for (const [guildId, guildUsers] of Object.entries(usersByGuild)) {
            console.log(`\n=== Processing guild ${guildId} with ${guildUsers.length} users ===`);

            try {
                // Get role configuration for this guild
                const { memberRoleId } = await getGuildRoles(guildId);

                let membersWithRole = null;

                if (memberRoleId) {
                    console.log(`Role-based filtering enabled for guild ${guildId} with role: ${memberRoleId}`);
                    membersWithRole = await getGuildMembersWithRole(guildId, memberRoleId);
                } else {
                    console.log(`Role-based filtering disabled for guild ${guildId} (no member role configured)`);
                }

                let sentCount = 0;
                let errorCount = 0;
                let skippedNoRole = 0;

                // Process each user in this guild
                for (const user of guildUsers) {
                    try {
                        // Check if role filtering is enabled and user has the required role
                        if (memberRoleId && membersWithRole && !membersWithRole.has(user.userId)) {
                            console.log(`User ${user.userId} doesn't have required role in guild ${guildId}, skipping...`);
                            skippedNoRole++;
                            continue;
                        }

                        // Check if user has a main character
                        const mainChar = user.characters?.find(c => c.type === 'main');

                        if (!mainChar) {
                            console.log(`User ${user.userId} has no main character, skipping...`);
                            continue;
                        }

                        // Check if user has donated this week
                        const donations = await getDonationsByUserAndWeek(guildId, user.userId, currentWeek);

                        if (donations && donations.length > 0) {
                            console.log(`User ${user.userId} already donated this week in guild ${guildId}, skipping...`);
                            continue;
                        }

                        // User hasn't donated, send reminder
                        await sendReminderDM(user.userId, user.discord_username, mainChar.name);
                        sentCount++;

                        // Add small delay to avoid rate limiting
                        await sleep(100);

                    } catch (error) {
                        console.error(`Error processing user ${user.userId} in guild ${guildId}:`, error);
                        errorCount++;
                    }
                }

                console.log(`Guild ${guildId} completed. Sent: ${sentCount}, Errors: ${errorCount}, Skipped (no role): ${skippedNoRole}`);

                totalSent += sentCount;
                totalErrors += errorCount;
                totalSkippedNoRole += skippedNoRole;

            } catch (error) {
                console.error(`Error processing guild ${guildId}:`, error);
                totalErrors++;
            }
        }

        console.log(`\n=== Daily reminder job completed ===`);
        console.log(`Total sent: ${totalSent}, Total errors: ${totalErrors}, Total skipped (no role): ${totalSkippedNoRole}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                totalSent,
                totalErrors,
                totalSkippedNoRole,
                totalUsers: allUsers.length,
                guildsProcessed: Object.keys(usersByGuild).length
            })
        };

    } catch (error) {
        console.error('Error in daily reminder job:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

/**
 * Send reminder DM to a user
 */
async function sendReminderDM(userId, username, mainCharName) {
    try {
        // Create DM channel
        const dmChannel = await rest.post(Routes.userChannels(), {
            body: {
                recipient_id: userId
            }
        });

        // Multilingual reminder message
        const message = `
🔔 **Daily Donation Reminder / Recordatorio Diario / 每日捐赠提醒**

---

🇬🇧 **English**:
Hello **${username}**! 👋

Your main character **${mainCharName}** has not donated yet this week. Please remember to make your weekly donation to support the clan! 💰

Use \`/donation\` to register your donation.

---

🇪🇸 **Español Latino**:
¡Hola **${username}**! 👋

Tu personaje principal **${mainCharName}** aún no ha donado esta semana. ¡Por favor recuerda hacer tu donación semanal para apoyar al clan! 💰

Usa \`/donation\` para registrar tu donación.

---

🇨🇳 **简体中文**:
你好 **${username}**！👋

你的主角色 **${mainCharName}** 本周还没有捐赠。请记得进行每周捐赠以支持官民！💰

使用 \`/donation\` 来记录你的捐赠。

---

_This is an automated reminder sent at 00:00 GMT-2._
        `.trim();

        // Send message
        await rest.post(Routes.channelMessages(dmChannel.id), {
            body: {
                content: message
            }
        });

        console.log(`Reminder sent to user ${userId} (${username})`);

    } catch (error) {
        console.error(`Failed to send DM to user ${userId}:`, error);
        throw error;
    }
}

/**
 * Sleep utility function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
