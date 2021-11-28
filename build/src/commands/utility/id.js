"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('id')
        .setDescription('แสดง id discord ของ user ที่ใส่')
        .addUserOption(option => option.setName('user')
        .setDescription('ผู้เล่นที่ต้องการรู้ id')
        .setRequired(true)),
    execute(interaction) {
        const user = interaction.options.getUser('user', true);
        void interaction.reply({
            embeds: [new discord_js_1.MessageEmbed()
                    .setColor('#9999ff')
                    .setTitle('Discord ID')
                    .addField('User', user.toString())
                    .addField('ID', user.id)]
        });
    },
};
//# sourceMappingURL=id.js.map