const luckString = [
    ['`ดวงดีมาก ได้ดีกว่าซ้อมเยอะ`', '<a:SuzunaWink:826506005625962547>'],
    ['`ดวงดีนิด ๆ ได้ดีกว่าซ้อมนิดหน่อย`', '<:RinoWow:826506249054978108>'],
    ['`ดวงปกติ ได้เท่าที่ซ้อม`', '<:ReiStare:826513806863761408>'],
    ['`ดวงไม่ดี ได้แย่กว่าซ้อม`', '<:YuiSweat:826505984666894357>'],
    ['`ดวงซวย บอสคริรัว ๆ DPS ตาย`', '<:MakotoFloat:826506208562642985>'],
    ['`ดวงซวยสุด ๆ เน็ตหลุดคะแนนหาย`', '<:MiyaGhost:826506086658867210>']];

const luckRate = [
    0.15,
    0.3,
    0.6,
    0.75,
    0.95,
    1];

function getLuck() {
    const luck = Math.random();
    for (let i = 0; i < luckRate.length; i++) {
        if (luck <= luckRate[i]) {
            return ['**<:Amesderp:826505948826828841> ดวงของคุณ**\n' + luckString[i][0], luckString[i][1]];
        }
    }
    return 'wtf';
}

module.exports = {
    name: 'checkluck',
    aliases: ['luck'],
    description: 'เช็คดวงก่อนต่อสู้จริงใน Clan Battle',
    execute(message, args) {
        const luckstr = getLuck();
        message.channel.send(luckstr[0]);
        return message.channel.send(luckstr[1]);
    },
    async executeSlash(interaction) {
        const luckstr = getLuck();
        await interaction.channel.cmdreply.send(luckstr[0]);
        interaction.channel.cmdreply.send(luckstr[1]);
    }
};