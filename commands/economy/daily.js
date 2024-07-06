const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('🎁 Claim your daily coins'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const currentTime = new Date();

            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId, lastDaily: currentTime });
                await user.save();
            } else {
                if (user.lastDaily) {
                    const lastDailyTime = user.lastDaily.getTime();
                    const elapsedTime = currentTime.getTime() - lastDailyTime;
                    const twentyFourHours = 24 * 60 * 60 * 1000;

                    if (elapsedTime < twentyFourHours) {
                        const remainingTime = twentyFourHours - elapsedTime;
                        const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
                        const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

                        const remainingEmbed = new EmbedBuilder()
                            .setColor(0xff0000)
                            .setTitle('Daily Coins 💰')
                            .setDescription(`You have already claimed your daily coins. Please wait ${remainingHours} hours and ${remainingMinutes} minutes before claiming again.`);

                        await interaction.reply({ embeds: [remainingEmbed], ephemeral: true });
                        return;
                    }
                }
            }

            const randomCoins = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;

            user.balance += randomCoins;
            user.lastDaily = currentTime; // Update lastDaily time
            await user.save();

            const dailyEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Daily Coins 💰')
                .setDescription(`You have received 🪙 ${randomCoins} coins as your daily reward.`);

            await interaction.reply({ embeds: [dailyEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while processing your daily reward.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
