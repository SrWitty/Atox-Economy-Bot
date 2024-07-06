const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/user');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-coins')
        .setDescription('💰 Add coins to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to add coins to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of coins to add')
                .setRequired(true)),
    async execute(interaction) {
        try {
            // Only allow specific users to use this command
            const allowedUsers = ['1091118468155314306', '246354195979042817'];
            const userId = interaction.user.id;
            if (!allowedUsers.includes(userId)) {
                return interaction.reply('You are not authorized to use this command.');
            }

            const userToAddId = interaction.options.getUser('user').id;
            const amount = interaction.options.getInteger('amount');

            let user = await User.findOne({ userId: userToAddId });
            if (!user) {
                user = new User({ userId: userToAddId, balance: amount });
            } else {
                user.balance += amount;
            }
            await user.save();

            const replyEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('Coins Added')
                .setDescription(`💰 Added ${amount} coins to <@${userToAddId}>.`);
            return interaction.reply({ embeds: [replyEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply('There was an error while adding coins.');
        }
    },
};
