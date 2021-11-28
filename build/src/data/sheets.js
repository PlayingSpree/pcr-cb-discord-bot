"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayerHit = void 0;
const sheets_1 = require("../service/sheets");
const cache_1 = require("../util/cache");
let day = 1;
class SheetsPlayerInfo {
    constructor(index, id, name, discordId) {
        this.index = index;
        this.id = id;
        this.name = name;
        this.discordId = discordId;
    }
}
class PlayerInfoCache extends cache_1.GuildCache {
    async fetch(guildId) {
        const playerInfoCache = [];
        const res = await sheets_1.sheets.read('API_PlayerInfo');
        for (const [index, player] of res.entries()) {
            if (!player[0] || !player[1])
                continue;
            playerInfoCache.push(new SheetsPlayerInfo(index, player[0], player[1], player[3]));
        }
        const setting = await sheets_1.sheets.read('API_Setting');
        if (setting)
            day = Number(setting[0][0]);
        return playerInfoCache;
    }
}
const playerInfoCache = new PlayerInfoCache();
async function setPlayerHit(guildId, discordId, boss) {
    const playerInfo = await playerInfoCache.get(guildId);
    const hitInfo = await sheets_1.sheets.read(`API_Day${day}Hit`);
    const count = [];
    for (let i = 0; i < 30; i++) {
        if (hitInfo) {
            const firstNull = hitInfo[i]?.findIndex(p => !p);
            count[i] = (firstNull == -1 ? hitInfo[i]?.length : firstNull) || 0;
        }
        else {
            count[i] = 0;
        }
    }
    const data = [];
    for (let i = 0; i < 30; i++) {
        data[i] = [];
        const player = playerInfo?.find(p => p.index == i);
        const hit = discordId?.find(id => id == player?.discordId);
        if (hit) {
            const index = (count[i] < 2) ? count[i] : 2;
            data[i][index] = `บอส${boss}`;
        }
    }
    const res = await sheets_1.sheets.write(`API_Day${day}Hit`, data);
    return res;
}
exports.setPlayerHit = setPlayerHit;
//# sourceMappingURL=sheets.js.map