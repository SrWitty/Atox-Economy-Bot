const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Company = require('../../models/company');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-company')
        .setDescription('Add a new company to the investment system')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('The name of the company')
                .setRequired(true)),
    async execute(interaction) {
        // Only allow specific users to use this command
        const allowedUsers = ['1091118468155314306', '246354195979042817'];
        const userId = interaction.user.id;
        if (!allowedUsers.includes(userId)) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
        }

        const name = interaction.options.getString('name');

        try {
            const existingCompany = await Company.findOne({ name });
            if (existingCompany) {
                return interaction.reply({ content: 'A company with this name already exists.', ephemeral: true });
            }

            const newCompany = new Company({
                name
            });

            await newCompany.save();

            const embed = new EmbedBuilder()
                .setColor(0x00AE86)
                .setTitle('Company Added')
                .setDescription(`The company **${name}** has been successfully added.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error adding company:', error);
            return interaction.reply({ content: 'An error occurred while adding the company.', ephemeral: true });
        }
    }
};
