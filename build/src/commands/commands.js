"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCommandInteraction = exports.loadCommands = exports.secretCommands = exports.commands = void 0;
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../util/logger");
const config_json_1 = require("../../config.json");
exports.commands = new discord_js_1.Collection();
exports.secretCommands = new discord_js_1.Collection();
async function loadCommands() {
    const path = process.env.DEBUG ? config_json_1.commandPath.dev : config_json_1.commandPath.pro;
    const commandFolders = fs_1.default.readdirSync(path).filter(file => !(file.endsWith('.js') || file.endsWith('.map') || file.endsWith('.ts')));
    (0, logger_1.loginfo)('Loading commands...');
    for (const folder of commandFolders) {
        const commandFiles = fs_1.default.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
        (0, logger_1.loginfo)(`Found ${commandFiles.length} commands in ${folder}`);
        for (const file of commandFiles) {
            const { command } = await Promise.resolve().then(() => __importStar(require(`./${folder}/${file}`)));
            if (folder == 'secret')
                exports.secretCommands.set(command.data.name, command);
            else
                exports.commands.set(command.data.name, command);
            (0, logger_1.loginfo)(`|- ${file}`);
        }
    }
    (0, logger_1.loginfo)(`Successfully load ${exports.commands.size} commands (+ ${exports.secretCommands.size} secrets)`);
}
exports.loadCommands = loadCommands;
function logCommandInteraction(interaction) {
    let commandDetails = '';
    const subcommand = interaction.options.getSubcommand(false);
    if (subcommand) {
        commandDetails += subcommand + ' ';
        commandDetails += interaction.options.data[0].options?.map(d => d.value).join(' ');
    }
    else {
        commandDetails += interaction.options.data.map(d => d.value).join(' ');
    }
    (0, logger_1.loginfo)(`Got command interaction: ${interaction.commandName}${commandDetails ? ' ' + commandDetails : ''} from: ${interaction.member?.displayName || interaction.user.username} (${interaction.guild?.name}/${interaction.channel?.name})`);
}
exports.logCommandInteraction = logCommandInteraction;
//# sourceMappingURL=commands.js.map