const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Product = require('../../models/product');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('🛒 View available products in the shop'),

    async execute(interaction) {
        try {
            const products = await Product.find({ buyerId: null });

            if (products.length === 0) {
                return interaction.reply('There are no products available in the shop right now.');
            }

            const shopEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Shop 🛒')
                .setDescription('Here are the available products:');

            products.forEach(product => {
                shopEmbed.addFields({ name: product.name, value: `Description: ${product.description}\nPrice: 🪙 ${product.price}\nSeller ID: ${product.sellerId}` });
            });

            await interaction.reply({ embeds: [shopEmbed] });
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error while fetching the shop products.');
        }
    }
};
