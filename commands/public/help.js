const fs = require('fs').promises;
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands'),

    async execute(interaction) {
        try {
            const commandsFolder = path.resolve(__dirname, '../../commands');
            const commandsData = await getCommandsData(commandsFolder);

            const embeds = createEmbeds(commandsData);
            let currentPage = 0;

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === embeds.length - 1)
                );

            const message = await interaction.reply({ 
                embeds: [embeds[currentPage]], 
                components: [buttons], 
                ephemeral: true,
                fetchReply: true 
            });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', i => {
                if (i.customId === 'previous') {
                    currentPage--;
                } else if (i.customId === 'next') {
                    currentPage++;
                }

                const newButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === embeds.length - 1)
                    );

                i.update({ embeds: [embeds[currentPage]], components: [newButtons] });
            });

            collector.on('end', () => {
                const disabledButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                
                message.edit({ components: [disabledButtons] });
            });

        } catch (error) {
            console.error('Error retrieving and sending help command:', error);
            await interaction.reply({ content: 'An error occurred while retrieving commands list.', ephemeral: true });
        }
    }
};

async function getCommandsData(folderPath) {
    let commandsData = [];

    const files = await fs.readdir(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            const nestedCommands = await getCommandsData(filePath);
            commandsData = commandsData.concat(nestedCommands);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                if (command.data && command.data.name && command.data.description) {
                    commandsData.push({
                        name: command.data.name,
                        description: command.data.description
                    });
                }
            } catch (error) {
                console.error(`Error loading command file ${filePath}:`, error);
            }
        }
    }

    return commandsData;
}

function createEmbeds(commandsData) {
    const embeds = [];
    const chunkSize = 25;

    for (let i = 0; i < commandsData.length; i += chunkSize) {
        const chunk = commandsData.slice(i, i + chunkSize);
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Available Commands')
            .setDescription('Here is a list of available commands:')
            .addFields(chunk.map(cmd => ({ name: cmd.name, value: cmd.description, inline: true })));

        embeds.push(embed);
    }

    return embeds;
}
