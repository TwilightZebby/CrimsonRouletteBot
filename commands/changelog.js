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


      const updateEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('v1.2.1 Changelog');

      // Date calculation
      let updateDate = Date.parse("8:17 May 5, 2020");
      updateEmbed.setTimestamp(updateDate);

      

      // Changelog itself
      updateEmbed.setTitle(`v1.2.1 - 5th May 2020`);


      // Variables so that this is easier for me to read in this code form ;P
      //let additionArray = [
      //  `+ `
      //];
      
      let changeArray = [
        `• Fixed incorrect Level Up/Down Messages when caused by a Roulette Command`,
        `• All Command's Cooldowns have had backend tweaks to them. Shouldn't affect you as the User much`,
        `• Lowered the chances of getting negative results from either Roulette Commands by a tiny bit. You shouldn't notice much change`,
        `• Updated \`info\` command to use new \`discord.com\` domain instead of \`discordapp.com\` for Bot's Invite Link`
      ];
      
      //let removeArray = [
      //  `- `
      //];


      updateEmbed.addFields(
        //{ name: `Additions`, value: additionArray.join(`\n`) },
        { name: `Changes`, value: changeArray.join(`\n`) }
        //{ name: `Removals`, value: removeArray.join(`\n`) }
      )

      return message.channel.send(updateEmbed);


      //END OF COMMAND
    },
};
