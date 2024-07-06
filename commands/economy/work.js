const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('👔 Perform a job to earn coins'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const currentTime = new Date();

            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId });
                await user.save();
            }

            const threeHours = 3 * 60 * 60 * 1000; 
            if (user.lastWork) {
                const lastWorkTime = user.lastWork.getTime();
                const elapsedTime = currentTime.getTime() - lastWorkTime;

                if (elapsedTime < threeHours) {
                    const remainingTime = threeHours - elapsedTime;
                    const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
                    const remainingMinutes = Math.ceil((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

                    const remainingEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Work 💼')
                        .setDescription(`You need to wait **${remainingHours}** hours and **${remainingMinutes}** minutes before you can work again.`);

                    await interaction.reply({ embeds: [remainingEmbed], ephemeral: true });
                    return;
                }
            }

            const randomCoins = Math.floor(Math.random() * (500 - 200 + 1)) + 200;

            user.balance += randomCoins;
            user.lastWork = currentTime;
            await user.save();

            const workEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Work 💼')
                .setDescription(`You have earned 🪙 ${randomCoins} coins from your work.`);

            await interaction.reply({ embeds: [workEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while processing your work command.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
