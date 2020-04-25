let { PREFIX } = require('../config.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
const { version } = require('../package.json');
const { ConfigData, GuildLevels, LevelRoles } = require('../bot_modules/tables.js');
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'info',
    description: 'Displays information about this Bot',
    usage: ' ',
    //aliases: [''],
    //args: true,
    commandType: 'general',
    async execute(message) {
      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
      const infoEmbed = new Discord.MessageEmbed().setColor('#07f51b');

      let guildCount = Array.from(client.guilds.cache.values()).length;

      infoEmbed.setTitle(`${client.user.username} Information`);
      infoEmbed.setDescription(`These are my stats! If you want my commands, use \`${PREFIX}help\``);
      infoEmbed.addFields(
        { name: `Bot Developer`, value: `\<\@156482326887530498\>`, inline: true },
        { name: `Bot Version`, value: version, inline: true },
        { name: `Discord.JS Version`, value: `V12.2.0`, inline: true },
        { name: `Prefix`, value: PREFIX, inline: true },
        { name: `Guilds`, value: guildCount, inline: true },
        { name: `Top.gg Listing`, value: `[Click here](https://top.gg/bot/657859837023092746)`, inline: true },
        { name: `Support Server`, value: `[Click here](https://discord.gg/hTstSCv)`, inline: true },
        { name: `Invite Link`, value: `[Click here](https://discordapp.com/oauth2/authorize?client_id=657859837023092746&scope=bot&permissions=268487680)`, inline: true }
        );

      return message.channel.send(infoEmbed);

      //END OF COMMAND
    },
};
