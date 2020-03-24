const { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels } = require('../bot_modules/tables.js');
const LEVELS = require('../bot_modules/levels.json');
const Discord = require("discord.js");
const Chance = require("chance");
let chance = new Chance();

module.exports = {
    name: 'roulette',
    description: `Try your luck with the Token Roulette! Will you earn a free Level Up? Or will you lose a Level? :o\nNote: Your bet uses Tokens, not Levels`,
    usage: '<bet>',
    aliases: ['roul'],
    args: true,
    guildOnly: true,
    //cooldown: 43200, // 12 Hours
    commandType: 'fun',
    async execute(message, args) {
      
      const roulEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Token Roulette');
      let lvls = Object.values(LEVELS);

      // Grab the Levels DB so that we can apply any changes and to prevent Members from betting more Tokens then they have ;)

      // Whole Guild
      let guildDB = await GuildLevels.findAll({ where: { guildID: message.guild.id } })
      .catch(e => { 
        console.error(e);
        roulEmbed.setTitle(`Something went wrong...`);
        roulEmbed.setDescription(`There was an error fetching ${message.guild.name}'s Levels. Please try again later.`);
        return message.channel.send(roulEmbed);
      });

      // Just the Author
      let authorDB = await GuildLevels.findOrCreate({ where: { guildID: message.guild.id, userID: message.author.id } })
      .catch(e => { 
        console.error(e);
        roulEmbed.setTitle(`Something went wrong...`);
        roulEmbed.setDescription(`There was an error fetching ${message.author}'s current Level/Tokens. Please try again later.`);
        return message.channel.send(roulEmbed);
      });



      // Check the inputted Argument
      let bet;
      try {

        bet = parseInt(args.shift());

        if ( bet === NaN || bet === 'NaN' || isNaN(bet) ) {
          throw "Not a Number";
        } else if ( bet === undefined || bet === null ) {
          throw "Non Existant Value";
        }

      } catch (e) {

        roulEmbed.setTitle(`Something went wrong...`);
        roulEmbed.setDescription(`Was that a number? I can't tell...\nPlease try again using only *whole* numbers as your Bet amount! (example: 24, 500, etc, **not** 38.1 or ten!)`);
        return message.channel.send(roulEmbed);

      }

      if ( bet <= 0 ) {

        roulEmbed.setTitle(`Something went wrong...`);
        roulEmbed.setDescription(`...and it wasn't my fault for once!\nI cannot accept a Bet of zero (0) or less. Please try again!`);
        return message.channel.send(roulEmbed);

      }
      else if ( bet > authorDB[0].userTokens ) {

        roulEmbed.setTitle(`WOAH calm down there!`);
        roulEmbed.setDescription(`You cannot bet more then the amount of Tokens you have!\nUse the \`${PREFIX}rank\` command to see your Token amount`);
        return message.channel.send(roulEmbed);

      }



      // Now for the actual Token Roulette
      let result;
      result = chance.weighted(
        ['nothing', 'lose', 'win10', 'win50', 'win100', 'win200', 'winlevel', 'win3levels', 'lose10', 'lose50', 'lose100', 'lose200', 'loselevel', 'lose3levels'], 
        [90, 85, 85, 50, 17, 5, 1, 0.5, 50, 25, 20, 5, 1, 0.1]
      );

      // For random "default" result messages
      let defaultMsgs = [
        `This is awkward. The Roulette kinda....broke off the table... `,
        `[Error 418: Turned into Teapot](https://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol)`,
        `Oops, I couldn\'t spin the Roulette as *someone screamed too loudly*`,
        `\*Insert generic error message here\*`,
        `The Developer ran out of ideas for custom error messages. So, here's an emoji of the 10th Doctor drinking a cuppa! <:Doctor_cuppa:662937404146974741>`
      ];

      let defaultRandom = Math.floor( ( Math.random() * defaultMsgs.length ) + 0 );

      roulEmbed.setTitle(`${message.member.displayName} spun the Token Roulette!`);
      let lvlValue;
      let tenPercent;
      let fiftyPercent;
      let hundredPercent;
      let twoHundredPercent;
      let newTokens;
      let newBet;
      let lostTokens;
      let display;


      switch ( result ) {

        case "nothing":
          roulEmbed.setDescription(`\*Sad Trombone Noises\*\nWelp, you landed right in the middle. You neither win nor lose anything...\nYou do, however, get your Bet back though!`);
          roulEmbed.setColor('#34ebde');
          message.channel.send(roulEmbed); // Aqua / Light Blue
          break;


        case "lose":
          // Lose entire Bet
          await Recalculate("minus", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and lost their Bet of ${bet} Tokens!`);
          roulEmbed.setColor('#ab0202'); // Red
          message.channel.send(roulEmbed);
          break;

        
        case "win10":
          // Win 10% of Bet back ontop of Bet
          tenPercent = bet * 0.1;
          display = bet + tenPercent;

          await Recalculate("add", tenPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 110% of their Bet to receive ${display.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b'); // Green
          message.channel.send(roulEmbed);
          break;


        case "win50":
          // Win 50% of bet ontop of bet
          fiftyPercent = bet * 0.5;
          display = bet + fiftyPercent;

          await Recalculate("add", fiftyPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 150% of their Bet to receive ${display.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "win100":
          // Win 100% of bet ontop of bet
          hundredPercent = bet * 2;

          await Recalculate("add", hundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 200% of their Bet to receive ${hundredPercent.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "win200":
          // Win 200% of bet ontop of bet
          twoHundredPercent = bet * 3;

          await Recalculate("add", twoHundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 300% of their Bet to receive ${twoHundredPercent.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "winlevel":
          // Win a level up
          lvlValue = lvls[authorDB[0].userLevel + 1];
          newTokens = lvlValue - authorDB[0].userTokens;

          await Recalculate("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won a level up to Level ${authorDB[0].userLevel + 1}!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "win3levels":
          // Win 3 level ups
          lvlValue = lvls[authorDB[0].userLevel + 3];
          newTokens = lvlValue - authorDB[0].userTokens;

          await Recalculate("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won 3 level ups to from Level ${authorDB[0].userLevel} to Level ${authorDB[0].userLevel + 3}!!!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "lose10":
          // Lose 10% of Bet
          tenPercent = bet * 0.1;

          await Recalculate("minus", tenPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses 10% of their Bet!\nFrom their original Bet of ${bet.toFixed()} they recieve ${bet - tenPercent.toFixed()} Tokens back`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose50":
          // Lose 50% of Bet
          fiftyPercent = bet * 0.5;

          await Recalculate("minus", fiftyPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses 50% of their Bet!\nFrom their original Bet of ${bet.toFixed()} they receive ${bet - fiftyPercent.toFixed()} Tokens back`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose100":
          // Lose 100% of Bet ontop of losing the Bet itself
          hundredPercent = bet * 2

          await Recalculate("minus", hundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses their Bet, twice!\nThey will lose ${hundredPercent.toFixed()} Tokens`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose200":
          // Lose 200% of Bet ontop of losing the Bet itself
          twoHundredPercent = bet * 3;

          await Recalculate("minus", twoHundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses their Bet, three times!\nThey will lose ${twoHundredPercent.toFixed()} Tokens`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "loselevel":
          // Lose a level
          lvlValue = lvls[authorDB[0].userLevel - 1];
          lostTokens = authorDB[0].userTokens - lvlValue;

          await Recalculate("minus", lostTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses an entire Level!\nThey will drop to Level ${authorDB[0].userLevel - 1}`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose3levels":
          // Lose 3 Levels
          lvlValue = lvls[authorDB[0].userLevel - 1];
          lostTokens = authorDB[0].userTokens - lvlValue;

          await Recalculate("minus", lostTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses 3 whole Levels to drop from Level ${authorDB[0].userLevel} to Level ${authorDB[0].userLevel - 3}!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        default:
          roulEmbed.setTitle(`An unknown error occurred...`);
          roulEmbed.setDescription(defaultMsgs[defaultRandom]);
          message.channel.send(roulEmbed);
          break;

      }

      //roulEmbed.setDescription(`...and it landed on **${result}**`);
      //return message.channel.send(roulEmbed);



      //END OF COMMAND
    },
};















// FUNCTIONS to re-calculate Token and Level Amounts
async function Recalculate(sumMethod, resultAmount, configDB, levelDB, message, roulEmbed) {

  // Fetch the Guild's Config Data AND User's Level Data
  let guildConfig = await configDB.findOrCreate({ where: { guildID: message.guild.id } })
  .catch(e => { 
    console.error(e);
    roulEmbed.setTitle(`Something went wrong...`);
    roulEmbed.setDescription(`There was an error fetching ${message.guild.name} Config Data. Please try again later.`);
    return message.channel.send(roulEmbed);
  });

  let userData = await levelDB.findOrCreate({ where: { guildID: message.guild.id, userID: message.author.id } })
  .catch(e => { 
    console.error(e);
    roulEmbed.setTitle(`Something went wrong...`);
    roulEmbed.setDescription(`There was an error fetching ${message.author}'s current Level/Tokens. Please try again later.`);
    return message.channel.send(roulEmbed);
  });




  resultAmount = parseInt(resultAmount);
  let updateDB;

  if ( sumMethod === "add" ) {


    // Perform operation on Tokens
    let newTokenAmount = userData[0].userTokens + resultAmount;

    updateDB = await levelDB.update( { userTokens: newTokenAmount }, { where: { guildID: message.guild.id, userID: message.author.id } })
    .catch(err => { console.error(err); });


    // Recalculate Levels
    let oldLevel = userData[0].userLevel;
    let ulevel;

    let lvls = Object.values(LEVELS);
    for (let i = 0; i < lvls.length; i++) {

      if (newTokenAmount < lvls[i]) {

        ulevel = i - 1;

        // Level 0 Catch
        if (ulevel < 0) {
          ulevel = 0;
        }

        // Update Database
        updateDB = await levelDB.update({
            userLevel: ulevel
          }, {
            where: {
              guildID: message.guild.id,
              userID: message.author.id
            }
          })
          .catch(err => {
            console.error(err);
          });


        //Check thy Levels
        if (updateDB) {

          i += 99999999; // Breaks out of loop

          if (guildConfig[0].lvlChannel === null || guildConfig[0].lvlChannel === undefined) {
            return;
          } else if (ulevel < oldLevel) {

            let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
            let lvlMessage = guildConfig[0].levelDownMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", ulevel);
            announceChannel.send(lvlMessage + ` <-- **Caused by Roulette Command!**`);

          } else if (ulevel > oldLevel) {

            let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
            let lvlMessage = guildConfig[0].levelUpMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", ulevel);
            announceChannel.send(lvlMessage + ` <-- **Caused by Roulette Command!**`);

          }

        }
      }

    }


  } 
  else if ( sumMethod === "minus" ) {


    // Perform operation on Tokens
    let newTokenAmount = userData[0].userTokens - resultAmount;

    // Check that Token amount doesn't fall below zero (just in case)
    if ( newTokenAmount < 0 ) {
      newTokenAmount = 0;
    }

    updateDB = await levelDB.update( { userTokens: newTokenAmount }, { where: { guildID: message.guild.id, userID: message.author.id } })
    .catch(err => { console.error(err); });


    // Recalculate Levels
    let oldLevel = userData[0].userLevel;
    let ulevel;

    let lvls = Object.values(LEVELS);
    for (let i = 0; i < lvls.length; i++) {

      if (newTokenAmount < lvls[i]) {

        ulevel = i - 1;

        // Level 0 Catch
        if (ulevel < 0) {
          ulevel = 0;
        }

        // Update Database
        updateDB = await levelDB.update({
            userLevel: ulevel
          }, {
            where: {
              guildID: message.guild.id,
              userID: message.author.id
            }
          })
          .catch(err => {
            console.error(err);
          });


        //Check thy Levels
        if (updateDB) {

          i += 99999999; // Breaks out of loop

          if (guildConfig[0].lvlChannel === null || guildConfig[0].lvlChannel === undefined) {
            return;
          } else if (ulevel < oldLevel) {

            let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
            let lvlMessage = guildConfig[0].levelDownMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", ulevel);
            announceChannel.send(lvlMessage + ` <-- **Caused by Roulette Command!**`);

          } else if (ulevel > oldLevel) {

            let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
            let lvlMessage = guildConfig[0].levelUpMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", ulevel);
            announceChannel.send(lvlMessage + ` <-- **Caused by Roulette Command!**`);

          }
        }
      }
    }


  }


  // End of Function
}
