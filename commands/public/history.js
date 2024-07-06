const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder instead of EmbedBuilder
const Transfer = require('../../models/transfer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer-history')
        .setDescription('Show transfer history'),

    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            // Find transfer history for the user, limiting to 10 entries
            const transferHistory = await Transfer.find({ $or: [{ senderId: userId }, { recipientId: userId }] })
                .sort({ createdAt: -1 })
                .limit(30);

            if (transferHistory.length === 0) {
                return interaction.reply('No transfer history found.');
            }

            const historyEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💸 Transfer History')
                .setDescription('Here is your recent transfer history:');

            transferHistory.forEach(transfer => {
                const isSent = transfer.senderId === userId;
                const transferType = isSent ? '💸 Sent' : '💰 Received'; // Adding emojis
                const transferAmount = isSent ? -transfer.amount : transfer.amount;

                historyEmbed.addFields({
                    name: `${transferType} ${transferAmount} coins`,
                    value: `To/From: <@${isSent ? transfer.recipientId : transfer.senderId}>`
                });
            });

            interaction.reply({ embeds: [historyEmbed] });
        } catch (error) {
            console.error('Error fetching transfer history:', error);
            return interaction.reply('There was an error while fetching transfer history.');
        }
    },
};
