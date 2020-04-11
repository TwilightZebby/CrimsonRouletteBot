module.exports = {
    name: 'ping',
    description: 'Pong, divide by 2?',
    usage: ' ',
    commandType: 'general',
    execute(message) {
      //>>>>>>>>>> Return Heartbeat Ping <<<<<<<<<<
      return message.reply(`Pong! \n Your ping is ${message.client.ws.ping.toFixed(2)}ms`);
    },
};
