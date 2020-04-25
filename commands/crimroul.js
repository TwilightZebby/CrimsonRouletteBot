let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles } = require('../bot_modules/tables.js');
const LEVELS = require('../bot_modules/levels.json');
const Discord = require("discord.js");
const Chance = require("chance");
let chance = new Chance();
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'cr',
    description: `The same as the standard Roulette - but featuring more risky results! *Has the chance of affecting multiple Server Members!*`,
    usage: '<bet>',
    //aliases: ['crim', 'crimsonroulette', 'cr'],
    args: true,
    guildOnly: true,
    cooldown: 21600, // 6 Hours
    commandType: 'roulette',
    async execute(message, args) {

      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
      const roulEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Crimson Roulette');

      // Check that the Guild's settings have this enabled
      let gConfig = await ConfigData.findOrCreate({ where: { guildID: message.guild.id } })
      .catch(e => { 
        console.error(e);
        roulEmbed.setTitle(`Something went wrong...`);
        roulEmbed.setDescription(`There was an error fetching ${message.guild.name} Config Data. Please try again later.`);
        return message.channel.send(roulEmbed);
      });

      if ( gConfig[0].crimRoul === false ) {
        roulEmbed.setTitle(`🚫 Command Disabled`);
        roulEmbed.setDescription(`Sorry, but the Owner of this Server has disabled use of both Roulette commands...`);
        return message.channel.send(roulEmbed);
      } else if ( gConfig[0].riskyRoul === false ) {
        roulEmbed.setTitle(`🚫 Command Disabled`);
        roulEmbed.setDescription(`Sorry, but the Owner of this Server has disabled use of this command...`);
        return message.channel.send(roulEmbed);
      }







      
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
        ['nothing', 'lose', 'win10', 'win50', 'win100', 'win200', 'winlevel', 'win3levels', 'lose10', 'lose50', 'lose100', 'lose200', 'loselevel', 'lose3levels',
         '2win', '2lose', '2windouble', '2losedouble', '2winlevel', '2loselevel', '5win', '5lose', '5windouble', '5losedouble', '5loselevel', '5winlevel',
         '25win', '25lose', '25winsdouble', '25losedouble', '25winslevel', '25loselevels', '50wins', '50lose', '50winsdouble', '50losedouble',
         '50winslevel', '50loselevel', 'serverwinslevel', 'serverloselevel', 'serverwinslevel3', 'serverloselevel3',
         'serverwinslevel5', 'serverloselevel5', 'serverlosehalflevels'], 
        [90, 85, 84, 50, 17, 5, 1, 0.5, 50, 25, 20, 5, 1, 0.1,
         15, 14, 8, 7, 3, 2, 5, 4, 2, 1, 2, 1,
         3, 2, 2, 1, 1.6, 1.4, 1.4, 1.2, 1, 0.8,
         0.6, 0.5, 0.4, 0.3, 0.2, 0.1,
         0.1, 0.01, 0.000000001]
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

      roulEmbed.setTitle(`${message.member.displayName} spun the Crimson Roulette!`);
      let lvlValue;
      let tenPercent;
      let fiftyPercent;
      let hundredPercent;
      let twoHundredPercent;
      let newTokens;
      let lostTokens;
      let display;
      let ranMemberDB;
      let memberArray = [];
      let memberCount;
      let tempMemberObj;


      // Store of all the Guild's Members
      let memberStore = message.guild.members.cache;
      memberStore = Array.from(memberStore.values());
      let randomNumber;
      //randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
      let randomMember;
      randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
      randomMember = await memberStore[randomNumber];




      switch ( result ) {

        case "serverlosehalflevels":
          // ALL of server loses HALF their current Level
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            lvlValue = lvls[Math.floor(ranMemberDB[0].userLevel / 2)];
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to lose **half their current levels!**`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "serverloselevel5":
          // ALL of server loses 5 Levels
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            if ( ( ranMemberDB[0].userLevel - 5 ) < 0 ) {
              lvlValue = lvls[0];
            } else {
              lvlValue = lvls[ranMemberDB[0].userLevel - 5];
            }
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to lose 5 levels!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "serverwinslevel5":
          // ALL of server wins 5 Levels
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            lvlValue = lvls[ranMemberDB[0].userLevel + 5];
            newTokens = lvlValue - ranMemberDB[0].userTokens;

            await functFile.RecalculateMember("add", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to win 5 levels!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "serverloselevel3":
          // ALL of server loses 3 Levels
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            if ( ( ranMemberDB[0].userLevel - 3 ) < 0 ) {
              lvlValue = lvls[0];
            } else {
              lvlValue = lvls[ranMemberDB[0].userLevel - 3];
            }
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to lose 3 levels!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "serverwinslevel3":
          // ALL of server wins 3 Levels
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            lvlValue = lvls[ranMemberDB[0].userLevel + 3];
            newTokens = lvlValue - ranMemberDB[0].userTokens;

            await functFile.RecalculateMember("add", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to win 3 levels!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "serverloselevel":
          // ALL of server loses a Level
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            if ( ( ranMemberDB[0].userLevel - 1 ) < 0 ) {
              lvlValue = lvls[0];
            } else {
              lvlValue = lvls[ranMemberDB[0].userLevel - 1];
            }
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to lose a level!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;



        case "serverwinslevel":
          // ALL of server wins a Level
          memberCount = message.guild.memberCount;
          for ( let i = 0; i < memberCount; i++ ) {
            tempMemberObj = await memberStore[i];

            if ( tempMemberObj.user.bot === true ) {
              continue;
            }

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, tempMemberObj.id, GuildLevels);
            lvlValue = lvls[ranMemberDB[0].userLevel + 1];
            newTokens = lvlValue - ranMemberDB[0].userTokens;

            await functFile.RecalculateMember("add", newTokens.toFixed(), tempMemberObj, ConfigData, GuildLevels, message, roulEmbed);

          }

          roulEmbed.setDescription(`...and caused *everyone on this server* to win a level!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;



        case "50loselevel":
          // 50% of server loses a level
          memberCount = Math.ceil(message.guild.memberCount / 2);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
            if ( ( ranMemberDB[0].userLevel - 1 ) < 0 ) {
              lvlValue = lvls[0];
            } else {
              lvlValue = lvls[ranMemberDB[0].userLevel - 1];
            }
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }

          // Author Levels
          if ( ( authorDB[0].userLevel - 1 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[authorDB[0].userLevel - 1];
          }
          newTokens = authorDB[0].userTokens - lvlValue;
          await functFile.RecalculateAuthor("minus", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and ${memberCount} to lose a level!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "50winslevel":
          // 50% of server wins a Level
          memberCount = Math.ceil(message.guild.memberCount / 2);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
            lvlValue = lvls[ranMemberDB[0].userLevel + 1];
            newTokens = lvlValue - ranMemberDB[0].userTokens;

            await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }

          // Author Levels
          lvlValue = lvls[authorDB[0].userLevel + 1];
          newTokens = lvlValue - authorDB[0].userTokens;
          await functFile.RecalculateAuthor("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and ${memberCount} others to win a level!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "50losedouble":
          // 50% of server loses double Author's Bet
          newTokens = bet * 2
          memberCount = Math.ceil(message.guild.memberCount / 2);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          await functFile.RecalculateAuthor("minus", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          
          roulEmbed.setDescription(`...and loses double their Bet! Additionally, ${memberCount} others also loses ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "50winsdouble":
          // 50% of server wins double Author's Bet
          newTokens = bet * 2
          memberCount = Math.ceil(message.guild.memberCount / 2);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          await functFile.RecalculateAuthor("add", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          
          roulEmbed.setDescription(`...and win double their Bet! Additionally, ${memberCount} others also wins ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "50lose":
          // 50% of the server loses Author's Bet
          memberCount = Math.ceil(message.guild.memberCount / 2);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("minus", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          
          roulEmbed.setDescription(`...and lost their Bet! Additionally, ${memberCount} others also loses ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "50wins":
          // 50% of the server wins Author's Bet
          memberCount = Math.ceil(message.guild.memberCount / 2);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("add", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          
          roulEmbed.setDescription(`...and won their Bet back! Additionally, ${memberCount} others also gets ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "25loselevels":
          // 25% of server loses a level
          memberCount = Math.ceil(message.guild.memberCount / 4);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
            if ( ( ranMemberDB[0].userLevel - 1 ) < 0 ) {
              lvlValue = lvls[0];
            } else {
              lvlValue = lvls[ranMemberDB[0].userLevel - 1];
            }
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }

          // Author Levels
          if ( ( authorDB[0].userLevel - 1 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[authorDB[0].userLevel - 1];
          }
          newTokens = authorDB[0].userTokens - lvlValue;
          await functFile.RecalculateAuthor("minus", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and ${memberCount} to lose a level!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "25winslevel":
          // 25% of server wins a Level
          memberCount = Math.ceil(message.guild.memberCount / 4);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
            lvlValue = lvls[ranMemberDB[0].userLevel + 1];
            newTokens = lvlValue - ranMemberDB[0].userTokens;

            await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }

          // Author Levels
          lvlValue = lvls[authorDB[0].userLevel + 1];
          newTokens = lvlValue - authorDB[0].userTokens;
          await RecalculateAuthor("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and ${memberCount} others to win a level!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "25losedouble":
          // 25% of server loses double Author's Bet
          newTokens = bet * 2
          memberCount = Math.ceil(message.guild.memberCount / 4);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          await functFile.RecalculateAuthor("minus", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          
          roulEmbed.setDescription(`...and loses double their Bet! Additionally, ${memberCount} others also loses ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "25winsdouble":
          // 25% of server wins double Author's Bet
          newTokens = bet * 2
          memberCount = Math.ceil(message.guild.memberCount / 4);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          await functFile.RecalculateAuthor("add", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          
          roulEmbed.setDescription(`...and win double their Bet! Additionally, ${memberCount} others also wins ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "25lose":
          // 25% of the server loses Author's Bet
          memberCount = Math.ceil(message.guild.memberCount / 4);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("minus", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          
          roulEmbed.setDescription(`...and lost their Bet! Additionally, ${memberCount} others also loses ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "25win":
          // 25% of the server wins Author's Bet
          memberCount = Math.ceil(message.guild.memberCount / 4);
          for ( let i = 0; i < memberCount; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("add", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          }
          
          roulEmbed.setDescription(`...and won their Bet back! Additionally, ${memberCount} others also gets ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "5winlevel":
          // Author + 5 random Members wins a level
          for ( let i = 0; i < 5; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
            lvlValue = lvls[ranMemberDB[0].userLevel + 1];
            newTokens = lvlValue - ranMemberDB[0].userTokens;

            await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

            memberArray.push(`\<\@` + randomMember.id + `\>`);

          }

          // Author Levels
          lvlValue = lvls[authorDB[0].userLevel + 1];
          newTokens = lvlValue - authorDB[0].userTokens;
          await functFile.RecalculateAuthor("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and ${memberArray.join(' ')} to win a level!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "5loselevel":
          // Author + 5 random Members loses a level
          for ( let i = 0; i < 5; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
            if ( ( ranMemberDB[0].userLevel - 1 ) < 0 ) {
              lvlValue = lvls[0];
            } else {
              lvlValue = lvls[ranMemberDB[0].userLevel - 1];
            }
            newTokens = ranMemberDB[0].userTokens - lvlValue;

            await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

            memberArray.push(`\<\@` + randomMember.id + `\>`);

          }

          // Author Levels
          if ( ( authorDB[0].userLevel - 1 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[authorDB[0].userLevel - 1];
          }
          newTokens = authorDB[0].userTokens - lvlValue;
          await functFile.RecalculateAuthor("minus", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and ${memberArray.join(' ')} to lose a level!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "5losedouble":
          // Author + 5 random Members loses double Bet
          newTokens = bet * 2
          // Grab 5 random members and take Tokens from them
          for ( let i = 0; i < 5; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

            memberArray.push(`\<\@` + randomMember.id + `\>`);

          }
          await functFile.RecalculateAuthor("add", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          
          roulEmbed.setDescription(`...and loses double their Bet! Additionally, ${memberArray.join(' ')} also loses ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "5windouble":
          // Author + 5 random Members wins double Bet
          newTokens = bet * 2
          // Grab 5 random members and give Tokens to them
          for ( let i = 0; i < 5; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

            memberArray.push(`\<\@` + randomMember.id + `\>`);

          }
          await functFile.RecalculateAuthor("add", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          
          roulEmbed.setDescription(`...and win double their Bet! Additionally, ${memberArray.join(' ')} also wins ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "5lose":
          // Author + 5 random Members loses Bet
          // Grab 5 random members and take Tokens from them
          for ( let i = 0; i < 5; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("minus", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

            memberArray.push(`\<\@` + randomMember.id + `\>`);

          }
          
          roulEmbed.setDescription(`...and lost their Bet! Additionally, ${memberArray.join(' ')} also loses ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "5win":
          // Author + 5 random Members wins Bet (back)
          // Grab 5 random members and throw Tokens at them
          for ( let i = 0; i < 5; i++ ) {

            do {
              randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
              randomMember = await memberStore[randomNumber];
            } while ( randomMember.user.bot === true );

            await functFile.RecalculateMember("add", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

            memberArray.push(`\<\@` + randomMember.id + `\>`);

          }
          
          roulEmbed.setDescription(`...and won their Bet back! Additionally, ${memberArray.join(' ')} also gets ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "2loselevel":
          // Author + 1 random member loses a level
          do {
            randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
            randomMember = await memberStore[randomNumber];
          } while ( randomMember.user.bot === true );

          // Author Levels
          if ( ( authorDB[0].userLevel - 1 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[authorDB[0].userLevel - 1];
          }
          newTokens = authorDB[0].userTokens - lvlValue;
          await functFile.RecalculateAuthor("minus", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          // Member's Levels
          ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
          if ( ( ranMemberDB[0].userLevel - 1 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[ranMemberDB[0].userLevel - 1];
          }
          newTokens = ranMemberDB[0].userTokens - lvlValue;
          await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and caused themselves and \<\@${randomMember.id}\> to lose a level!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "2winlevel":
          // Author + 1 random member wins a free level up
          do {
            randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
            randomMember = await memberStore[randomNumber];
          } while ( randomMember.user.bot === true );

          // Author Levels
          lvlValue = lvls[authorDB[0].userLevel + 1];
          newTokens = lvlValue - authorDB[0].userTokens;
          await functFile.RecalculateAuthor("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);

          // Member's Levels
          ranMemberDB = await functFile.fetchMemberLevels(message.guild.id, randomMember.id, GuildLevels);
          lvlValue = lvls[ranMemberDB[0].userLevel + 1];
          newTokens = lvlValue - ranMemberDB[0].userTokens;
          await functFile.RecalculateMember("add", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);

          roulEmbed.setDescription(`...and won a free level up for themselves and \<\@${randomMember.id}\>!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;



        case "2losedouble":
          // Author + 1 random member loses double Bet
          newTokens = bet * 2;
          do {
            randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
            randomMember = await memberStore[randomNumber];
          } while ( randomMember.user.bot === true );

          await functFile.RecalculateAuthor("minus", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          await functFile.RecalculateMember("minus", newTokens.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and lost double their Bet for themselves and \<\@${randomMember.id}\>! They both lose ${newTokens.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "2windouble":
          // Author + 1 random member wins double Bet
          display = bet * 2;
          do {
            randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
            randomMember = await memberStore[randomNumber];
          } while ( randomMember.user.bot === true );

          await functFile.RecalculateAuthor("add", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          await functFile.RecalculateMember("add", display.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won double their Bet for themselves and \<\@${randomMember.id}\>! They both get ${display.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "2lose":
          // Author + 1 random member loses Bet
          do {
            randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
            randomMember = await memberStore[randomNumber];
          } while ( randomMember.user.bot === true );

          await functFile.RecalculateAuthor("minus", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          await functFile.RecalculateMember("minus", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and lost their Bet of ${bet.toFixed()} Tokens! This bad luck also spread causing \<\@${randomMember.id}\> to lose ${bet.toFixed()} Tokens as well!`);
          roulEmbed.setColor('#ab0202'); // Red
          message.channel.send(roulEmbed);
          break;


        case "2win":
          // Author + 1 random Member wins Bet (back)
          do {
            randomNumber = Math.floor( ( Math.random() * memberStore.length ) + 0 );
            randomMember = await memberStore[randomNumber];
          } while ( randomMember.user.bot === true );

          // Since we're not actually doing anything to Author's Tokens, just give the randomMember the Bet's amount
          functFile.RecalculateMember("add", bet.toFixed(), randomMember, ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won their Bet back! Additionally, \<\@${randomMember.id}\> also gets ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "nothing":
          roulEmbed.setDescription(`\*Sad Trombone Noises\*\nWelp, you landed right in the middle. You neither win nor lose anything...\nYou do, however, get your Bet back though!`);
          roulEmbed.setColor('#34ebde'); // Aqua / Light Blue
          message.channel.send(roulEmbed); 
          break;


        case "lose":
          // Lose entire Bet
          await functFile.RecalculateAuthor("minus", bet.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and lost their Bet of ${bet.toFixed()} Tokens!`);
          roulEmbed.setColor('#ab0202'); // Red
          message.channel.send(roulEmbed);
          break;

        
        case "win10":
          // Win 10% of Bet back ontop of Bet
          tenPercent = bet * 0.1;
          display = bet + tenPercent;

          await functFile.RecalculateAuthor("add", tenPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 110% of their Bet to receive ${display.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b'); // Green
          message.channel.send(roulEmbed);
          break;


        case "win50":
          // Win 50% of bet ontop of bet
          fiftyPercent = bet * 0.5;
          display = bet + fiftyPercent;

          await functFile.RecalculateAuthor("add", fiftyPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 150% of their Bet to receive ${display.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "win100":
          // Win 100% of bet ontop of bet
          hundredPercent = bet * 2;

          await functFile.RecalculateAuthor("add", hundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 200% of their Bet to receive ${hundredPercent.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "win200":
          // Win 200% of bet ontop of bet
          twoHundredPercent = bet * 3;

          await functFile.RecalculateAuthor("add", twoHundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won back 300% of their Bet to receive ${twoHundredPercent.toFixed()} Tokens!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "winlevel":
          // Win a level up
          lvlValue = lvls[authorDB[0].userLevel + 1];
          newTokens = lvlValue - authorDB[0].userTokens;

          await functFile.RecalculateAuthor("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won a level up to Level ${authorDB[0].userLevel + 1}!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "win3levels":
          // Win 3 level ups
          lvlValue = lvls[authorDB[0].userLevel + 3];
          newTokens = lvlValue - authorDB[0].userTokens;

          await functFile.RecalculateAuthor("add", newTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and won 3 level ups to from Level ${authorDB[0].userLevel} to Level ${authorDB[0].userLevel + 3}!!!`);
          roulEmbed.setColor('#1ec74b');
          message.channel.send(roulEmbed);
          break;


        case "lose10":
          // Lose 10% of Bet
          tenPercent = bet * 0.1;

          await functFile.RecalculateAuthor("minus", tenPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses 10% of their Bet!\nFrom their original Bet of ${bet.toFixed()} they recieve ${bet - tenPercent.toFixed()} Tokens back`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose50":
          // Lose 50% of Bet
          fiftyPercent = bet * 0.5;

          await functFile.RecalculateAuthor("minus", fiftyPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses 50% of their Bet!\nFrom their original Bet of ${bet.toFixed()} they receive ${bet - fiftyPercent.toFixed()} Tokens back`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose100":
          // Lose 100% of Bet ontop of losing the Bet itself
          hundredPercent = bet * 2

          await functFile.RecalculateAuthor("minus", hundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses their Bet, twice!\nThey will lose ${hundredPercent.toFixed()} Tokens`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose200":
          // Lose 200% of Bet ontop of losing the Bet itself
          twoHundredPercent = bet * 3;

          await functFile.RecalculateAuthor("minus", twoHundredPercent.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses their Bet, three times!\nThey will lose ${twoHundredPercent.toFixed()} Tokens`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "loselevel":
          // Lose a level
          if ( ( authorDB[0].userLevel - 1 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[authorDB[0].userLevel - 1];
          }
          lostTokens = authorDB[0].userTokens - lvlValue;

          await functFile.RecalculateAuthor("minus", lostTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
          roulEmbed.setDescription(`...and loses an entire Level!\nThey will drop to Level ${authorDB[0].userLevel - 1}`);
          roulEmbed.setColor('#ab0202');
          message.channel.send(roulEmbed);
          break;


        case "lose3levels":
          // Lose 3 Levels
          if ( ( authorDB[0].userLevel - 3 ) < 0 ) {
            lvlValue = lvls[0];
          } else {
            lvlValue = lvls[authorDB[0].userLevel - 3];
          }
          lostTokens = authorDB[0].userTokens - lvlValue;

          await functFile.RecalculateAuthor("minus", lostTokens.toFixed(), ConfigData, GuildLevels, message, roulEmbed);
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
