module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // Dynamically import chalk
        const { default: chalk } = await import('chalk');

        // Set the bot's presence (status and activity)
        client.user.setPresence({
            status: 'idle',
            activities: [{ name: 'with the economy', type: 'PLAYING' }],
        });

        // Log a message to the console in green
        console.log(chalk.green(`Logged in as ${client.user.tag}!`));

        // Optionally, log more details if desired
        console.log(chalk.green('Bot is ready and operational!'));
        console.log(chalk.green(`Serving in ${client.guilds.cache.size} servers.`));
    },
};
