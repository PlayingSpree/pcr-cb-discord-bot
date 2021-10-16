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

export class BossRoleState extends State {
    messageId: Snowflake;
    bossRolesId: string[];
    constructor(messageId: Snowflake, bossRoles: string[]) {
        super();
        this.messageId = messageId;
        this.bossRolesId = bossRoles;
    }
}

export const bossRoleStateData = new Collection<Snowflake, BossRoleState>();
export const clearChatStateData = new Collection<Snowflake, number>();