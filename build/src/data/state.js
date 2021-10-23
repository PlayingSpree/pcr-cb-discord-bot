"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearChatStateData = exports.queueStateData = exports.PlayerQueueState = exports.PlayerState = exports.BossState = exports.QueueState = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
class State {
    constructor() {
        this.isActive = true;
    }
    static getState(stateData, key) {
        const state = stateData.get(key);
        if (state?.isActive)
            return state;
    }
}
class QueueState extends State {
    constructor() {
        super(...arguments);
        this.bossQueue = [];
    }
}
exports.QueueState = QueueState;
class BossState {
    constructor(channelId, count, round, boss) {
        this.playerQueueStates = new collection_1.default();
        this.playerStates = new collection_1.default();
        this.channelId = channelId;
        this.count = count;
        this.round = round;
        this.boss = boss;
    }
    next(count) {
        this.count = count;
        this.round++;
    }
}
exports.BossState = BossState;
class PlayerState {
    constructor() {
        this.count = 0;
        this.ovf = false;
    }
}
exports.PlayerState = PlayerState;
class PlayerQueueState {
    constructor(isPaused, comment = null) {
        this.isPaused = isPaused;
        this.comment = comment;
    }
}
exports.PlayerQueueState = PlayerQueueState;
exports.queueStateData = new collection_1.default();
exports.clearChatStateData = new collection_1.default();
//# sourceMappingURL=state.js.map