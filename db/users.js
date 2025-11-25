// File: db/users.js

const { docClient, GetCommand, PutCommand, QueryCommand, TABLES } = require('./database');

/**
 * Get all characters for a specific Discord user in a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<Array>} Array of character objects
 */
async function getUserCharacters(guildId, discordUserId) {
    try {
        const command = new GetCommand({
            TableName: TABLES.USERS,
            Key: {
                guildId,
                userId: discordUserId
            }
        });

        const response = await docClient.send(command);

        if (!response.Item) {
            return [];
        }

        return response.Item.characters || [];
    } catch (error) {
        console.error('Error getting user characters for ' + discordUserId + ' in guild ' + guildId + ': ', error);
        throw error;
    }
}

/**
 * Get a specific user's data in a guild
 * @param {string} guildId - Discord guild ID
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUser(guildId, discordUserId) {
    try {
        const command = new GetCommand({
            TableName: TABLES.USERS,
            Key: {
                guildId,
                userId: discordUserId
            }
        });

        const response = await docClient.send(command);
        return response.Item || null;
    } catch (error) {
        console.error('Error getting user ' + discordUserId + ' in guild ' + guildId + ': ', error);
        throw error;
    }
}

/**
 * Save or update a user's data in a guild
 * @param {string} guildId - Discord guild ID
 * @param {string} discordUserId - Discord user ID
 * @param {Object} userData - User data to save
 * @returns {Promise<void>}
 */
async function saveUser(guildId, discordUserId, userData) {
    try {
        const item = {
            guildId,
            userId: discordUserId,
            discord_username: userData.discord_username,
            characters: userData.characters || [],
            updatedAt: new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: TABLES.USERS,
            Item: item
        });

        await docClient.send(command);
    } catch (error) {
        console.error('Error saving user ' + discordUserId + ' in guild ' + guildId + ': ', error);
        throw error;
    }
}

/**
 * Get all users with their main characters in a specific guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Array>} Array of main character objects
 */
async function getMainCharacters(guildId) {
    try {
        const command = new QueryCommand({
            TableName: TABLES.USERS,
            KeyConditionExpression: 'guildId = :guildId',
            ExpressionAttributeValues: {
                ':guildId': guildId
            }
        });

        const response = await docClient.send(command);
        const users = response.Items || [];

        const mainCharacters = [];

        for (const user of users) {
            if (user.characters) {
                const main = user.characters.find(c => c.type === 'main');
                if (main) {
                    mainCharacters.push({
                        discord_user_id: user.userId,
                        discord_username: user.discord_username,
                        name: main.name,
                        clan: main.clan
                    });
                }
            }
        }

        return mainCharacters;
    } catch (error) {
        console.error('Error getting main characters for guild ' + guildId + ': ', error);
        throw error;
    }
}

/**
 * Get all users from a specific guild
 * @param {string} guildId - Discord guild ID
 * @returns {Promise<Array>} Array of all users in the guild
 */
async function getAllUsers(guildId) {
    try {
        const command = new QueryCommand({
            TableName: TABLES.USERS,
            KeyConditionExpression: 'guildId = :guildId',
            ExpressionAttributeValues: {
                ':guildId': guildId
            }
        });

        const response = await docClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error('Error getting all users for guild ' + guildId + ': ', error);
        throw error;
    }
}

/**
 * Add a character to a user in a specific guild
 * @param {string} guildId - Discord guild ID
 * @param {string} discordUserId - Discord user ID
 * @param {string} discordUsername - Discord username
 * @param {Object} character - Character object { name, type, clan }
 * @returns {Promise<void>}
 */
async function addCharacter(guildId, discordUserId, discordUsername, character) {
    try {
        // Get existing user data
        const user = await getUser(guildId, discordUserId);

        const characters = user ? (user.characters || []) : [];

        // Check if character already exists
        const existingIndex = characters.findIndex(c => c.name === character.name);

        if (existingIndex >= 0) {
            // Update existing character
            characters[existingIndex] = character;
        } else {
            // Add new character
            characters.push(character);
        }

        // Save updated user
        await saveUser(guildId, discordUserId, {
            discord_username: discordUsername,
            characters
        });
    } catch (error) {
        console.error('Error adding character for ' + discordUserId + ' in guild ' + guildId + ': ', error);
        throw error;
    }
}

/**
 * Get all users across all guilds
 * @returns {Promise<Array>} Array of all users from all guilds
 */
async function getAllUsersAcrossGuilds() {
    try {
        const command = new ScanCommand({
            TableName: TABLES.USERS
        });

        const response = await docClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error('Error getting all users across guilds: ', error);
        throw error;
    }
}

module.exports = {
    getUserCharacters,
    getUser,
    saveUser,
    getMainCharacters,
    getAllUsers,
    getAllUsersAcrossGuilds,
    addCharacter
};
