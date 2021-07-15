const { Util } = require('discord.js');
const patchnote = require('../../patchnote.json');

module.exports = {
    name: 'patchnote',
    description: 'แสดง patchnote',
    aliases: ['pn'],
    usage: '[version] แสดงรายละเอียด patchnote ใน version นั้น',
    execute(message, args) {
        let version = patchnote.latest;
        if (args.length > 0) {
            version = args[0];
        }
        else {
            message.channel.send(`แสดง patchnote ใน version ล่าสุด (${version})`);
        }

        if (version in patchnote) {
            return message.channel.send(`**${version}**\n` + patchnote[version]);
        }

        const keys = Object.keys(patchnote).filter(x => x.startsWith(version));
        if (keys.length > 0) {
            const notes = [];
            for (const k of keys) {
                notes.push(`**${k}**\n` + patchnote[k]);
            }
            const messages = Util.splitMessage(notes.join('\n'), { maxLength: 1000 });
            for (const text of messages) {
                message.channel.send(text);
            }
            return;
        }
        return message.channel.send('ไม่พบ patchnote ใน version ที่ท่านใส่');
    }
};