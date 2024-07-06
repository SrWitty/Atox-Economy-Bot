const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Investment = require('../../models/investment');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell your investments')
        .addStringOption(option =>
            option.setName('investment_type')
                .setDescription('Select the type of investment to sell')
                .setRequired(true)
                .addChoices(
                    { name: 'Stock', value: 'stock' },
                    { name: 'Bond', value: 'bond' },
                    { name: 'Real Estate', value: 'real_estate' }
                ))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount to sell')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('sell_all')
                .setDescription('Sell all investments of this type')
                .setRequired(false)), // New option to sell all investments
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const investmentType = interaction.options.getString('investment_type');
            const amountToSell = interaction.options.getInteger('amount');
            const sellAll = interaction.options.getBoolean('sell_all') || false;

            if (amountToSell <= 0 && !sellAll) {
                return interaction.reply({ content: 'Amount to sell must be greater than 0.', ephemeral: true });
            }

            let investments;
            if (sellAll) {
                investments = await Investment.find({ userId, type: investmentType });
            } else {
                investments = await Investment.find({ userId, type: investmentType }).limit(10); // Limit to 10 for demonstration
            }

            if (investments.length === 0) {
                return interaction.reply({ content: `You have no ${investmentType} investments to sell.`, ephemeral: true });
            }

            let totalAmount = 0;
            let remainingAmount = amountToSell;

            for (let i = 0; i < investments.length; i++) {
                const investment = investments[i];

                // Determine the increase percentage based on investment type
                let increasePercentage = 0;
                switch (investmentType) {
                    case 'stock':
                        increasePercentage = getRandomNumberInRange(100, 500); // Random number between 100 and 500
                        break;
                    case 'bond':
                        increasePercentage = getRandomNumberInRange(100, 300); // Random number between 100 and 300
                        break;
                    case 'real_estate':
                        increasePercentage = getRandomNumberInRange(200, 400); // Random number between 200 and 400
                        break;
                    default:
                        increasePercentage = 0;
                }

                // Calculate sell amount and update total amount received
                let sellAmount = 0;
                if (sellAll) {
                    sellAmount = investment.amount; // Sell all available amount
                } else {
                    sellAmount = Math.min(investment.amount, remainingAmount);
                }
                const baseAmount = sellAmount + investment.profit;
                const increasedAmount = baseAmount + (baseAmount * increasePercentage / 100);
                totalAmount += increasedAmount;

                // Update investment amount and profit
                investment.amount -= sellAmount;
                await investment.save();

                // Deduct remaining amount to sell
                remainingAmount -= sellAmount;

                // Stop if all requested amount is sold
                if (!sellAll && remainingAmount <= 0) {
                    break;
                }
            }

            // Update user balance
            const user = await User.findOne({ userId });
            if (!user) {
                return interaction.reply({ content: 'User not found.', ephemeral: true });
            }

            user.balance += totalAmount;
            await user.save();

            // Send success message with total amount received
            const successEmbed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Sell Successful')
                .setDescription(`You have successfully sold ${amountToSell} ${sellAll ? 'of all' : ''} your ${investmentType} investments.`)
                .addFields(
                    { name: 'Total Amount Received', value: `${totalAmount.toFixed(2)} coins` }
                )
                .setTimestamp()
                .setFooter('🎉'); // Add emoji here

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            }

        } catch (error) {
            console.error('Error during command execution:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Error')
                .setDescription('An error occurred while processing your sell request.');

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};

function getRandomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
