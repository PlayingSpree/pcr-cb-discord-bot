const commands_data_list = require('./slash_commands_data.json');
const commands_validator = require('../command_validator.js');

module.exports = {
    registerServer(client, interaction) {
        for (const command of commands_data_list) {
            client.api.applications(client.user.id).guilds(interaction.guild_id).commands.post({ data: command });
        }
    },
    async handleInteraction(client, interaction) {
        interaction.client = client;
        if (interaction.channel_id) interaction.channel = await client.channels.fetch(interaction.channel_id);
        if (interaction.guild_id) {
            interaction.guild = await client.guilds.fetch(interaction.guild_id);
            interaction.user = await client.users.fetch(interaction.member.user.id);
            interaction.member = await interaction.guild.members.fetch(interaction.user);
            interaction.author = interaction.user;
        }
        else {
            interaction.user = await client.users.fetch(interaction.user.id);
        }

        const command = client.commands.get(interaction.data.name);

        const invalid = commands_validator(command, interaction);
        if (invalid) {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: invalid,
                        flags: 64
                    }
                }
            });
            return;
        }

        await client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: 'กำลังรัน Command...',
                    flags: 64
                }
            }
        });

        console.log('command: ' + interaction.data.name);
        try {
            command.executeSlash(interaction);
        }
        catch (error) {
            console.error(error);
            interaction.channel.send('มีข้อผิดพลาดระหว่างการทำคำสั่ง');
        }
    },
    parseArgs(options) {
        const args = {};
        while (options !== undefined) {
            if (options[0].type < 3) {
                options = options.options;
            }
            else {
                for (const option of options) {
                    args[option.name] = option.value;
                }
                break;
            }
        }
        return args;
    }
};