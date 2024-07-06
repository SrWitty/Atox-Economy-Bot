const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const Product = require('../../models/product');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-products')
        .setDescription('📦 View and manage your products'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            
            const user = await User.findOne({ userId });
            if (!user || user.role !== 'premium') {
                return interaction.reply('You need to have the premium role to create products.');
            }

            const products = await Product.find({ sellerId: userId });

            if (products.length === 0) {
                const noProductsEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('No Products Found ❌')
                    .setDescription('You have no products listed for sale.');

                await interaction.reply({ embeds: [noProductsEmbed], ephemeral: true });
                return;
            }

            const productOptions = products.map(product => {
                return {
                    label: product.name,
                    value: product._id.toString() // Convert ObjectId to string
                };
            });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('productSelect')
                .setPlaceholder('Select a product to manage...')
                .addOptions(productOptions);

            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('deleteButton')
                        .setLabel('Delete Product')
                        .setStyle('DANGER')
                );

            const manageProductsEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Manage Your Products 📦')
                .setDescription('Select a product to delete.')
                .addField('Products:', 'Use the dropdown menu to select a product.')
                .setTimestamp();

            const message = await interaction.reply({
                embeds: [manageProductsEmbed],
                components: [new ActionRowBuilder().addComponents(selectMenu), buttonRow],
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Error ❌')
                .setDescription('There was an error while fetching your products.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
