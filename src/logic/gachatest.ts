import { MessageEmbed } from 'discord.js';
import { gachaData, GachaOptions } from '../data/data';

export function getGacha(game: string | null) {
    if (!game)
        game = 'pcr';

    const luckString = gachaData[game as GachaOptions].luckString;
    const luckRate = gachaData[game as GachaOptions].luckRate;
    const gachaRate = gachaData[game as GachaOptions].gachaRate;
    const gachaRate10 = 1 - Math.pow(1 - gachaRate, 10);
    const maxRoll = gachaData[game as GachaOptions].maxRoll;

    let roll = 1;
    let rate = gachaRate;
    if (Math.random() > gachaRate) {
        rate = 0;
        for (roll = 10; roll < maxRoll; roll += 10) {
            rate = 1 - ((1 - rate) * (1 - gachaRate10));
            if (Math.random() <= gachaRate10) break;
        }
    }
    const i = luckRate.filter(l => l < roll).length;
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(luckString[i][0])
        .setAuthor(gachaData[game as GachaOptions].title, 'https://cdn.discordapp.com/emojis/902922377028063284.png')
        .setDescription(gachaData[game as GachaOptions].description)
        .addField('โรล', roll.toString(), true)
        .addField('โอกาสเปิดได้ในจำนวนโรลปัจจุบัน', `${(rate * 100).toFixed(2)}%`, true)
        .setThumbnail(luckString[i][1]);

    return embed;
}
