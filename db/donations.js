// File: db/donations.js

const { docClient, PutCommand, GetCommand, QueryCommand, ScanCommand, TABLES } = require('./database');
const { v4: uuidv4 } = require('crypto');

/**
 * Generate a simple UUID-like ID
 * @returns {string} UUID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a new donation to DynamoDB
 * @param {Object} donation - Donation object
 * @returns {Promise<Object>} Created donation with ID
 */
async function addDonation(donation) {
    try {
        const donationId = generateId();

        const item = {
            donationId,
            userId: donation.discord_user_id,
            discord_username: donation.discord_username,
            character_name: donation.character_name,
            donation_type: donation.donation_type,
            clan: donation.clan,
            date: donation.date, // Format: YYYY-MM-DD
            week: donation.week, // Format: "Week ending DD - Month"
            createdAt: new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: TABLES.DONATIONS,
            Item: item
        });

        await docClient.send(command);

        return item;
    } catch (error) {
        console.error('Error adding donation:', error);
        throw error;
    }
}

/**
 * Get all donations for a specific user
 * @param {string} discordUserId - Discord user ID
 * @returns {Promise<Array>} Array of donations
 */
async function getDonationsByUser(discordUserId) {
    try {
        const command = new QueryCommand({
            TableName: TABLES.DONATIONS,
            IndexName: 'userId-date-index',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': discordUserId
            },
            ScanIndexForward: false // Sort by date descending
        });

        const response = await docClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error(`Error getting donations for user ${discordUserId}:`, error);
        throw error;
    }
}

/**
 * Get all donations for a specific week
 * @param {string} week - Week identifier (e.g., "Week ending 26 - April")
 * @returns {Promise<Array>} Array of donations
 */
async function getDonationsByWeek(week) {
    try {
        const command = new ScanCommand({
            TableName: TABLES.DONATIONS,
            FilterExpression: 'week = :week',
            ExpressionAttributeValues: {
                ':week': week
            }
        });

        const response = await docClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error(`Error getting donations for week ${week}:`, error);
        throw error;
    }
}

/**
 * Get donations for a user in a specific week
 * @param {string} discordUserId - Discord user ID
 * @param {string} week - Week identifier
 * @returns {Promise<Array>} Array of donations
 */
async function getDonationsByUserAndWeek(discordUserId, week) {
    try {
        const command = new QueryCommand({
            TableName: TABLES.DONATIONS,
            IndexName: 'userId-date-index',
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'week = :week',
            ExpressionAttributeValues: {
                ':userId': discordUserId,
                ':week': week
            }
        });

        const response = await docClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error(`Error getting donations for user ${discordUserId} and week ${week}:`, error);
        throw error;
    }
}

/**
 * Get all donations
 * @returns {Promise<Array>} Array of all donations
 */
async function getAllDonations() {
    try {
        const command = new ScanCommand({
            TableName: TABLES.DONATIONS
        });

        const response = await docClient.send(command);
        return response.Items || [];
    } catch (error) {
        console.error('Error getting all donations:', error);
        throw error;
    }
}

module.exports = {
    addDonation,
    getDonationsByUser,
    getDonationsByWeek,
    getDonationsByUserAndWeek,
    getAllDonations
};
