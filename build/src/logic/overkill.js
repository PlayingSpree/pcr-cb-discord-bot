"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOvk = void 0;
const discord_js_1 = require("discord.js");
const config_json_1 = require("../../config.json");
function getOvk(hp, dmg1, dmg2) {
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#ff0000')
        .setAuthor('คำนวน Overkill', 'https://cdn.discordapp.com/emojis/902922868499832944.webp')
        .addField('เลือดบอส', hp.toFixed(hp < 1000 ? 2 : 0), true)
        .addField('ดาเมจที่ทำได้', dmg1.toFixed(dmg1 < 1000 ? 2 : 0), true);
    if (dmg2) {
        const time = Math.floor(Math.min((90 + config_json_1.commandConfig.overkill.timeGain) - (90 * ((hp - dmg1) / dmg2)), 90));
        const timeString = time >= 60 ?
            `${Math.floor(time / 60)}:${time - 60 < 10 ? `0${time - 60}` : time - 60}`
            :
                `0:${time < 10 ? `0${time}` : time}`;
        embed
            .addField('ดาเมจที่อีกทีมทำได้', dmg2.toFixed(2), true)
            .addField('เวลาที่ได้ หลังจาก ovk', timeString);
    }
    else {
        embed.addField('ดาเมจที่ต้องทำได้ เพื่อจะได้ ovk ได้เวลาเต็ม', ((hp - dmg1) / (config_json_1.commandConfig.overkill.timeGain / 90)).toFixed(dmg1 < 1000 ? 2 : 0));
    }
    return embed;
}
exports.getOvk = getOvk;
//# sourceMappingURL=overkill.js.map