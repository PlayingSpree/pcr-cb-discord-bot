module.exports = {
    getSubCommandsUsage(subCommands) {
        let subCommandsUsage = '\n**Subcommand:**';
        for (const cmd of subCommands) {
            subCommandsUsage += `\n${cmd.name}`;

            if (cmd.aliases) subCommandsUsage += `(${cmd.aliases.join('|')})`;
            if (cmd.usage) subCommandsUsage += ` ${cmd.usage}`;
        }
        return subCommandsUsage;
    },
    execute(subCommands, message, args) {
        if (args.length === 0) return false;

        const commandName = args[0].toLowerCase();
        const command = subCommands.find(cmd => (cmd.name === commandName) || (cmd.aliases && cmd.aliases.includes(commandName)));

        if (!command) return false;

        args.shift();
        try {
            command.execute(message, args);
        }
        catch (error) {
            console.error(error);
            message.channel.cmdreply.reply('มีข้อผิดพลาดระหว่างการทำคำสั่ง', { 'flags': 64 });
        }
        return true;
    },
    executeSlash(subCommands, commandName, interaction, args) {
        const command = subCommands.find(cmd => (cmd.name === commandName) || (cmd.aliases && cmd.aliases.includes(commandName)));

        if (!command) return false;

        command.executeSlash(interaction, args);
        return true;
    }
};