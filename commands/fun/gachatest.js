const luckString = [
    ['`ดวงดีเกินไปแล้ว เปิดได้ตั้งแต่โรลแรก`', '<a:YuniShake:810139601494474782>'],
    ['`ดวงดีสุด ๆ เปิดได้ตั้งแต่ 10 โรลแรก`', '<a:SuzunaWink:826506005625962547>'],
    ['`ดวงดีมาก ได้ตั้งแต่ต้น ๆ`', '<:RinoWow:826506249054978108>'],
    ['`ดวงดี ชนะเรท`', '<:KyaruXD:831584418707406929>'],
    ['`ดวงปกติ ตามเรท`', '<:ReiStare:826513806863761408>'],
    ['`ดวงไม่ดี แพ้เรท`', '<:YuiSweat:826505984666894357>'],
    ['`ดวงซวย เกือบต้องแลกตัว`', '<:MakotoFloat:826506208562642985>'],
    ['`ดวงซวยสุด ๆ 300 โรลเต็ม ๆ`', '<:YukariTrauma:810157994914217985>']];

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

function getGacha() {
    let roll = 1;
    let rate = gachaRate;
    if (Math.random() > gachaRate) {
        rate = 0;
        for (roll = 10; roll < 300; roll += 10) {
            rate = 1 - ((1 - rate) * (1 - gachaRate10));
            if (Math.random() <= gachaRate10) break;
        }
    }
    for (let i = 0; i < luckRate.length; i++) {
        if (roll <= luckRate[i]) {
            return ['**<:YuniGems:810157705548922900> ผลการทดลองเปิดกาชา**\n' + luckString[i][0] + `\nโรล: \`${roll}\`\nโอกาสเปิดได้ในจำนวนโรลปัจจุบัน: \`${(rate * 100).toFixed(2)}%\``, luckString[i][1]];
        }
    }
}

module.exports = {
    name: 'gachatest',
    aliases: ['gacha', 'gachaluck'],
    cooldown: 1,
    description: 'จำลองเปิดกาชา ว่าเปิดกี่ครั้งถึงจะได้ตัวที่ต้องการ',
    execute(message, args) {
        const gachastr = getGacha();
        message.channel.send(gachastr[0]);
        return message.channel.send(gachastr[1]);
    },
    async executeSlash(interaction, args) {
        const gachastr = getGacha();
        await interaction.channel.cmdreply.send(gachastr[0]);
        interaction.channel.cmdreply.send(gachastr[1]);
    }
};