// invest.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Company = require('../../models/company');
const Investment = require('../../models/investment');
const User = require('../../models/user');
const config = require('../../config/config');

// Constants for profit levels
const MIN_INVESTMENT_FOR_HIGH_PROFIT = 400; 
const HIGH_PROFIT_RATE = 5.2;
const LOW_PROFIT_RATE = 1.2; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invest')
        .setDescription('Invest in a company')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of investment (stock, bond, real estate)')
                .setRequired(true)
                .addChoices(
                    { name: 'Stock', value: 'stock' },
                    { name: 'Bond', value: 'bond' },
                    { name: 'Real Estate', value: 'real_estate' }
                ))
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('The amount to invest')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const amount = interaction.options.getNumber('amount');
            const type = interaction.options.getString('type');

            // Fetch available companies
            const companies = await Company.find({});

            if (companies.length === 0) {
                return interaction.reply({ content: 'No companies available for investment.', ephemeral: true });
            }

            const companyOptions = companies.map(company => ({
                label: `${company.name}`,
                value: company.name
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_company')
                .setPlaceholder('Select a company to invest in')
                .addOptions(companyOptions);

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Investment Options')
                .setDescription('Select a company to invest in from the menu below.')
                .addFields({ name: 'Investment Type', value: type })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

            const filter = i => i.customId === 'select_company' && i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                const companyName = i.values[0];
                const user = await User.findOne({ userId });

                const companyConfig = config.companies.find(c => c.name === companyName);

                if (!user || user.balance < companyConfig.price) {
                    return i.update({ content: `You do not have enough balance to invest in ${companyName}. You need ${companyConfig.price} coins but you only have ${user.balance} coins.`, components: [], ephemeral: true });
                }

                const company = await Company.findOne({ name: companyName });
                if (!company) {
                    return i.update({ content: 'Company not found.', components: [], ephemeral: true });
                }

                // Calculate profit based on investment type and amount
                let profit = calculateProfit(amount);

                const newInvestment = new Investment({
                    userId,
                    companyId: company._id,
                    amount,
                    type,
                    profit
                });

                await newInvestment.save();

                user.balance -= companyConfig.price; // Deduct the actual price from user balance
                await user.save();

                const successEmbed = new EmbedBuilder()
                    .setColor(0x00AE86)
                    .setTitle('Investment Successful')
                    .setDescription(`You have successfully invested ${companyConfig.price} coins in ${company.name}.`)
                    .addFields(
                        { name: 'Investment Type', value: type },
                        { name: 'Investment Amount', value: `${companyConfig.price} coins` },
                        { name: 'Profit', value: `${profit} coins` }
                    )
                    .setTimestamp();

                return i.update({ embeds: [successEmbed], components: [], ephemeral: true });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'You did not select any company in time.', components: [], ephemeral: true });
                }
            });

        } catch (error) {
            console.error('Error during command execution:', error);
            await interaction.reply({ content: 'An error occurred while processing your investment.', ephemeral: true });
        }
    }
};

function calculateProfit(amount) {
    if (amount <= MIN_INVESTMENT_FOR_HIGH_PROFIT) {
        return amount * LOW_PROFIT_RATE; 
    } else {
        return amount * HIGH_PROFIT_RATE; 
    }
}
