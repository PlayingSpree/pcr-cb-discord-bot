"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGacha = void 0;
const discord_js_1 = require("discord.js");
const data_1 = require("../data/data");
function getGacha(game) {
    if (!game || !(game in data_1.gachaData))
        game = 'pcr';
    const luckString = data_1.gachaData[game].luckString;
    const luckRate = data_1.gachaData[game].luckRate;
    const gachaRate = data_1.gachaData[game].gachaRate;
    const gachaRate10 = 1 - Math.pow(1 - gachaRate, 10);
    const maxRoll = data_1.gachaData[game].maxRoll;
    let roll = 1;
    let rate = gachaRate;
    if (Math.random() > gachaRate) {
        rate = 0;
        for (roll = 10; roll < maxRoll; roll += 10) {
            rate = 1 - ((1 - rate) * (1 - gachaRate10));
            if (Math.random() <= gachaRate10)
                break;
        }
    }
    const i = luckRate.filter(l => l < roll).length;
    const embed = new discord_js_1.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(luckString[i][0])
        .setAuthor(data_1.gachaData[game].title, 'https://cdn.discordapp.com/emojis/902922377028063284.png')
        .setDescription(data_1.gachaData[game].description)
        .setFooter(data_1.gachaData[game].footer)
        .addField('โรล', roll.toString(), true)
        .addField('โอกาสเปิดได้ในจำนวนโรลปัจจุบัน', `${(rate * 100).toFixed(2)}%`, true)
        .setThumbnail(luckString[i][1]);
    return embed;
}
exports.getGacha = getGacha;
//# sourceMappingURL=gachatest.js.map