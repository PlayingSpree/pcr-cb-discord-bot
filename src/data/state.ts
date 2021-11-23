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
    channelId: Snowflake;
    messageId!: Snowflake;
    playerQueueStates: PlayerQueueState[] = [];
    ovfPlayers: [Snowflake, number][] = [];
    boss: number;
    count: number;
    round: number;
    constructor(channelId: Snowflake, count: number, round: number, boss: number) {
        super();
        this.channelId = channelId;
        this.count = count;
        this.round = round;
        this.boss = boss;
    }
    next(count: number) {
        const ovf = this.playerQueueStates.find(p => p.boss);
        if (ovf)
            this.ovfPlayers.push([ovf.userId, ovf.boss!]);
        this.playerQueueStates = [];
        this.count = count;
        this.boss++;
        if (this.boss > 5) {
            this.boss = 1;
            this.round++;
        }
    }
}

export class PlayerQueueState {
    userId: Snowflake;
    messageId: Snowflake;
    replyId: Snowflake;
    status: ('hold' | 'pause')[];
    comment: string | null;
    react: string;
    boss: number | undefined;
    constructor(userId: Snowflake, messageId: Snowflake, replyId: Snowflake, status: ('hold' | 'pause')[], react: string, comment: string | null = null) {
        this.userId = userId;
        this.messageId = messageId;
        this.replyId = replyId;
        this.status = status;
        this.react = react;
        this.comment = comment;
    }
}

export class NotifyState extends State {
    channelId: Snowflake;
    messageId: Snowflake;
    boss: Snowflake[][] = [[], [], [], [], []];
    constructor(channelId: Snowflake, messageId: Snowflake) {
        super();
        this.channelId = channelId;
        this.messageId = messageId;
    }
}

export const queueStateData = new Collection<Snowflake, QueueState>();
export const notifyStateData = new Collection<Snowflake, NotifyState>();
export const clearChatStateData = new Collection<Snowflake, number>();