"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ephemeral = exports.sendTimedMessage = void 0;
async function sendTimedMessage(channel, ms, content) {
    const message = await channel.send(content);
    setTimeout(() => void message.delete().catch(_ => { return; }), ms);
    return message;
}
exports.sendTimedMessage = sendTimedMessage;
function ephemeral(message) { return { content: message, ephemeral: true }; }
exports.ephemeral = ephemeral;
//# sourceMappingURL=message.js.map