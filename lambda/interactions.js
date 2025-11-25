// File: lambda/interactions.js

const { verifyKey } = require('discord-interactions');

// Import command handlers
const donationCommand = require('../commands/donation');
const historyUserCommand = require('../commands/historyUser');
const dailyCommand = require('../commands/daily');
const weekReportCommand = require('../commands/weekReport');
const registerCharCommand = require('../commands/registerChar');
const configRolesCommand = require('../commands/configRoles');

// Import interaction handlers
const { handleDonationModal } = require('../handlers/confirmDonation');
const { handleRegisterCharModal } = require('../handlers/confirmRegisterChar');
const { handleDonationConfirmation } = require('../handlers/confirmButton');
const { handleExportCsv } = require('../handlers/exportCsv');

/**
 * Main Lambda handler for Discord Interactions
 */
exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        // Verify Discord signature
        const signature = event.headers['x-signature-ed25519'];
        const timestamp = event.headers['x-signature-timestamp'];
        const body = event.body;

        const isValidRequest = await verifyKey(
            body,
            signature,
            timestamp,
            process.env.DISCORD_PUBLIC_KEY
        );

        if (!isValidRequest) {
            console.error('Invalid request signature');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid request signature' })
            };
        }

        const interaction = JSON.parse(body);
        console.log('Interaction type:', interaction.type);

        // Type 1: PING - Discord verification
        if (interaction.type === 1) {
            console.log('Responding to PING');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 1 })
            };
        }

        // Type 2: APPLICATION_COMMAND - Slash commands
        if (interaction.type === 2) {
            console.log('Handling command:', interaction.data.name);
            return await handleCommand(interaction);
        }

        // Type 3: MESSAGE_COMPONENT - Button clicks
        if (interaction.type === 3) {
            console.log('Handling button:', interaction.data.custom_id);
            return await handleButton(interaction);
        }

        // Type 5: MODAL_SUBMIT - Modal submissions
        if (interaction.type === 5) {
            console.log('Handling modal:', interaction.data.custom_id);
            return await handleModal(interaction);
        }

        console.warn('Unknown interaction type:', interaction.type);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Unknown interaction type' })
        };

    } catch (error) {
        console.error('Error handling interaction:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 4,
                data: {
                    content: '❌ An error occurred while processing your request.',
                    flags: 64 // Ephemeral
                }
            })
        };
    }
};

/**
 * Handle slash commands
 */
async function handleCommand(interaction) {
    const commandName = interaction.data.name;

    try {
        let response;

        switch (commandName) {
            case 'donation':
                response = await donationCommand.execute(interaction);
                break;
            case 'history-user':
                response = await historyUserCommand.execute(interaction);
                break;
            case 'daily':
                response = await dailyCommand.execute(interaction);
                break;
            case 'report-week':
                response = await weekReportCommand.execute(interaction);
                break;
            case 'register-char':
                response = await registerCharCommand.execute(interaction);
                break;
            case 'config-roles':
                response = await configRolesCommand.execute(interaction);
                break;
            default:
                response = {
                    type: 4,
                    data: {
                        content: '❌ Unknown command',
                        flags: 64
                    }
                };
        }



        // If response is null, the command handled the response itself (e.g. via REST API)
        if (!response) {
            return {
                statusCode: 200,
                body: JSON.stringify({ type: 1 }) // Return PONG or empty to satisfy API Gateway
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 4,
                data: {
                    content: '❌ Error executing command',
                    flags: 64
                }
            })
        };
    }
}

/**
 * Handle button interactions
 */
async function handleButton(interaction) {
    const customId = interaction.data.custom_id;

    try {
        let response;

        if (customId.startsWith('confirm_donation_')) {
            response = await handleDonationConfirmation(interaction);
        } else if (customId === 'export_csv') {
            response = await handleExportCsv(interaction);
        } else {
            response = {
                type: 4,
                data: {
                    content: '❌ Unknown button action',
                    flags: 64
                }
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error(`Error handling button ${customId}:`, error);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 4,
                data: {
                    content: '❌ Error handling button interaction',
                    flags: 64
                }
            })
        };
    }
}

/**
 * Handle modal submissions
 */
async function handleModal(interaction) {
    const customId = interaction.data.custom_id;

    try {
        let response;

        if (customId.startsWith('donation_modal_')) {
            response = await handleDonationModal(interaction);
        } else if (customId.startsWith('register_char_modal_')) {
            response = await handleRegisterCharModal(interaction);
        } else {
            response = {
                type: 4,
                data: {
                    content: '❌ Unknown modal submission',
                    flags: 64
                }
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error(`Error handling modal ${customId}:`, error);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 4,
                data: {
                    content: '❌ Error handling modal submission',
                    flags: 64
                }
            })
        };
    }
}
