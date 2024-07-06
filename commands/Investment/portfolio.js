const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Investment = require('../../models/investment');
const User = require('../../models/user');
const Company = require('../../models/company'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('View your investment portfolio')
        .addStringOption(option =>
            option.setName('investment_type')
                .setDescription('Select the type of investment portfolio to view')
                .setRequired(true)
                .addChoices(
                    { name: 'Stock', value: 'stock' },
                    { name: 'Bond', value: 'bond' },
                    { name: 'Real Estate', value: 'real_estate' }
                )),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const investmentType = interaction.options.getString('investment_type');

            const investments = await Investment.find({ userId, type: investmentType });

            if (investments.length === 0) {
                return interaction.reply({ content: `You have no ${investmentType} investments.`, ephemeral: true });
            }

            let totalAmount = 0;
            const investmentDetails = [];
            
            
            for (const investment of investments) {
                const company = await Company.findById(investment.companyId);
                if (company) {
                    const profit = investment.profit || 0;
                    totalAmount += investment.amount + profit;
                    investmentDetails.push(`${investment.amount} coins in ${company.name} (Profit: ${profit} coins)`);
                }
            }

            const user = await User.findOne({ userId });

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle(`${investmentType} Portfolio`)
                .setDescription(`Your ${investmentType} investments:`)
                .addFields(
                    { name: 'Investment Details', value: investmentDetails.join('\n') },
                    { name: 'Total Investment Value', value: `${totalAmount} coins` },
                    { name: 'Coins Balance bot ', value: `${user.balance} coins` }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Error during command execution:', error);
            await interaction.reply({ content: 'An error occurred while fetching your investment portfolio.', ephemeral: true });
        }
    }
};
