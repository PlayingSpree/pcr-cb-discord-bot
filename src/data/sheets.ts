import { sheets } from '../service/sheets';
import { GuildCache } from '../util/cache';

class SheetsPlayerInfo {
    index: number;
    id: string;
    name: string;
    discordId: string | undefined;
    constructor(index: number, id: string, name: string, discordId: string | undefined) {
        this.index = index;
        this.id = id;
        this.name = name;
        this.discordId = discordId;
    }
}

class PlayerInfoCache extends GuildCache<SheetsPlayerInfo[]> {
    async fetch(guildId: string) {
        const playerInfoCache = [];
        const res = await sheets.read('API_PlayerInfo');
        for (const [index, player] of (res.data.values as (string | undefined)[][]).entries()) {
            if (!player[0] || !player[1])
                continue;
            playerInfoCache.push(new SheetsPlayerInfo(index, player[0], player[1], player[3]));
        }
        return playerInfoCache;
    }
}

const playerInfoCache = new PlayerInfoCache();

export async function setPlayerHit(guildId: string, discordId: string[], day: number, boss: number) {
    const [playerInfo, readRes] = await Promise.all([playerInfoCache.get(guildId), sheets.read(`API_Day${day}Hit`)]);

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

    const data: string[][] = [];
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
    const res = await sheets.write(`API_Day${day}Hit`, data);
    return res;
}