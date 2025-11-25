// File: handlers/confirmButton.js
// Note: This handler is deprecated in serverless version
// Button confirmations are now handled directly in modal responses

async function handleDonationConfirmation(interaction) {
    // No longer used in serverless implementation
    // Donations are confirmed directly after modal submission
    return {
        type: 4,
        data: {
            content: '❌ This action is no longer supported.',
            flags: 64
        }
    };
}

module.exports = { handleDonationConfirmation };
