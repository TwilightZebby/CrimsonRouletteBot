let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'reset',
    description: 'Resets the Tokens and Levels back to zero (0) for all the Users of this Server',
    usage: ' ',
    //aliases: [''],
    //args: true,
    commandType: 'management',
    async execute(message) {

      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
      const resetEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Reset');


      // Only the Guild Owner can use this command (and myself)
      if ( message.author.id !== message.guild.ownerID || message.author.id !== "156482326887530498" ) {
        resetEmbed.setTitle(`Something went wrong....`);
        resetEmbed.setDescription(`Sorry, but only the Guild/Server Owner can use this command!`);
        return message.channel.send(resetEmbed);
      }


      resetEmbed.setTitle(`Confirmation`);
      resetEmbed.setDescription(`This will set all the Tokens and Levels of each User currently in this Server back to Zero (0). Including yourself.\nAre you sure you want to do this?\n**Send \`yes\` to confirm**`);
      message.channel.send(resetEmbed);


      let filter = m => m.content.includes("yes");
      let confirmCollector = message.channel.createMessageCollector(filter, { time: 5000 })
      .on('collect', m => confirmCollector.stop())
      .on('end', (collected, reason) => Confirmation(collected, reason));



      async function Confirmation(collected, reason) {

        if ( reason === "time" || reason === "idle" ) {

          resetEmbed.setTitle(`⌛ Timeout Error`);
          resetEmbed.setDescription(`You were too slow I'm afraid. Please try again`);
          return message.channel.send(resetEmbed);

        }

        let collect = collected.array();
        userConfirm = collect[0];

        if ( userConfirm === null ) {
          resetEmbed.setTitle(`An error occurred...`);
          resetEmbed.setDescription(`Please try again`);
          return message.channel.send(resetEmbed);
        } 
        
        //userConfirm = userConfirm.content.toLowerCase();

        if ( !userConfirm.content.includes("yes") ) {
          resetEmbed.setTitle(`Level Reset cancelled`);
          resetEmbed.setDescription(`Since a "yes" was not found, the reset was cancelled.`);
          return message.channel.send(resetEmbed);
        }


        let guildDB = await GuildLevels.update( { userTokens: 0, userLevel: 0 }, { where: { guildID: message.guild.id } } )
        .catch(e => { 
          console.error(e);
          resetEmbed.setTitle(`Something went wrong...`);
          resetEmbed.setDescription(`There was an error fetching ${message.guild.name}'s Levels. Please try again later.`);
          return message.channel.send(resetEmbed);
        });


        if (guildDB) {
          resetEmbed.setTitle(`Successfully Reset Server Database`);
          resetEmbed.setDescription(`All Levels and Tokens of this Server have been set back to Zero (0)!`);
          return message.channel.send(resetEmbed);
        }

        
      }
      

      //END OF COMMAND
    },
};
