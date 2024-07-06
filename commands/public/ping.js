const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🌐 Get the bot and API latency'),

    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer the reply to extend the interaction's acknowledgment period

            const botLatency = Date.now() - interaction.createdTimestamp;
            const apiLatency = interaction.client.ws.ping;

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: '🤖 Bot Latency', value: ` ${botLatency}ms`, inline: true },
                    { name: '🌐 API Latency', value: ` ${apiLatency}ms`, inline: true },
                );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while executing this command!');
            await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
