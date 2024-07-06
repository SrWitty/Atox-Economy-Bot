const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Profile = require('../../models/profile');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-desc')
        .setDescription('📜 Set your profile description')
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Your profile description')
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const description = interaction.options.getString('description');

        try {
            const profile = await Profile.findOneAndUpdate(
                { userId },
                { description },
                { new: true, upsert: true }
            );

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription(`✅ Your profile description has been updated to: ${description}`);

            interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error setting profile description:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ There was an error while updating your profile description.');

            interaction.reply({ embeds: [errorEmbed] });
        }
    },
};
