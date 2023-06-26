import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { commands, secretCommands, loadCommands } from './commands/commands';
import { register, clientId } from '../config.json';
import { logerror, loginfo } from './util/logger';
require('dotenv').config();

void (async () => {
    const commandData = [];

    await loadCommands();
    for (const command of commands.values())
        commandData.push(command.data.toJSON());

    try {
        const pro = process.argv[2] == 'pro';

        const rest = new REST({ version: '9' }).setToken(pro ? process.env.TOKENPRO! : process.env.TOKENDEV!);

        loginfo('Started refreshing commands.');

        if (pro) {
            loginfo('====== ON PRODUCTION ======');
            for (const guildId of register.guildId) {
                loginfo(`Registered: ${guildId}`);
                await rest.put(
                    Routes.applicationGuildCommands(clientId.pro, guildId),
                    { body: commandData },
                );
            }
            loginfo('Successfully reloaded PRODUCTION commands.');
        }

        for (const command of secretCommands.values())
            commandData.push(command.data.toJSON());

        await rest.put(
            Routes.applicationGuildCommands(pro ? clientId.pro : clientId.dev, '249887769462177793'),
            { body: commandData },
        );

        loginfo('Successfully reloaded DEV commands.');
    }
    catch (error) {
        logerror(error);
    }
})();