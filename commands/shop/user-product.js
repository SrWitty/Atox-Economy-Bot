const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Product = require('../../models/product');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-products')
        .setDescription('📋 List products sold by a user')
        .addUserOption(option => option.setName('user').setDescription('The user whose products you want to list').setRequired(true)),

    async execute(interaction) {
        try {
            const targetUserId = interaction.options.getUser('user').id;

            const products = await Product.find({ sellerId: targetUserId });

            if (products.length === 0) {
                return interaction.reply('This user does not have any products listed.');
            }

            const user = await User.findOne({ userId: targetUserId });
            const username = user ? user.username : 'Unknown User';

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`${username}'s Products 📋`);

            products.forEach(product => {
                embed.addField(product.name, `**Description:** ${product.description}\n**Price:** ${product.price} coins`);
            });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while listing the products.');
            await interaction.reply({ embeds: [errorEmbed] });
        }
    }
};
