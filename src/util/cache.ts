import Collection from '@discordjs/collection';
import { Snowflake } from 'discord-api-types';
import { loginfo } from './logger';

export class CachedData<T> {
    cacheDate = Date.now();
    data: T;
    constructor(data: T) {
        this.data = data;
    }
}

export abstract class GuildCache<T> {
    cache = new Collection<Snowflake, CachedData<T>>();
    expiredTime = 3600000;
    async get(guildId: Snowflake): Promise<T> {
        const data = this.cache.get(guildId);
        if (data && (Date.now() - data.cacheDate) < this.expiredTime)
            return data.data;
        loginfo('Cache missed. Try fetching data...');
        const fetchedData = await this.fetch(guildId);
        this.cache.set(guildId, new CachedData(fetchedData));
        return fetchedData;
    }
    abstract fetch(guildId: Snowflake): Promise<T>
}