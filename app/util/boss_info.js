const appConfig = require('../../config.json');

class BossInfo {
    constructor(boss, round) {
        this.boss = boss;
        this.round = round;
    }
    toInt() {
        return this.boss + ((this.round - 1) * 5);
    }
    toString() {
        return `${appConfig.bossname[this.boss]} รอบ ${(this.round - 1) * 5}`;
    }
}

module.exports = {
    BossInfo(boss, round) {
        return new BossInfo(boss, round);
    },
    bossInfoToInt(boss, round) {
        return boss + ((round - 1) * 5);
    },
    bossInfoFromInt(i) {
        return new BossInfo(((i - 1) % 5) + 1, Math.floor((i - 1) / 5) + 1);
    },
    bossIntToString(i) {
        return `${appConfig.bossname[((i - 1) % 5) + 1]} รอบ ${Math.floor((i - 1) / 5) + 1}`;
    },
    bossInfoToString(boss, round) {
        return this.bossIntToString(this.bossInfoToInt(boss, round));
    },
};