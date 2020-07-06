let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles, UserBG } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
let functFile = require('../bot_modules/functions.js');




/***************
* To grab the User Mention
***************/
function getUserFromMention(mention, message) {
  const matches = mention.match(/^<@!?(\d+)>$/);
  // The id is the first and only match found by the RegEx.
  // However the first element in the matches array will be the entire mention, not just the ID,
  // so use index 1.
  const id = matches[1];

  return message.client.users.resolve(id);
}












module.exports = {
    name: 'developer',
    description: 'A bunch of sub-commands for the Bot\'s Developer',
    usage: 'tokens set <amount_of_tokens> <@user>',
    aliases: ['dev'],
    args: true,
    commandType: 'management',
    botDev: true,
    async execute(message, args) {
      
      let firstArg = args[0].toLowerCase();
      switch ( firstArg ) {

        case 'tokens':
        case 'token':
          // Check all Arguments
          if ( args.length !== 4 ) {
            return await message.reply(`Sorry, but there should be exactly for arguments for this sub-command:\n
            \`tokens set <amount> <@user>\``);
          }

          let secondArg = args[1].toLowerCase();
          if ( secondArg !== 'set' ) {
            return await message.reply(`Sorry, but the second argument was invalid. Please try again...`);
          }

          let thirdArg = parseInt(args[2]);
          let user = getUserFromMention(args[3], message);



          let updateDB = await GuildLevels.update( { userTokens: thirdArg.toFixed() }, { where: { guildID: message.guild.id, userID: user.id } })
          .catch(err => { console.error(err); });

          await message.reply(`Successfully set **${user.username}**\'s Token amount to **${thirdArg}** Tokens.`);

          break;


        default:
          await message.reply(`Sorry, that wasn't a valid argument. Please try again...`);
          break;

      }

      //END OF COMMAND
    },
};
