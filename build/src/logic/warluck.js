"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLuck = void 0;
const discord_js_1 = require("discord.js");
const luckString = [
    ['ดวงดีมาก ได้ดีกว่าซ้อมเยอะ', 'https://cdn.discordapp.com/emojis/826506005625962547.gif?size=96'],
    ['ดวงดีนิด ๆ ได้ดีกว่าซ้อมนิดหน่อย', 'https://cdn.discordapp.com/emojis/826506249054978108.png?size=96'],
    ['ดวงปกติ ได้เท่าที่ซ้อม', 'https://cdn.discordapp.com/emojis/826513806863761408.png?size=96'],
    ['ดวงไม่ดี ได้แย่กว่าซ้อม', 'https://cdn.discordapp.com/emojis/826505984666894357.png?size=96'],
    ['ดวงซวย บอสคริรัว ๆ DPS ตาย', 'https://cdn.discordapp.com/emojis/826506208562642985.png?size=96'],
    ['ดวงซวยสุด ๆ เน็ตหลุดคะแนนหาย', 'https://cdn.discordapp.com/emojis/826506086658867210.png?size=96']
];
const luckRate = [
    0.15,
    0.3,
    0.6,
    0.75,
    0.95,
    1
];
function getLuck() {
    const luck = Math.random();
    const i = luckRate.filter(l => l < luck).length;
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#ff9900')
        .setTitle(luckString[i][0])
        .setAuthor('ดวง Clan Battle ของคุณ', 'https://cdn.discordapp.com/emojis/826505948826828841.png')
        .setThumbnail(luckString[i][1]);
    return embed;
}
exports.getLuck = getLuck;
//# sourceMappingURL=warluck.js.map