"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const commands_1 = require("./commands/commands");
const config_json_1 = require("../config.json");
const logger_1 = require("./util/logger");
require('dotenv').config();
void (async () => {
    const commandData = [];
    await (0, commands_1.loadCommands)();
    for (const command of commands_1.commands.values())
        commandData.push(command.data.toJSON());
    try {
        const rest = new rest_1.REST({ version: '9' }).setToken(process.env.TOKEN);
        (0, logger_1.loginfo)('Started refreshing commands.');
        for (const guildId of config_json_1.register.guildId) {
            if (process.env.DEBUG) {
                await rest.put(v9_1.Routes.applicationGuildCommands(config_json_1.clientId.dev, '249887769462177793'), { body: commandData });
            }
            else {
                await rest.put(v9_1.Routes.applicationGuildCommands(config_json_1.clientId.pro, guildId), { body: commandData });
            }
        }
        (0, logger_1.loginfo)('Successfully reloaded commands.');
    }
    catch (error) {
        (0, logger_1.logerror)(error);
    }
})();
//# sourceMappingURL=register.js.map