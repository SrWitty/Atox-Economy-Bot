const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('💰 Check your balance in the economy system')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to show information for')
                .setRequired(false)),

    async execute(interaction) {
        const userId = interaction.options.getUser('user')?.id || interaction.user.id;

        try {
           
            const user = await User.findOne({ userId });

            if (!user) {

                const balanceEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('💰 Balance')
                    .setDescription('This user\'s balance is 0 🪙 coins.');

                return interaction.reply({ embeds: [balanceEmbed], ephemeral: true });
            }

            
            const balanceEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('💰 Balance')
                .setDescription(`This user's balance is ${user.balance} 🪙 coins.`);

            interaction.reply({ embeds: [balanceEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error fetching user balance:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while fetching the balance.');

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
