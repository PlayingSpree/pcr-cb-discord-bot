import { MessageEmbed } from 'discord.js';

const luckString = [
    ['ดวงดีเกินไปแล้ว เปิดได้ตั้งแต่โรลแรก', '<a:YuniShake:810139601494474782>'],
    ['ดวงดีสุด ๆ เปิดได้ตั้งแต่ 10 โรลแรก', 'https://cdn.discordapp.com/emojis/826506005625962547.gif?size=96'],
    ['ดวงดีมาก ได้ตั้งแต่ต้น ๆ', 'https://cdn.discordapp.com/emojis/826506249054978108.png?size=96'],
    ['ดวงดี ชนะเรท', 'https://cdn.discordapp.com/emojis/902922868499832944.png?size=96'],
    ['ดวงปกติ ตามเรท', 'https://cdn.discordapp.com/emojis/826513806863761408.png?size=96'],
    ['ดวงไม่ดี แพ้เรท', 'https://cdn.discordapp.com/emojis/826505984666894357.png?size=96'],
    ['ดวงซวย เกือบต้องแลกตัว', 'https://cdn.discordapp.com/emojis/826506208562642985.png?size=96'],
    ['ดวงซวยสุด ๆ 300 โรลเต็ม ๆ', 'https://cdn.discordapp.com/emojis/902923299561025658.png?size=96']];

const luckRate = [
    1,
    10,
    50,
    90,
    160,
    240,
    299,
    300];

const gachaRate = 0.007;
const gachaRate10 = 1 - Math.pow(1 - gachaRate, 10);

export function getGacha() {
    let roll = 1;
    let rate = gachaRate;
    if (Math.random() > gachaRate) {
        rate = 0;
        for (roll = 10; roll < 300; roll += 10) {
            rate = 1 - ((1 - rate) * (1 - gachaRate10));
            if (Math.random() <= gachaRate10) break;
        }
    }
    const i = luckRate.filter(l => l < roll).length;
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(luckString[i][0])
        .setAuthor('ผลการทดลองเปิดกาชา', 'https://cdn.discordapp.com/emojis/902922377028063284.png')
        .addField('โรล', roll.toString(), true)
        .addField('โอกาสเปิดได้ในจำนวนโรลปัจจุบัน', `${(rate * 100).toFixed(2)}%`, true)
        .setThumbnail(luckString[i][1]);

    return embed;
}