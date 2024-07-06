const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const loadCommands = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(dir, file.name);
            if (file.isDirectory()) {
                loadCommands(filePath);
            } else if (file.isFile() && file.name.endsWith('.js')) {
                try {
                    const command = require(filePath);
                    if ('data' in command && 'execute' in command) {
                        client.commands.set(command.data.name, command);
                    } else {
                        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                } catch (error) {
                    console.error(`Error loading command at ${filePath}:`, error);
                }
            }
        }
    };

    // Start loading commands from the main commands directory
    loadCommands(path.join(__dirname, '../commands'));
};
