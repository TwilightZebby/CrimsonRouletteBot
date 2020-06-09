let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'prefix',
    description: 'Shows the prefix for the bot, or change the prefix',
    usage: '[newPrefix]',
    //aliases: [''],
    //args: true,
    commandType: 'general',
    async execute(message, args) {

      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
      
      const prefixEmbed = new Discord.MessageEmbed().setColor('#07f51b');


      // Show the current Prefix if no args are given
      if ( args.length < 1 ) {
        prefixEmbed.setDescription(`Current Prefix: \`${PREFIX}\` *or* \<\@${client.user.id}\>\n\n*You can change the prefix by using* \`${PREFIX}prefix newPrefix\``);

        return message.channel.send(prefixEmbed);
      }
      // Otherwise, set prefix to first argument
      else {

        // Guild Owner check
        if ( message.author.id !== message.guild.ownerID ) {
          return await message.reply(`Sorry, you cannot change the Prefix as you are not the owner of this Server!`);
        }


        let prefixArg = args.shift();


        // Security
        // Make sure prefix is NO LONGER than 3 characters
        if ( prefixArg.length > 3 ) {
          return await message.reply(`Sorry, but that prefix was too large! (I can only accept Prefixes less than 4 characters long)`);
        }


        let updatePrefix = await ConfigData.update({ prefix: prefixArg }, { where: { guildID: message.guild.id } })
        .catch(err => {
          // console.error(err);
          prefixEmbed.setTitle(`Failed to set prefix`);
          prefixEmbed.setDescription(`Someone went wrong while trying to set the prefix. Please try again later...`);
          return message.channel.send(prefixEmbed);
        });

        prefixEmbed.setTitle(`Successfully set new prefix!`);
        prefixEmbed.setDescription(`The prefix has been changed to \`${prefixArg}\``);
        return message.channel.send(prefixEmbed);

      }
      
      

      //END OF COMMAND
    },
};
