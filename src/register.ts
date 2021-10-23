import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { commands, loadCommands } from './commands/commands';
import { register, clientId } from '../config.json';
import { logerror, loginfo } from './util/logger';
require('dotenv').config();

void (async () => {
    const commandData = [];

    await loadCommands();
    for (const command of commands.values())
        commandData.push(command.data.toJSON());

    try {
        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN!);

        loginfo('Started refreshing commands.');

        for (const guildId in register.guildId) {
            if (process.env.DEBUG) {
                await rest.put(
                    Routes.applicationGuildCommands(clientId.dev, '249887769462177793'),
                    { body: commandData },
                );
            }
            else {
                await rest.put(
                    Routes.applicationGuildCommands(clientId.pro, guildId),
                    { body: commandData },
                );
            }
        }

        loginfo('Successfully reloaded commands.');
    }
    catch (error) {
        logerror(error);
    }
})();