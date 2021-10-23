import Collection from '@discordjs/collection';
import { Snowflake } from 'discord-api-types';

abstract class State {
    isActive = true;
    static getState<V extends State, K>(stateData: Collection<K, V>, key: K) {
        const state = stateData.get(key);
        if (state?.isActive)
            return state;
    }
}

export class QueueState extends State {
    bossQueue: BossState[] = [];
}

export class BossState {
    channelId: Snowflake;
    playerQueueStates: PlayerQueueState[] = [];
    boss: number;
    count: number;
    round: number;
    constructor(channelId: Snowflake, count: number, round: number, boss: number) {
        this.channelId = channelId;
        this.count = count;
        this.round = round;
        this.boss = boss;
    }
    next(count: number) {
        this.playerQueueStates = [];
        this.count = count;
        this.round++;
    }
}

export class PlayerState {
    count = 0;
    ovf = false;
}

export class PlayerQueueState {
    userId: Snowflake;
    isPaused: boolean;
    comment: string | null;
    constructor(userId: Snowflake, isPaused: boolean, comment: string | null = null) {
        this.userId = userId;
        this.isPaused = isPaused;
        this.comment = comment;
    }
}

export const queueStateData = new Collection<Snowflake, QueueState>();
export const clearChatStateData = new Collection<Snowflake, number>();