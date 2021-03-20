module.exports = {
    name: 'ping',
    description: 'แสดงค่า latency',
    execute(message, args) {
        message.channel.send(`🏓Latency: ${Math.round(message.client.ws.ping)}ms`);
    }
};