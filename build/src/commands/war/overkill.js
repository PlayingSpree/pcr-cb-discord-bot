"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
const builders_1 = require("@discordjs/builders");
const overkill_1 = require("../../logic/overkill");
exports.command = {
    data: new builders_1.SlashCommandBuilder()
        .setName('overkill')
        .setDescription('คำนวณดาเมจ/เวลาที่ได้ ในการ Overkill')
        .addNumberOption(option => option.setName('hp')
        .setDescription('เลือดบอสปัจจุบัน')
        .setRequired(true))
        .addNumberOption(option => option.setName('dmg1')
        .setDescription('ดาเมจที่ทำได้')
        .setRequired(true))
        .addNumberOption(option => option.setName('dmg2')
        .setDescription('ดาเมจที่อีกทีมทำได้ (ใส่เพื่อหาเวลาที่ได้ หลังจาก ovk)')
        .setRequired(false)),
    execute(interaction) {
        const hp = interaction.options.getNumber('hp', true);
        const dmg1 = interaction.options.getNumber('dmg1', true);
        const dmg2 = interaction.options.getNumber('dmg2');
        void interaction.reply({
            embeds: [(0, overkill_1.getOvk)(hp, dmg1, dmg2)]
        });
    },
};
//# sourceMappingURL=overkill.js.map