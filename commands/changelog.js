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


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.5.0 Changelog');

      // Date calculation
      // YYYY-MM-DD T HH:MM:SS
      // End with "Z" for UTC time
      // For a specific timezone, replace "Z" with "+HH:MM" or "-HH:MM"
      let updateDate = Date.parse("2020-08-03T10:43:00+01:00");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.5.0 - 3rd August 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      let additionArray = [
        `+ Added a new \`allowMentions\` option in the \`c!prefs\` command - this controls if the Bot should \`@mention\` you in Level Up/Down messages or not.`
      ];
      
      /*let changeArray = [
        `• `
      ];*/
      
      /*let removeArray = [
        `- `
      ];*/


      updateEmbed.addFields(
        { name: `Additions`, value: additionArray.join(`\n`) },
        //{ name: `Changes`, value: changeArray.join(`\n`) },
        //{ name: `Removals`, value: removeArray.join(`\n`) }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
