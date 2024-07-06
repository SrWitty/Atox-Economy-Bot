const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../../models/user');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-coins')
        .setDescription('💰 Remove coins from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove coins from')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of coins to remove')
                .setRequired(true)),
    async execute(interaction) {
        try {
            // Only allow specific users to use this command
            const allowedUsers = ['1091118468155314306', '246354195979042817'];
            const userId = interaction.user.id;
            if (!allowedUsers.includes(userId)) {
                return interaction.reply('You are not authorized to use this command.');
            }

            const userToRemoveId = interaction.options.getUser('user').id;
            const amount = interaction.options.getInteger('amount');

            let user = await User.findOne({ userId: userToRemoveId });
            if (!user || user.balance < amount) {
                return interaction.reply('The specified user does not have enough coins.');
            }

            user.balance -= amount;
            await user.save();

            const replyEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Coins Removed')
                .setDescription(`💰 Removed ${amount} coins from <@${userToRemoveId}>.`);
            return interaction.reply({ embeds: [replyEmbed] });
        } catch (error) {
            console.error(error);
            return interaction.reply('There was an error while removing coins.');
        }
    },
};
