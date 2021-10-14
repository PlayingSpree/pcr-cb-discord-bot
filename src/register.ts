import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { commands } from './commands/commands'
import { register, clientId } from '../config.json'

export async function registerCommand() {
    const commandData = [];

    for (const command of commands.values()) {
        commandData.push(command.data.toJSON());
    }

    try {
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);

        console.log('Started refreshing commands.');

        for (const guildId in register.guildId) {
            if (process.env.DEBUG) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId.dev, "249887769462177793"),
                    { body: commandData },
                );
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(clientId.pro, guildId),
                    { body: commandData },
                );
            }
        }

        console.log('Successfully reloaded commands.');
    } catch (error) {
        console.error(error);
    }
}