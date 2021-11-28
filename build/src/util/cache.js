"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildCache = exports.CachedData = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
const logger_1 = require("./logger");
class CachedData {
    constructor(data) {
        this.cacheDate = Date.now();
        this.data = data;
    }
}
exports.CachedData = CachedData;
class GuildCache {
    constructor() {
        this.cache = new collection_1.default();
        this.expiredTime = 3600000;
    }
    async get(guildId) {
        const data = this.cache.get(guildId);
        if (data && (Date.now() - data.cacheDate) < this.expiredTime)
            return data.data;
        (0, logger_1.loginfo)('Cache missed. Try fetching data...');
        const fetchedData = await this.fetch(guildId);
        this.cache.set(guildId, new CachedData(fetchedData));
        return fetchedData;
    }
}
exports.GuildCache = GuildCache;
//# sourceMappingURL=cache.js.map