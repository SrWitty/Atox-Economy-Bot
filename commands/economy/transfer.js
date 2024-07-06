const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');
const Transfer = require('../../models/transfer'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('💸 Transfer coins to another user')
        .addUserOption(option =>
            option.setName('recipient')
                .setDescription('👤 The user you want to transfer coins to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('💰 The amount of coins to transfer')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('📝 Reason for the transfer')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const recipient = interaction.options.getUser('recipient');
            const recipientId = recipient.id;
            const amount = interaction.options.getInteger('amount');
            const reason = interaction.options.getString('reason') || 'No reason provided';


            if (userId === recipientId || recipient.bot) {
                const selfOrBotTransferEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Transfer Failed')
                    .setDescription('🚫 You cannot transfer coins to yourself or to a bot.');
                return interaction.reply({ embeds: [selfOrBotTransferEmbed] });
            }


            const user = await User.findOne({ userId });
            if (!user || user.balance < amount) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Transfer Failed')
                    .setDescription('🚫 You do not have enough coins to make this transfer.');
                return interaction.reply({ embeds: [errorEmbed] });
            }


            const tax = Math.ceil(amount * 0.05);
            const netAmount = amount - tax;


            if (user.balance < netAmount) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Transfer Failed')
                    .setDescription('🚫 You do not have enough coins to make this transfer.');
                return interaction.reply({ embeds: [errorEmbed] });
            }

            
            user.balance -= netAmount;
            await user.save();

            
            let recipientUser = await User.findOne({ userId: recipientId });
            if (!recipientUser) {
                recipientUser = new User({ userId: recipientId, balance: netAmount });
            } else {
                recipientUser.balance += netAmount;
            }
            await recipientUser.save();

            
            const transferRecord = new Transfer({
                senderId: userId,
                recipientId: recipientId,
                amount: netAmount
            });
            await transferRecord.save();

            
            const confirmationEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Transfer Successful')
                .setDescription(`🎉 You have successfully transferred ${netAmount} coins to <@${recipientId}> for the reason: ${reason}.`);
            await interaction.reply({ embeds: [confirmationEmbed] });

            
            const dmRecipient = await interaction.client.users.fetch(recipientId);
            if (dmRecipient) {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('💸 Coins Transferred')
                    .setDescription(`🎉 You have received ${netAmount} coins from <@${userId}> for the reason: ${reason}.`)
                    .addFields({ name: 'Sent By', value: `<@${userId}>`, inline: true });
                dmRecipient.send({ embeds: [dmEmbed] });
            }
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('⚠️ There was an error while processing your transfer.');
            interaction.reply({ embeds: [errorEmbed] }).catch(console.error); 
        }
    },
};
