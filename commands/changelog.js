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


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.4.5 Changelog');

      // Date calculation
      // YYYY-MM-DD T HH:MM:SS
      // End with "Z" for UTC time
      // For a specific timezone, replace "Z" with "+HH:MM" or "-HH:MM"
      let updateDate = Date.parse("2020-08-17T17:00:00+01:00");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.4.5 - 17th August 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      /*let additionArray = [
        `+ Added a new \`allowMentions\` option in the \`c!prefs\` command - this controls if the Bot should \`@mention\` you in Level Up/Down messages or not.`
      ];*/
      
      let changeArray = [
        `• Fixed bug that prevented the Bot from auto-giving/revoking Roles should you not have a Broadcast channel set in the \`config\` command`,
        `• Corrected non-roulette level down messages`
      ];
      
      /*let removeArray = [
        `- `
      ];*/


      updateEmbed.addFields(
        //{ name: `Additions`, value: additionArray.join(`\n`) },
        { name: `Changes`, value: changeArray.join(`\n`) },
        //{ name: `Removals`, value: removeArray.join(`\n`) }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
