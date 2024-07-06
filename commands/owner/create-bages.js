const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Badge = require('../../models/badge');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-badge')
        .setDescription('Create a new badge for users')
        .addStringOption(option => option.setName('name').setDescription('The name of the badge').setRequired(true))
        .addStringOption(option => option.setName('emoji').setDescription('The emoji for the badge').setRequired(true)),

    async execute(interaction) {
        try {
            // Only allow specific users to use this command
            const allowedUsers = ['1091118468155314306', '246354195979042817'];
            const userId = interaction.user.id;
            if (!allowedUsers.includes(userId)) {
                return interaction.reply('You are not authorized to use this command.');
            }

            const name = interaction.options.getString('name');
            const emoji = interaction.options.getString('emoji');

            const existingBadge = await Badge.findOne({ name });
            if (existingBadge) {
                return interaction.reply({ content: 'A badge with this name already exists.', ephemeral: true });
            }

            const newBadge = new Badge({
                name,
                emoji
            });
            await newBadge.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Badge Created ✨')
                .setDescription(`A new badge named "${name}" has been created with the emoji ${emoji}.`);

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while creating the badge.', ephemeral: true });
        }
    }
};
