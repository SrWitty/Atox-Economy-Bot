const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Investment = require('../../models/investment');
const User = require('../../models/user');
const config = require('../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Convert your profits to coins')
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount of profits to convert')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const amount = interaction.options.getNumber('amount');

            // Fetch the user
            const user = await User.findOne({ userId });

            if (!user) {
                return interaction.reply({ content: 'User not found.', ephemeral: true });
            }

            // Fetch all investments by the user
            const investments = await Investment.find({ userId });

            // Calculate the total profit
            const totalProfit = investments.reduce((acc, investment) => acc + investment.profit, 0);

            if (amount > totalProfit) {
                return interaction.reply({ content: `You do not have enough profits to convert. You currently have ${totalProfit} 🏆 profits.`, ephemeral: true });
            }

            // Calculate the coins and update user's profits and balance
            const totalCoins = amount * config.profitToCoins;
            user.balance += totalCoins;

            // Update the profits
            let remainingAmount = amount;
            for (let investment of investments) {
                if (remainingAmount <= 0) break;
                if (investment.profit >= remainingAmount) {
                    investment.profit -= remainingAmount;
                    remainingAmount = 0;
                } else {
                    remainingAmount -= investment.profit;
                    investment.profit = 0;
                }
                await investment.save();
            }

            await user.save();

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Conversion Successful')
                .setDescription(`You have successfully converted ${amount} 🏆 profits to ${totalCoins} 💰 coins.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error during command execution:', error);
            await interaction.reply({ content: 'An error occurred while converting your profits.', ephemeral: true });
        }
    }
};
