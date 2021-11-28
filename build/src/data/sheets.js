"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPlayerHit = void 0;
const sheets_1 = require("../service/sheets");
const cache_1 = require("../util/cache");
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
        for (const [index, player] of res.data.values.entries()) {
            if (!player[0] || !player[1])
                continue;
            playerInfoCache.push(new SheetsPlayerInfo(index, player[0], player[1], player[3]));
        }
        return playerInfoCache;
    }
}
const playerInfoCache = new PlayerInfoCache();
async function setPlayerHit(guildId, discordId, day, boss) {
    const [playerInfo, readRes] = await Promise.all([playerInfoCache.get(guildId), sheets_1.sheets.read(`API_Day${day}Hit`)]);
    const count = [];
    for (let i = 0; i < 30; i++) {
        if (readRes.data.values) {
            const firstNull = readRes.data.values[i]?.findIndex(p => !p);
            count[i] = (firstNull == -1 ? readRes.data.values[i]?.length : firstNull) || 0;
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
            console.log(count[i]);
            const index = (count[i] < 2) ? count[i] : 2;
            data[i][index] = `บอส${boss}`;
        }
    }
    const res = await sheets_1.sheets.write(`API_Day${day}Hit`, data);
    return res;
}
exports.setPlayerHit = setPlayerHit;
//# sourceMappingURL=sheets.js.map