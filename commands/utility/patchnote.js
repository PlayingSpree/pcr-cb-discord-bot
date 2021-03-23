const patchnote = require('../../patchnote.json');

module.exports = {
    name: 'patchnote',
    description: 'แสดง patchnote',
    aliases: ['pn'],
    usage: '[version] แสดงรายละเอียด patchnote ใน version นั้น',
    execute(message, args) {
        let version = patchnote.latest;
        message.channel.send(`แสดง patchnote ใน version ล่าสุด (${version})`);
        if (args.length > 0) {
            version = args[1];
        }
        const note = patchnote[version];
        if (note !== undefined) {
            message.channel.send(note);
        }
        else {
            message.channel.send('ไม่พบ patchnote ใน version ที่ท่านใส่');
        }
    }
};