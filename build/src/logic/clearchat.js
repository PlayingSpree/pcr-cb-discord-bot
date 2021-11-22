"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryClearChat = void 0;
const discord_js_1 = require("discord.js");
const state_1 = require("../data/state");
const logger_1 = require("../util/logger");
const config_json_1 = require("../../config.json");
const confirmTime = config_json_1.commandConfig.clearchat.confirmTime;
async function tryClearChat(interaction) {
    const channel = interaction.channel;
    const isUsed = state_1.clearChatStateData.get(channel.id);
    if (isUsed && (isUsed === -1 || (isUsed > Date.now()))) {
        state_1.clearChatStateData.set(channel.id, -1);
        void interaction.reply({ content: 'กำลังลบข้อความทั้งหมด', ephemeral: true });
        await clearChat(channel);
        return;
    }
    const row = new discord_js_1.MessageActionRow()
        .addComponents(new discord_js_1.MessageButton()
        .setCustomId('/clearchat')
        .setLabel('ยืนยัน')
        .setStyle(4)).addComponents(new discord_js_1.MessageButton()
        .setCustomId('!messagedeleteself')
        .setLabel('ยกเลิก')
        .setStyle(2));
    state_1.clearChatStateData.set(channel.id, Date.now() + confirmTime);
    void interaction.reply({ content: `**:warning: ยังไม่เคยล้างแชทในช่องนี้มาก่อนในช่วงเร็ว ๆ นี้**\n\n**ชื่อช่อง: \`${channel.name}\`**\n\n:exclamation: กดปุ่มยืนยันหรือพิมพ์คำสั่งอีกครั้งภายใน ${confirmTime / 1000} วินาทีเพื่อยืนยันการใช้งาน`, components: [row] });
    setTimeout(() => void interaction.deleteReply().catch(_ => { return; }), confirmTime);
}
exports.tryClearChat = tryClearChat;
async function clearChat(channel) {
    (0, logger_1.loginfo)('Clearing all chat from ' + channel.name);
    const message = await channel.send(':warning: **__กำลังล้างแชทที่อยู่ด้านบน แต่พิมพ์กันได้ปกติน้า__** :warning:');
    const timeStart = new Date(Date.now() - 200);
    let fetched;
    try {
        do {
            fetched = await channel.messages.fetch({ limit: 100 });
            fetched = fetched.filter(m => (m.id !== message.id) && (m.createdAt <= timeStart));
            await channel.bulkDelete(fetched);
        } while (fetched.size >= 1);
    }
    catch (err) {
        const e = err;
        (0, logger_1.logerror)(e);
        void channel.send(e.message);
    }
    void message.edit('ล้างแชทเสร็จแล้วจ้า~');
    (0, logger_1.loginfo)('Chat cleared.');
    setTimeout(() => void message.delete(), 5000);
}
//# sourceMappingURL=clearchat.js.map