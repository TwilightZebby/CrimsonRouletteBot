const { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');

module.exports = {
    name: 'prefix',
    description: 'Shows the prefix for the bot',
    usage: ' ',
    //aliases: [''],
    //args: true,
    commandType: 'general',
    async execute(message) {
      
      const prefixEmbed = new Discord.MessageEmbed().setColor('#07f51b');

      prefixEmbed.setDescription(`Current Prefix: \`${PREFIX}\` *or* \<\@${client.user.id}\>\n\n*The ability to change the Prefix is coming soon!*`);

      return message.channel.send(prefixEmbed);

      //END OF COMMAND
    },
};
