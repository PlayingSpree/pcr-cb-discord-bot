"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommand = void 0;
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const commands_1 = require("./commands/commands");
const config_json_1 = require("../config.json");
async function registerCommand() {
    const commandData = [];
    for (const command of commands_1.commands.values()) {
        commandData.push(command.data.toJSON());
    }
    try {
        const rest = new rest_1.REST({ version: '9' }).setToken(process.env.TOKEN);
        console.log('Started refreshing commands.');
        for (const guildId in config_json_1.register.guildId) {
            if (process.env.DEBUG) {
                await rest.put(v9_1.Routes.applicationGuildCommands(config_json_1.clientId.dev, "249887769462177793"), { body: commandData });
            }
            else {
                await rest.put(v9_1.Routes.applicationGuildCommands(config_json_1.clientId.pro, guildId), { body: commandData });
            }
        }
        console.log('Successfully reloaded commands.');
    }
    catch (error) {
        console.error(error);
    }
}
exports.registerCommand = registerCommand;
