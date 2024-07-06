const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Product = require('../../models/product');
const User = require('../../models/user');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-product')
        .setDescription('📦 Create a new product for the shop')
        .addStringOption(option => option.setName('name').setDescription('The name of the product').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('The description of the product').setRequired(true))
        .addNumberOption(option => option.setName('price').setDescription('The price of the product').setRequired(true))
        .addStringOption(option => option.setName('link').setDescription('The link of the product').setRequired(true)),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            const user = await User.findOne({ userId });
            if (!user || user.role !== 'premium') {
                return interaction.reply('You need to have the premium role to create products.');
            }

            const name = interaction.options.getString('name');
            const description = interaction.options.getString('description');
            const price = interaction.options.getNumber('price');
            const link = interaction.options.getString('link');

            const product = new Product({
                name,
                description,
                price,
                link,
                sellerId: userId,
                buyerId: null 
            });

            await product.save();

            const createProductEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Product Created 📦')
                .setDescription(`You have successfully created the product: ${name}`);

            await interaction.reply({ embeds: [createProductEmbed], ephemeral: true });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while creating the product.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
