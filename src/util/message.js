"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTimedMessage = void 0;
async function sendTimedMessage(channel, ms, content) {
    const message = await channel.send(content);
    setTimeout(() => message.delete(), ms);
}
exports.sendTimedMessage = sendTimedMessage;
