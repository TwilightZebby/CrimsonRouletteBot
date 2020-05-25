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


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.3.0 Changelog');

      // Date calculation
      let updateDate = Date.parse("9:54 May 25, 2020");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.3.0 - 25th May 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      let additionArray = [
        `+ Added \`roles\` command (see below)`
      ];
      
      let changeArray = [
        `• Moved the Leveling Roles Module out of the \`config\` command and into its own command (see above)`
      ];
      
      //let removeArray = [
      //  `- `
      //];


      updateEmbed.addFields(
        { name: `Additions`, value: additionArray.join(`\n`) },
        { name: `Changes`, value: changeArray.join(`\n`) }
        //{ name: `Removals`, value: removeArray.join(`\n`) }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
