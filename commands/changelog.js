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


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.4.0 Changelog');

      // Date calculation
      // YYYY-MM-DD T HH:MM:SS
      // End with "Z" for UTC time
      // For a specific timezone, replace "Z" with "+HH:MM" or "-HH:MM"
      let updateDate = Date.parse("2020-06-12T11:10:00+01:00");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.4.0 - 12th June 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      let additionArray = [
        `+ Added a thing only me, the Bot's Developer, can use to reduce the need of turning the Bot off/on again when pushing updates.`,
        `+ Added a pre-command check to see if the Command is limited to Server Owners only or me only. Before, this was *in* the command, now it's *before* the command.`,
        `+ Added 12 new backgrounds for the Rank command.`
      ];
      
      let changeArray = [
        `• Merged both \`tr\` and \`cr\` commands into one, more user-friendly, \`roulette\` command. *If you want the more risky results from the old \`cr\` command, use the \`--risk\` flag in the new command.*`,
        `• Tweaked \`info\` command to use plain-text instead of an \`@mention\` for my Username`,
        `• Help Command now only shows Server-Owner Only commands when a Server Owner uses the command *without any arguments*`,
        `• \`prefs\` command now supports use of the shorthand "bg" to refer to "background".`,
        `• Rank Command's backgrounds now change the colour of the text dependant on the BG selected. Basically, it uses a darker colour if need be for readability`
      ];
      
      let removeArray = [
        `- Removed \`tr\` and \`cr\` commands. Replaced with new \`roulette\` command.`
      ];


      updateEmbed.addFields(
        { name: `Additions`, value: additionArray.join(`\n`) },
        { name: `Changes`, value: changeArray.join(`\n`) },
        { name: `Removals`, value: removeArray.join(`\n`) },
        { name: `UPDATES NOTICE`, value: `*Updates to this Bot may be slowed quite a bit while I work on a rewrite of this Bot (aka v2.0) that will also come with a Web Dashboard. Sorry about that* :)` }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
