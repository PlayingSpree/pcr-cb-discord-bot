"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bossRoleStateData = exports.BossRoleState = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
class State {
    constructor() {
        this.isActive = true;
    }
    static getState(stateData, key) {
        const state = stateData.get(key);
        if (state?.isActive) {
            return state;
        }
    }
}
class BossRoleState extends State {
    constructor(messageId, bossRoles) {
        super();
        this.messageId = messageId;
        this.bossRolesId = bossRoles;
    }
}
exports.BossRoleState = BossRoleState;
exports.bossRoleStateData = new collection_1.default();
//# sourceMappingURL=state.js.map