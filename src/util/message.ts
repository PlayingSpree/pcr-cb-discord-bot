import { MessageOptions, MessagePayload, TextChannel } from 'discord.js';

export async function sendTimedMessage(channel: TextChannel, ms: number, content: string | MessagePayload | MessageOptions) {
    const message = await channel.send(content);
    setTimeout(() => message.delete().catch(_ => { }), ms);
}