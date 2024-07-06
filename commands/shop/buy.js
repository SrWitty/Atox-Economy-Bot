const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Product = require('../../models/product');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('🛍️ Buy a product from the shop')
        .addStringOption(option => option.setName('productname').setDescription('The name of the product you want to buy').setRequired(true)),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const productName = interaction.options.getString('productname');

            let user = await User.findOne({ userId });
            if (!user) {
                user = new User({ userId, balance: 0, role: 'regular', inventory: [] });
                await user.save();
            }

            const product = await Product.findOne({ name: productName, buyerId: null });
            if (!product) {
                const noProductEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Product Not Available ❌')
                    .setDescription('This product is not available or has already been bought.');

                await interaction.reply({ embeds: [noProductEmbed], ephemeral: true });
                return;
            }

            if (user.balance < product.price) {
                const notEnoughCoinsEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Not Enough Coins ❌')
                    .setDescription(`You need 🪙 **${product.price}** coins to buy this product. You currently have 🪙 **${user.balance}** coins.`);

                await interaction.reply({ embeds: [notEnoughCoinsEmbed], ephemeral: true });
                return;
            }

            user.balance -= product.price;
            product.buyerId = userId;
            user.inventory.push(product._id);

            await user.save();
            await product.save();

            const buyEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Purchase Successful 🛍️')
                .setDescription(`You have successfully bought **${product.name}** for 🪙 **${product.price}** coins.`)
                .setFooter({ text: 'Thank you for your purchase!', iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [buyEmbed] });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('Error ❌')
                .setDescription('There was an error while processing your purchase. Please try again later.');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
