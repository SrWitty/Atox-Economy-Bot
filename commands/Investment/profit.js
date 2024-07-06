const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Investment = require('../../models/investment');
const User = require('../../models/user');
const config = require('../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profit')
        .setDescription('Show your total profit in the bot'),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            
           
            const user = await User.findOne({ userId });

            if (!user) {
                return interaction.reply({ content: 'User not found.', ephemeral: true });
            }

            
            const investments = await Investment.find({ userId });

            
            const totalProfit = investments.reduce((acc, investment) => acc + investment.profit, 0);
            const totalCoins = totalProfit * config.profitToCoins;

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Your Total Profit')
                .setDescription(`Your total profit is **${totalProfit}** 🏆 profits which equals to **${totalCoins}** 💰 coins.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error during command execution:', error);
            await interaction.reply({ content: 'An error occurred while fetching your profit.', ephemeral: true });
        }
    }
};
