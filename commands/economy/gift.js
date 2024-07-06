const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('🎁 Gift coins to another user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to gift coins to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of coins to gift')
                .setRequired(true)),

    async execute(interaction) {
        const giverId = interaction.user.id;
        const giverName = interaction.user.username;
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: 'The gift amount must be greater than zero.', ephemeral: true });
        }

        if (target.id === giverId) {
            return interaction.reply({ content: 'You cannot gift coins to yourself.', ephemeral: true });
        }

        try {
            const giver = await User.findOne({ userId: giverId });
            const receiver = await User.findOneAndUpdate(
                { userId: target.id },
                { $inc: { balance: amount - Math.ceil(amount * 0.05) } }, 
                { upsert: true, new: true } 
            );

            if (!giver || giver.balance < amount) {
                return interaction.reply({ content: 'You do not have enough coins to gift.', ephemeral: true });
            }

            const tax = Math.ceil(amount * 0.05);
            const netAmount = amount - tax;

            // Ensure exact net amount is deducted from giver's balance
            if (giver.balance < netAmount) {
                return interaction.reply({ content: 'You do not have enough coins to gift that amount.', ephemeral: true });
            }

            giver.balance -= netAmount;

            await Promise.all([giver.save()]);

            const giftEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎁 Gift Received')
                .setDescription(`${target.username}, you have received a gift of ${netAmount} coins from ${giverName}.`);

            await target.send({ embeds: [giftEmbed] });

            const responseEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎁 Gift Successful')
                .setDescription(`You have successfully gifted ${netAmount} coins to ${target.username} after applying a tax of ${tax} coins.`);

            interaction.reply({ embeds: [responseEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error processing gift:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while processing your gift.');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
