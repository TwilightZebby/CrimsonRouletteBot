let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles, UserBG } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'changelog',
    description: 'Displays the changelog for the latest update to this Bot',
    usage: ' ',
    //aliases: [''],
    //args: true,
    commandType: 'general',
    async execute(message) {
      
      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.2.0 Changelog');

      // Date calculation
      let updateDate = Date.parse("11:30 April 27, 2020");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.2.0 - 27th April 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      let additionArray = [
        `+ Added ability to customise the Bot\'s Prefix on a per-Guild level. Use the \`${PREFIX}prefix\` command to do so.`,
        `+ You can now use \`${PREFIX}config guide\` to quickly see what each config option does without having to go to the top.gg page`,
        `+ Added a confirmation to the \`${PREFIX}config roles / reset\` command. Didn't realise I forgot to do so before, oops!`,
        `+ Added Changelog Command. Yea, this one here!`,
      ];
      
      let changeArray = [
        `• Renamed \`${PREFIX}config levels\` to \`${PREFIX}config roles\`.`,
        `• Tweaked \`reset\` command - you can now use \`all\` option to reset the whole Server\'s Levels, or an \`@mention\` to reset a single User\'s.`,
        `• Timeout cooldown for \`reset\` cmd's confirmations have been extended from 5 seconds to 10 seconds.`
      ];
      
      let removeArray = [];


      updateEmbed.addFields(
        { name: `Additions`, value: additionArray.join(`\n`) },
        { name: `Changes`, value: changeArray.join(`\n`) }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
