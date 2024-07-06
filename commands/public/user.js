const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Badge = require('../../models/badge');
const User = require('../../models/user');
const Profile = require('../../models/profile'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Show user information')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to show information for')
                .setRequired(false)), 

    async execute(interaction) {
        try {
            const user = interaction.options.getMember('user') || interaction.member;

            const userData = await User.findOne({ userId: user.id });

            const profileData = await Profile.findOne({ userId: user.id });

            const botBadges = [];
            if (userData) {
                for (const badgeName of userData.badges) {
                    const badge = await Badge.findOne({ name: badgeName });
                    if (badge) {
                        botBadges.push(`${badge.emoji} ${badge.name}`);
                    }
                }
            }

           
            const discordBadges = [];
            user.user.flags.toArray().forEach(flag => {
                if (flag.startsWith('USER_FLAG_')) {
                    const badgeName = flag.split('_').slice(2).join(' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                    discordBadges.push(badgeName);
                }
            });

           
            const bannerURL = user.user.bannerURL({ format: 'png', dynamic: true, size: 1024 }) || 'https://media.discordapp.net/attachments/1225674902426882048/1225675392094965781/Quantum-Profile-Banner.jpg';

         
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('User Information')
                .addFields(
                    { name: 'User ID', value: user.id, inline: true },
                    { name: 'Username', value: user.user.username, inline: true },
                    { name: 'Tag', value: user.user.tag, inline: true },
                    { name: 'Bot', value: user.user.bot ? 'Yes' : 'No', inline: true },
                    { name: 'Description', value: profileData ? profileData.description : 'No description', inline: true },
                    { name: 'Discord Badges', value: discordBadges.length > 0 ? discordBadges.join(', ') : 'None', inline: true },
                    { name: 'Bot Badges', value: botBadges.length > 0 ? botBadges.join('\n') : 'None', inline: true }
                )
                .setThumbnail(user.user.displayAvatarURL({ format: 'png', dynamic: true })) 
                .setImage(bannerURL); 

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.reply({ content: 'An error occurred while fetching user information.', ephemeral: true });
        }
    },
};
