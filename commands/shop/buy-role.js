const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy-role')
        .setDescription('🛒 Buy a special role in the bot for 10,000 coins'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId, balance: 0, role: 'regular' });
                await user.save();
            }

            const roleCost = 10000;
            if (user.balance < roleCost) {
                const notEnoughCoinsEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Not Enough Coins')
                    .setDescription(`You need 🪙 **${roleCost}** coins to buy the premium role. You currently have 🪙 **${user.balance}** coins.`);

                await interaction.reply({ embeds: [notEnoughCoinsEmbed], ephemeral: true });
                return;
            }

            // Calculate expiration date (30 days from now)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            user.balance -= roleCost;
            user.role = 'premium'; 
            user.roleExpiration = expirationDate; // Set expiration date
            await user.save();

            const roleEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Role Purchased 🛒')
                .setDescription('🎉 You have successfully bought the **premium** role! Enjoy your new benefits.')
                .addField('Role Expiration', `Your premium role will expire on: ${expirationDate.toDateString()}`)
                .setFooter('Thank you for your purchase!', interaction.user.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [roleEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while processing your purchase. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
