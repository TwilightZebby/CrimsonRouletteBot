let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'reset',
    description: 'Resets the Tokens and Levels back to zero (0) for all the Users of this Server **OR** just one User',
    usage: '<all|@user>',
    //aliases: [''],
    args: true,
    commandType: 'management',
    guildOwnerOnly: true,
    async execute(message, args) {

      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
      const resetEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Reset');


      // Only the Guild Owner can use this command (and myself)
      if ( message.author.id !== message.guild.ownerID || message.author.id !== "156482326887530498" ) {
        resetEmbed.setTitle(`Something went wrong....`);
        resetEmbed.setDescription(`Sorry, but only the Guild/Server Owner can use this command!`);
        return message.channel.send(resetEmbed);
      }


      let resetChoice = args.shift();








      if ( resetChoice === "all" ) {

        resetEmbed.setTitle(`Confirmation`);
        resetEmbed.setDescription(`This will set all the Tokens and Levels of each User currently in this Server back to Zero (0). Including yourself.\nAre you sure you want to do this?\n**Send \`yes\` to confirm**`);
        message.channel.send(resetEmbed);


        let filter = m => m.content.includes("yes");
        let confirmCollector = message.channel.createMessageCollector(filter, { time: 10000 })
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

      }
      else {



        // Check a User mention was sent
        function getUserFromMention(mention) {
          const matches = mention.match(/^<@!?(\d+)>$/);
          // The id is the first and only match found by the RegEx.
          // However the first element in the matches array will be the entire mention, not just the ID,
          // so use index 1.

          // Check for if it does exist or not
          if ( !matches ) {
            return "invalid";
          } else {
            const id = matches[1];
  
            return message.client.users.resolve(id);
          }
        }


        let userReset = getUserFromMention(resetChoice);

        if ( userReset === "invalid" ) {
          return message.reply(`Sorry, but that was neither \`all\` or a valid \`@user\` mention. Please try again...`);
        }





        // RESET JUST THAT USER

        resetEmbed.setTitle(`Confirmation`);
        resetEmbed.setDescription(`This will set the Tokens and Levels of ${userReset} back to Zero (0).\nAre you sure you want to do this?\n**Send \`yes\` to confirm**`);
        message.channel.send(resetEmbed);
        
        
        let filter = m => m.content.includes("yes");
        let confirmCollector = message.channel.createMessageCollector(filter, { time: 10000 })
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
        
        
          let guildDB = await GuildLevels.update( { userTokens: 0, userLevel: 0 }, { where: { guildID: message.guild.id, userID: userReset.id } } )
          .catch(e => { 
            console.error(e);
            resetEmbed.setTitle(`Something went wrong...`);
            resetEmbed.setDescription(`There was an error fetching ${userReset}'s Levels. Please try again later.`);
            return message.channel.send(resetEmbed);
          });
        
        
          if (guildDB) {
            resetEmbed.setTitle(`Successfully Reset ${userReset.username} Levels`);
            resetEmbed.setDescription(`Levels and Tokens for ${userReset} have been set back to Zero (0)!`);
            return message.channel.send(resetEmbed);
          }
        
          
        }

      }


      
      

      //END OF COMMAND
    },
};
