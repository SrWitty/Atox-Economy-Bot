const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/user');
const Product = require('../../models/product');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('📦 View your inventory'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const user = await User.findOne({ userId }).populate('inventory');

            if (!user || user.inventory.length === 0) {
                const emptyInventoryEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Empty Inventory 📦')
                    .setDescription('Your inventory is empty.');
                return interaction.reply({ embeds: [emptyInventoryEmbed], ephemeral: true });
            }

            const productDetails = await Product.find({ buyerId: userId });

            const inventoryEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Your Inventory 📦')
                .setDescription(productDetails.map(product => `**${product.name}**: ${product.description}`).join('\n'))
                .setFooter({ text: 'Here are all the items you own!' })
                .setTimestamp();

            await interaction.reply({ embeds: [inventoryEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while fetching your inventory.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
