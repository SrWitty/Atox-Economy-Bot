const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Badge = require('../../models/badge');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-badge')
        .setDescription('Give a badge to a user')
        .addUserOption(option => option.setName('user').setDescription('The user to give the badge to').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('The name of the badge to give').setRequired(true)),

    async execute(interaction) {
        try {
            // Only allow specific users to use this command
            const allowedUsers = ['1091118468155314306', '246354195979042817'];
            const userId = interaction.user.id;
            if (!allowedUsers.includes(userId)) {
                return interaction.reply('You are not authorized to use this command.');
            }

            // Get input from interaction
            const targetUser = interaction.options.getMember('user');
            const name = interaction.options.getString('name');

            // Ensure that targetUser is a GuildMember
            if (!targetUser) {
                return interaction.reply({ content: 'User not found or invalid.', ephemeral: true });
            }

            // Find the badge by name
            const badge = await Badge.findOne({ name });
            if (!badge) {
                return interaction.reply({ content: `Badge "${name}" not found.`, ephemeral: true });
            }

            // Check if the badge has a valid emoji
            if (!badge.emoji) {
                return interaction.reply({ content: `Badge "${name}" does not have a valid emoji.`, ephemeral: true });
            }

            // Update the user's role and badges in the database
            const updatedUser = await User.findOneAndUpdate(
                { userId: targetUser.id },
                { $set: { role: name }, $addToSet: { badges: name } },
                { new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Badge Given ✨')
                .setDescription(`Badge "${name}" has been given to ${targetUser.toString()}.`)
                .setTimestamp();

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while giving the badge.', ephemeral: true });
        }
    }
};
