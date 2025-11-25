// File: db/config.js

const { docClient, GetCommand, PutCommand, TABLES } = require('./database');

/**
 * Get guild configuration (roles, etc.)
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object|null>} Config object or null if not found
 */
async function getGuildConfig(guildId) {
    try {
        const command = new GetCommand({
            TableName: process.env.DYNAMODB_CONFIG_TABLE || 'hofmanager-bot-config-dev',
            Key: { guildId }
        });

        const response = await docClient.send(command);
        return response.Item || null;
    } catch (error) {
        console.error(`Error getting guild config for ${guildId}:`, error);
        throw error;
    }
}

/**
 * Save or update guild configuration
 * @param {string} guildId - Discord guild ID
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function saveGuildConfig(guildId, config) {
    try {
        const item = {
            guildId,
            ...config,
            updatedAt: new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: process.env.DYNAMODB_CONFIG_TABLE || 'hofmanager-bot-config-dev',
            Item: item
        });

        await docClient.send(command);
    } catch (error) {
        console.error(`Error saving guild config for ${guildId}:`, error);
        throw error;
    }
}

/**
 * Get role IDs for a guild (member and leader roles)
 * Falls back to environment variables if not in DB
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Object>} { memberRoleId, leaderRoleId }
 */
async function getGuildRoles(guildId) {
    const config = await getGuildConfig(guildId);

    return {
        memberRoleId: config?.memberRoleId || process.env.CLAN_MEMBER_ROLE_ID || null,
        leaderRoleId: config?.leaderRoleId || process.env.CLAN_LEADER_ROLE_ID || null
    };
}

module.exports = {
    getGuildConfig,
    saveGuildConfig,
    getGuildRoles
};
