const appConfig = require('../../config.json');
const bossInfo = require('../../app/util/boss_info.js');

function getScoreForBoss(boss, round) {
    let i = 0;
    while (round > appConfig.score_info.round[i]) i++;
    return appConfig.score_info.hp[i][boss - 1] * appConfig.score_info.multiplier[i][boss - 1];
}

function calcScore(score) {
    let s = score;
    let boss = 1, round = 1;
    while (s > 0) {
        const bossScore = getScoreForBoss(boss, round);
        if (bossScore < s) {
            s -= bossScore;
            boss++;
            if (boss > 5) {
                boss = 1;
                round++;
            }
        }
        else { break; }
    }
    let i = 0;
    while (round > appConfig.score_info.round[i]) i++;
    const bosshp = appConfig.score_info.hp[i][boss - 1];
    const hp = bosshp - (s / appConfig.score_info.multiplier[i][boss - 1]);

    return `:crossed_swords: คะแนนที่ได้:  \`${score}\`
    \n**:smiling_imp: บอสที่ตีถึง: **\`${bossInfo.bossInfoToString(boss, round)} (HP ${hp.toFixed(0)}/${bosshp})\``;
}

function validateScore(score) {
    const args = [score];
    const i = 0;
    const n = parseInt(args[i]);
    if (isNaN(n)) {
        return [`arguments ที่ ${i + 1} ต้องเป็นตัวเลข`, args];
    }
    if (n <= 0) {
        return [`arguments ที่ ${i + 1} ต้องมากกว่า 0`, args];
    }
    args[i] = n;
    return [null, args];
}

module.exports = {
    name: 'score',
    aliases: ['sc'],
    description: 'คำนวณบอสที่ตีถึงจากคะแนนใน Clan Battle',
    usage: '[คะแนน] คะแนนดิบ',
    execute(message, args) {
        const guildConfig = message.client.settings.get(message.guild.id);
        const prefix = guildConfig.prefix;
        // Validation
        if (args.length < 1) {
            return message.channel.send(`arguments ไม่พอ\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);
        }
        let invalid = null;
        [invalid, args] = validateScore(args[0]);
        if (invalid) return message.channel.send(`${invalid}\n**วิธีใช้:** ${prefix}${this.name} ${this.usage}`);

        return message.channel.send(calcScore(args[0]));
    },
    executeSlash(interaction, args) {
        const [invalid, _] = validateScore(args.score);
        if (invalid) return interaction.channel.cmdreply.send(invalid, { 'flags': 64 });

        interaction.channel.cmdreply.send(calcScore(args.score));
    }
};