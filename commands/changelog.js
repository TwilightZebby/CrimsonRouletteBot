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


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.4.1 Changelog');

      // Date calculation
      // YYYY-MM-DD T HH:MM:SS
      // End with "Z" for UTC time
      // For a specific timezone, replace "Z" with "+HH:MM" or "-HH:MM"
      let updateDate = Date.parse("2020-06-12T11:10:00+01:00");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.4.1 - 12th June 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      let additionArray = [
        `+ Added a command only me, the Bot\'s Developer, can use for testing purposes`,
        `+ Added a catch for if a Guild/Server is offline due to a Discord Outage (prevents Bot crashes?)`
      ];
      
      let changeArray = [
        `• Tweaked how common/rare the results of the Roulette command are.`
      ];
      
      /*let removeArray = [
        `- `
      ];*/


      updateEmbed.addFields(
        { name: `Additions`, value: additionArray.join(`\n`) },
        { name: `Changes`, value: changeArray.join(`\n`) },
        //{ name: `Removals`, value: removeArray.join(`\n`) },
        { name: `UPDATES NOTICE`, value: `*Updates to this Bot may be slowed quite a bit while I work on a rewrite of this Bot (aka v2.0) that will also come with a Web Dashboard. Sorry about that* :)` }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
