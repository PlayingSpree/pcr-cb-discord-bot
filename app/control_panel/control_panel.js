// const Discord = require('discord.js');

async function panelArgsGetChannel(channel) {
    channel.send({ content: 'กรุณาเลือก Channel' });
}

module.exports = {
    PanelArg(argType, name, guild) {
        return {
            argType: argType,
            name: name,
            guild: guild
        };
    },
    async getPanelArgs(channel, ...panelArgs) {
        const argsGot = {};
        for (const i of panelArgs) {
            switch (i.argType) {
                case 'channel':
                    argsGot[i.name] = await panelArgsGetChannel(channel);
                    break;
            }
        }
        console.log(argsGot);
        return argsGot;
    }
};