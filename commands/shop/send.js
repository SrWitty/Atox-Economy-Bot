const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageActionRow, MessageSelectMenu } = require('discord.js');
const User = require('../../models/user');
const Product = require('../../models/product');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('📦 Send a product to another user')
        .addUserOption(option => option.setName('recipient').setDescription('The user you want to send the product to').setRequired(true)),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            const user = await User.findOne({ userId }).populate('inventory');
            if (!user || user.role !== 'premium') {
                return interaction.reply('You need to have the premium role to send products.');
            }

            const recipient = interaction.options.getUser('recipient');
            const products = await Product.find({ buyerId: userId });

            if (products.length === 0) {
                return interaction.reply('You do not own any products.');
            }

            const options = products.map(product => ({
                label: product.name,
                description: product.description,
                value: product._id.toString()
            }));

            const selectMenu = new SelectMenuBuilder()
                .setCustomId('selectProduct')
                .setPlaceholder('Select a product to send')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ content: 'Select a product to send:', components: [row], ephemeral: true });

            const filter = i => i.customId === 'selectProduct' && i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                const productId = i.values[0];
                const product = await Product.findById(productId);
                const recipientUser = await User.findOne({ userId: recipient.id });

                if (!recipientUser) {
                    return i.reply('The recipient does not have an account.');
                }

                product.buyerId = recipient.id;
                recipientUser.inventory.push(product._id);

                await product.save();
                await recipientUser.save();

                const sendEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Product Sent 📦')
                    .setDescription(`You have successfully sent ${product.name} to ${recipient.username}.`);

                await i.update({ embeds: [sendEmbed], components: [], ephemeral: true });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'You did not select any product.', components: [], ephemeral: true });
                }
            });
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('❌ Error')
                .setDescription('There was an error while sending the product.');
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
