const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('🏆 Show the top 10 users with the highest coin balances'),

    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer the reply to avoid the "Unknown interaction" error

            const topUsers = await User.find().sort({ balance: -1 }).limit(10); // Retrieve top 10 users by balance
            const leaderboardEmbed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('🏆 Leaderboard - Top 10 Users by Coins');

            const fields = [];
            for (const user of topUsers) {
                const discordUser = await interaction.client.users.fetch(user.userId);
                fields.push({ 
                    name: `#${fields.length + 1}: ${discordUser.tag}`, 
                    value: `💰 Coins: ${user.balance}`, 
                    inline: true 
                });
            }

            leaderboardEmbed.addFields(fields);

            await interaction.editReply({ embeds: [leaderboardEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while fetching the leaderboard.');
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
