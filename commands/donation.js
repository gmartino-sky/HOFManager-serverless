// File: commands/donation.js

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donation')
        .setDescription('Register a donation for your character'),

    async execute(interaction) {
        // Return modal as HTTP response
        return {
            type: 9, // MODAL
            data: {
                custom_id: `donation_modal_${interaction.user.id}`,
                title: 'Register Donation',
                components: [
                    {
                        type: 1, // ACTION_ROW
                        components: [
                            {
                                type: 4, // TEXT_INPUT
                                custom_id: 'character_name',
                                label: 'Character Name',
                                style: 1, // SHORT
                                required: true,
                                placeholder: 'Enter your character name'
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: 'clan_name',
                                label: 'Clan Name',
                                style: 1,
                                required: true,
                                placeholder: 'Enter clan name'
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: 'donation_method',
                                label: 'Donation Method (direct or market)',
                                style: 1,
                                required: true,
                                placeholder: 'direct or market'
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: 'donation_date',
                                label: 'Donation Date (YYYY-MM-DD)',
                                style: 1,
                                required: true,
                                placeholder: 'YYYY-MM-DD'
                            }
                        ]
                    }
                ]
            }
        };
    }
};
