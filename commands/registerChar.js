// File: commands/registerChar.js

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register-char')
        .setDescription('Register a character (main or alt) with clan assignment'),

    async execute(interaction) {
        // Return modal as HTTP response
        return {
            type: 9, // MODAL
            data: {
                custom_id: `register_char_modal_${interaction.user.id}`,
                title: 'Register Character',
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
                                placeholder: 'Enter character name'
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: 'character_type',
                                label: 'Character Type (main or alt)',
                                style: 1,
                                required: true,
                                placeholder: 'main or alt'
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                custom_id: 'character_clan',
                                label: 'Clan Name',
                                style: 1,
                                required: true,
                                placeholder: 'Enter clan name'
                            }
                        ]
                    }
                ]
            }
        };
    }
};
