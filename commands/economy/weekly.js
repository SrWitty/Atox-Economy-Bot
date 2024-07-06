const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('💰 Claim your weekly coins'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const currentTime = new Date();

        try {
            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId, lastWeekly: currentTime });
                await user.save();
            } else {
                const lastWeeklyTime = user.lastWeekly ? user.lastWeekly.getTime() : 0;
                const elapsedTime = currentTime.getTime() - lastWeeklyTime;
                const sevenDays = 7 * 24 * 60 * 60 * 1000;

                if (elapsedTime < sevenDays) {
                    const remainingTime = sevenDays - elapsedTime;
                    const remainingDays = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
                    const remainingHours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

                    const remainingEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('⏳ Weekly Coins')
                        .setDescription(`You have already claimed your weekly coins. Please wait **${remainingDays} days, ${remainingHours} hours, and ${remainingMinutes} minutes** before claiming again.`);

                    return interaction.reply({ embeds: [remainingEmbed], ephemeral: true });
                }
            }

            const randomCoins = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;

            user.balance += randomCoins;
            user.lastWeekly = currentTime;
            await user.save();

            const weeklyEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('🎉 Weekly Coins')
                .setDescription(`Congratulations! You have received **${randomCoins}** coins as your weekly reward. 🪙`);

            interaction.reply({ embeds: [weeklyEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while processing your weekly reward. Please try again later.');
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
