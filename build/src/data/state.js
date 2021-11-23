"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearChatStateData = exports.notifyStateData = exports.queueStateData = exports.NotifyState = exports.PlayerQueueState = exports.QueueState = void 0;
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
    constructor(channelId, count, round, boss) {
        super();
        this.playerQueueStates = [];
        this.ovfPlayers = [];
        this.channelId = channelId;
        this.count = count;
        this.round = round;
        this.boss = boss;
    }
    next(count) {
        const ovf = this.playerQueueStates.find(p => p.boss);
        if (ovf)
            this.ovfPlayers.push([ovf.userId, ovf.boss]);
        this.playerQueueStates = [];
        this.count = count;
        this.boss++;
        if (this.boss > 5) {
            this.boss = 1;
            this.round++;
        }
    }
}
exports.QueueState = QueueState;
class PlayerQueueState {
    constructor(userId, messageId, replyId, status, react, comment = null) {
        this.userId = userId;
        this.messageId = messageId;
        this.replyId = replyId;
        this.status = status;
        this.react = react;
        this.comment = comment;
    }
}
exports.PlayerQueueState = PlayerQueueState;
class NotifyState extends State {
    constructor(channelId, messageId) {
        super();
        this.boss = [[], [], [], [], []];
        this.channelId = channelId;
        this.messageId = messageId;
    }
}
exports.NotifyState = NotifyState;
exports.queueStateData = new collection_1.default();
exports.notifyStateData = new collection_1.default();
exports.clearChatStateData = new collection_1.default();
//# sourceMappingURL=state.js.map