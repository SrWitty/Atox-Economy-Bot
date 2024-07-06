const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('job')
        .setDescription('👷 Choose a job to earn coins'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const currentTime = new Date();

            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId });
                await user.save();
            }

            const twoHours = 2 * 60 * 60 * 1000; 
            if (user.lastJob) {
                const lastJobTime = user.lastJob.getTime();
                const elapsedTime = currentTime.getTime() - lastJobTime;

                if (elapsedTime < twoHours) {
                    const remainingTime = twoHours - elapsedTime;
                    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));

                    const remainingEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle('Job Assignment 👷')
                        .setDescription(`You need to wait **${remainingMinutes}** minutes before you can work again.`);

                    await interaction.reply({ embeds: [remainingEmbed], ephemeral: true });
                    return;
                }
            }

            const jobs = [
                { name: 'Developer', min: 500, max: 1000 },
                { name: 'Designer', min: 300, max: 700 },
                { name: 'Writer', min: 250, max: 500 },
                { name: 'Gamer', min: 300, max: 400 },
                { name: 'Chef', min: 200, max: 600 },
                { name: 'Teacher', min: 400, max: 800 },
                { name: 'Engineer', min: 500, max: 900 },
                { name: 'Artist', min: 300, max: 600 },
                { name: 'Musician', min: 200, max: 500 },
                { name: 'Athlete', min: 400, max: 700 }
            ];

            const job = jobs[Math.floor(Math.random() * jobs.length)];
            const randomCoins = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

            user.balance += randomCoins;
            user.lastJob = currentTime; 
            user.lastJob = job.name;
            await user.save();

            const jobEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Job Assignment 👷')
                .setDescription(`You have worked as a **${job.name}** and earned 🪙 ${randomCoins} coins.`);

            await interaction.reply({ embeds: [jobEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while processing your job command.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
