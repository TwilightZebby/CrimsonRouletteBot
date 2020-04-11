const { PREFIX } = require('../config.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
const { version } = require('../package.json');

module.exports = {
    name: 'info',
    description: 'Displays information about this Bot',
    usage: ' ',
    //aliases: [''],
    //args: true,
    commandType: 'general',
    execute(message) {
      const infoEmbed = new Discord.MessageEmbed().setColor('#07f51b');

      infoEmbed.setTitle(`${client.user.username} Information`);
      infoEmbed.setThumbnail(client.user.displayAvatarURL());
      infoEmbed.addFields(
        { name: `Bot Version`, value: version, inline: true },
        { name: `Discord.JS Version`, value: `V12.1.1`, inline: true },
        { name: `Prefix`, value: PREFIX, inline: true },
        { name: `Top.gg Listing`, value: `[Click here](https://www.example.org/)`, inline: true },
        { name: `Support Server`, value: `[https://discord.gg/hTstSCv](https://discord.gg/hTstSCv)`, inline: true },
        { name: `Invite Link`, value: `[Click to invite me to your server!](https://discordapp.com/oauth2/authorize?client_id=657859837023092746&scope=bot&permissions=268749888)` }
        );

      return message.channel.send(infoEmbed);

      //END OF COMMAND
    },
};
