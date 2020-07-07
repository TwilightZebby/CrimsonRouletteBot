// Creating the variables needed
const fs = require('fs'); // Node's native file system
const Discord = require("discord.js"); // Bringing in Discord.js
const { client } = require('./bot_modules/constants.js'); // Brings in the Discord Bot's Client
let { PREFIX, TOKEN, DBLTOKEN } = require('./config.js'); // Slapping the PREFIX and token into their own vars
const { ConfigData, GuildLevels, LevelRoles, UserPrefs } = require('./bot_modules/tables.js'); // Brings in the Databases
const LEVELS = require('./bot_modules/levels.json'); // Brings in the Levels Table
client.commands = new Discord.Collection(); // Extends JS's native map class
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Picks up all the .js files in the commands folder
const cooldowns = new Discord.Collection(); // For Cooldowns to work
const lvlCooldowns = new Discord.Collection(); // For Cooldowns specific to Levelling
// top.gg api stuff
//const DBL = require("dblapi.js");
//const dbl = new DBL(DBLTOKEN, client);
let functFile = require('./bot_modules/functions.js');
const { time } = require('console');

for (const file of commandFiles) { // Slaps all the command files into the Collection
  const command = require(`./commands/${file}`);

  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}





// To make sure the bot is up and running
client.once("ready", async () => {
  // Sync them Databases
  ConfigData.sync();
  GuildLevels.sync();
  LevelRoles.sync();
  UserPrefs.sync();

  client.user.setPresence({
    activity: {
      name: `${PREFIX}help`
    },
    status: 'online'
  });

  client.setInterval(function () {
    client.user.setPresence({
      activity: {
        name: `${PREFIX}help`
      },
      status: 'online'
    });
  }, 1.08e+7);


  console.log("I am ready!");
});



// Debugging
process.on('warning', async (warning) => {

  // Log to console
  console.warn(warning);

  // Log to error log channel
  let errorChannel = client.guilds.resolve('681805468749922308').channels.resolve('726336306497454081');

  return await errorChannel.send(`\`\`\`Warning:\n
  ${warning}
  \`\`\``);

})

// Extra Error Catching
process.on('unhandledRejection', async (error) => {

  // Log to console
  console.error(`Uncaught Promise Rejection:\n`, error);

  // Log to error log channel
  let errorChannel = client.guilds.resolve('681805468749922308').channels.resolve('726336306497454081');

  return await errorChannel.send(`\`\`\`Uncaught Promise Rejection:\n
  ${error.stack}
  \`\`\``);

});


// Discord Error Handling
client.on('error', async (error) => {

  // Log to console
  console.error(error);

  // Log to error log channel
  let errorChannel = client.guilds.resolve('681805468749922308').channels.resolve('726336306497454081');

  return await errorChannel.send(`\`\`\`Discord Error:\n
  ${error.stack}
  \`\`\``);

});


client.on('rateLimit', async (rateLimitInfo) => {

  // Log to Console
  console.warn(rateLimitInfo);

  // Log to error log channel
  let errorChannel = client.guilds.resolve('681805468749922308').channels.resolve('726336306497454081');

  return await errorChannel.send(`\`\`\`Discord Ratelimit Error:\n
  Timeout (ms): ${rateLimitInfo.timeout}
  Limit: ${rateLimitInfo.limit}
  Method: ${rateLimitInfo.method}
  Path: ${rateLimitInfo.path}
  Route: ${rateLimitInfo.route}
  \`\`\``);

});


client.on('warn', async (warning) => {

  // Log to console
  console.warn(warning);

  // Log to error log channel
  let errorChannel = client.guilds.resolve('681805468749922308').channels.resolve('726336306497454081');

  return await errorChannel.send(`\`\`\`Discord Warning:\n
  ${warning}
  \`\`\``);

});



// top.gg error handling
/*dbl.on('error', async (e) => {

  // Log to console
  console.error(`DiscordBotList Error:\n ${e}`);

  // Log to error log channel
  let errorChannel = client.guilds.resolve('681805468749922308').channels.resolve('726336306497454081');

  return await errorChannel.send(`\`\`\`DiscordBotList Error:\n
  ${e}
  \`\`\``);

})*/






























/***********************************************/
// WHEN A NEW MEMBER JOINS A GUILD
//     - Creates a new row in the Levels DB to ensure working functionailty with cmds such as TOP
client.on('guildMemberAdd', async (member) => {

  if (member.user.bot === true) {
    return;
  }

  try {

    let levelDb = await GuildLevels.create({
      guildID: member.guild.id,
      userID: member.id,
    }).catch(console.error);

    let userPrefsDb = await UserPrefs.findOne({
      where: {
        userID: member.id
      }
    }).catch(console.error);

    if (!userPrefsDb) {
      userPrefsDb = await UserPrefs.create({
        userID: member.id,
      }).catch(console.error);
    }

  } catch (e) {

    return console.error(e);

  }

  // End of guildMemberAdd Event
});

















/***********************************************/
// WHEN A MEMBER LEAVES A GUILD
//     - To delete them from the Levels DB to make sure they don't pollute the Leaderboard(s)
client.on('guildMemberRemove', async (member) => {

  if (member.user.bot === true) {
    return;
  }

  let levelDelete = await GuildLevels.destroy({
      where: {
        guildID: member.guild.id,
        userID: member.id
      }
    })
    .catch(err => console.error(err));


  // End of guildMemberRemove Event
});

















/***********************************************/
// WHEN BOT JOINS A GUILD
//     - Create Guild's entries into ConfigData Database
//     - Log Guild Name/Icon to me
client.on('guildCreate', async (guild) => {

  // Add Guild to Config Database
  try {

    const guildConfig = await ConfigData.create({
      guildID: guild.id,
      guildName: guild.name,
      // Other values default to the default ones set in /bot_modules/tables.js
    });

    // Add each Member to Levelling DB to get this Bot working on VPS
    let memStore = Array.from(guild.members.cache.values());
    // Filter out Bots
    for (let i = 0; i < memStore.length; i++) {
      if (memStore[i].user.bot === true) {

        memStore.splice(i, 1);

      }
    }

    // Now loop to add actual Members to the Levelling DB
    let memLvlDB;
    for (let i = 0; i < memStore.length; i++) {

      memLvlDB = await GuildLevels.create({
        guildID: guild.id,
        userID: memStore[i].id,
        // Other values default to 0
      }).catch(console.error);

    }

    // Loop to add all users to UserPrefs
    let userPrefsDB;
    for (let i = 0; i < memStore.length; i++) {

      // Check if User already exists
      userPrefsDB = await UserPrefs.findOne({
        where: {
          userID: memStore[i].id
        }
      }).catch(console.error);

      if (!userPrefsDB) {

        // If doesn't already exist, add to DB
        userPrefsDB = await UserPrefs.create({
          userID: memStore[i].id,
          // Other values have defaults
        }).catch(console.error);

      }

    }

  } catch (e) {

    // Catch errors
    console.error(e);

  }





  // LOG
  let logChannel = client.guilds.resolve('681805468749922308').channels.resolve('718720727829708811');
  const logEmbed = new Discord.MessageEmbed().setColor('#33db00');

  // Grab Guild Info
  let guildName = guild.name;
  let guildOwner = guild.owner; // Returns Member Object
  let guildIcon = guild.iconURL();
  let guildMemberCount = Array.from(guild.members.cache.values()).filter(member => {
    return !member.user.bot;
  }).length;
  let guildBotCount = Array.from(guild.members.cache.values()).filter(member => {
    return member.user.bot;
  }).length;
  let guildID = guild.id;
  // Amount of Servers this Bot is in
  let botGuildAmount = Array.from(client.guilds.cache.values()).length;

  // Construct Embed
  logEmbed.setTitle(`Joined a new Guild!`)
  .addFields(
    { name: `Guild Name`, value: guildName },
    { name: `Guild Owner`, value: `${guildOwner.user.username}\#${guildOwner.user.discriminator}` },
    { name: `Member Count`, value: guildMemberCount },
    { name: `Bot Count`, value: guildBotCount, inline: true },
    { name: `Guild's ID`, value: guildID }
  )
  .setThumbnail(guildIcon)
  .setFooter(`${client.user.username} is in ${botGuildAmount} Guilds`);

  return await logChannel.send(logEmbed);



  // End of guildCreate Event
});

















/***********************************************/
// WHEN BOT LEAVES A GUILD
//    - Delete all Database entries for that Guild
//    - Log Guild Name/Icon to me
client.on('guildDelete', async (guild) => {

  // Grab the Guild's ID and delete all entries in the Database for it
  const configDelete = await ConfigData.destroy({
      where: {
        guildID: guild.id
      }
    })
    .catch(err => console.error(`ERROR: Something happened. - index.js guildDelete - \n${err}`));


  const levelDelete = await GuildLevels.destroy({
      where: {
        guildID: guild.id
      }
    })
    .catch(err => console.error(`ERROR: Something happened. - index.js levelDelete - \n${err}`));


  const roleDelete = await LevelRoles.destroy({
      where: {
        guildID: guild.id
      }
    })
    .catch(err => console.error(`ERROR: Something happened. - index.js roleDelete - \n${err}`));






  // LOG
  let logChannel = client.guilds.resolve('681805468749922308').channels.resolve('718720727829708811');
  const logEmbed = new Discord.MessageEmbed().setColor('#800000');

  // Grab Guild Info
  let guildName = guild.name;
  let guildOwner = guild.owner; // Returns Member Object
  let guildIcon = guild.iconURL();
  let guildMemberCount = Array.from(guild.members.cache.values()).filter(member => {
    return !member.user.bot;
  }).length;
  let guildBotCount = Array.from(guild.members.cache.values()).filter(member => {
    return member.user.bot;
  }).length;

  // Construct Embed
  logEmbed.setTitle(`Left a Guild`)
  .addFields(
    { name: `Guild Name`, value: guildName },
    { name: `Guild Owner`, value: `${guildOwner.user.username}\#${guildOwner.user.discriminator}` },
    { name: `Member Count`, value: guildMemberCount },
    { name: `Bot Count`, value: guildBotCount, inline: true }
  )
  .setThumbnail(guildIcon);

  return await logChannel.send(logEmbed);


});
















/***********************************************/
// THE COMMANDS
// Runs whenever a message is sent in a command the Bot has access to
// Also where Levels and Tokens are given/calculated

client.on("message", async (message) => {

  // Prevent DM Usage ;P
  if (message.channel.type === 'dm') {
    return;
  }

  // If the msg it was sent by the bot itself - STOP
  if (message.author.bot) {
    return;
  }










  let botMember = message.guild.members.resolve('657859837023092746');

  let readMsg = botMember.hasPermission('VIEW_CHANNEL', {
    checkAdmin: true
  });
  let sendMsg = botMember.hasPermission('SEND_MESSAGES', {
    checkAdmin: true
  });

  if (readMsg === false || sendMsg === false) {
    let guildOwner = message.guild.owner;
    let goDM = await guildOwner.createDM();
    goDM.send(`Buzz! It would seem I don't have **Read Messages**, **View Channels**, and/or the **Send Messages** permission in *${message.guild.name}*!\nI'd be a pretty useless Bot without those permissions!`);
  }



  // IS THERE A DISCORD OUTAGE AFFECTING THIS GUILD OR NOT
  if ( !message.guild.available ) {
    return;
  }







  // PREFIX CHECK
  PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);


  // If there is NO PREFIX, do the Levelling Stuff
  if (!prefixRegex.test(message.content)) {

    let userObj = message.author;
    let memberObj = message.member;



    // First, grab the Databases
    let dbConfig = await ConfigData.findOrCreate({
        where: {
          guildID: message.guild.id
        }
      })
      .catch(e => {
        console.error(`Error searching for ConfigData - index.js dbConfig -\n${e}`)
      });

    let dbLevels = await GuildLevels.findOrCreate({
        where: {
          guildID: message.guild.id,
          userID: userObj.id
        }
      })
      .catch(e => {
        console.error(`Error searching for LevelData - index.js dbLevels -\n${e}`)
      });





    // If Levelling is disabled, RETURN
    if (dbConfig[0].tokenLevels === false) {
      return;
    }


    // Cooldown Stuff
    // To prevent spamming to gain Tokens
    if (!lvlCooldowns.has(userObj.id)) {
      lvlCooldowns.set(userObj.id, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = lvlCooldowns.get(userObj.id);
    const cooldownAmount = 3500;

    if (timestamps.has(userObj.id)) {
      const expirationTime = timestamps.get(userObj.id) + cooldownAmount;

      if (now < expirationTime) {
        //const timeLeft = (expirationTime - now) / 1000;
        return;
      }
    } else {
      timestamps.set(userObj.id, now);
      setTimeout(() => timestamps.delete(userObj.id), cooldownAmount);
    }



    // Calcuate the Tokens that should be given
    let tokenReward = Math.floor((Math.random() * 10) + 2);

    // Add these new Tokens to the Message Author
    let newTokenAmount = dbLevels[0].userTokens + tokenReward;
    // Save to Database
    updateConfig = await GuildLevels.update({
        userTokens: newTokenAmount
      }, {
        where: {
          guildID: message.guild.id,
          userID: message.author.id
        }
      })
      .catch(err => {
        console.error(err);
      });


    let oldULevel = dbLevels[0].userLevel; // Used for comparsion

    let uLevel = 0;

    // Now re-calcuate the Level
    let lvls = Object.values(LEVELS);
    for (let i = 0; i < lvls.length; i++) {

      // Go through the LEVELS Obj, and do a comparsion between the values
      if (newTokenAmount < lvls[i]) {

        // To catch for Level 0
        uLevel = i - 1;
        if (uLevel < 0) {
          uLevel = 0;
        }


        // Save to Database
        updateConfig = await GuildLevels.update({
            userLevel: uLevel
          }, {
            where: {
              guildID: message.guild.id,
              userID: message.author.id
            }
          })
          .catch(err => {
            console.error(err);
          });

        // Check Lvls
        if (updateConfig) {
          i += 99999999; // To make sure Loop is broken out of early

          if (dbConfig[0].lvlChannel === null || dbConfig[0].lvlChannel === undefined) {
            return;
          } else if (uLevel < oldULevel) {

            let announceChannel = message.guild.channels.resolve(dbConfig[0].lvlChannel);
            let lvlMessage = dbConfig[0].levelDownMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", uLevel);

            // Level Role Check
            let roleSearch = await LevelRoles.findOne({
                where: {
                  guildID: message.guild.id,
                  level: uLevel
                }
              })
              .catch(console.error);


            // Fetch all Roles User has
            let userRoles = message.member.roles.cache;
            let matchedRoles = [];


            // See if any of the User's Roles match IDs stored in DB
            for (let i = 0; i < userRoles.length; i++) {
              //console.log(userRoles[i].id);
              let searchForMatch = await LevelRoles.findOne({
                  where: {
                    guildID: message.guild.id,
                    roleID: userRoles[i].id
                  }
                })
                .catch(console.error);

              if (searchForMatch !== undefined || searchForMatch !== null) {

                matchedRoles.push(userRoles[i].id);

              }

            }





            if (roleSearch === null || roleSearch === undefined) {

              // If no stored Roles are found


              // If there is an assigned Role for a lower level, assign that!
              for (let i = uLevel; i >= 0; i--) {

                let newRoleSearch = await LevelRoles.findOne({
                    where: {
                      guildID: message.guild.id,
                      level: i
                    }
                  })
                  .catch(console.error);

                if (newRoleSearch) {

                  let newRoleID = newRoleSearch.roleID;
                  let newRoleObj = message.guild.roles.resolve(newRoleID);
                  let newRoleGrant = await message.member.roles.add(newRoleObj)
                    .catch(console.error);


                  // Remove previous (higher) role
                  let oldRoleSearch = await LevelRoles.findOne({
                      where: {
                        guildID: message.guild.id,
                        level: oldLevel
                      }
                    })
                    .catch(console.error);

                  if (oldRoleSearch) {

                    let oldRoleID = oldRoleSearch.roleID;
                    let oldRoleObj = message.guild.roles.resolve(oldRoleID);
                    let oldRoleRemove = await message.member.roles.remove(oldRoleObj)
                      .catch(console.error);

                  }


                  i = 0;

                }

              }


              return await announceChannel.send(lvlMessage);

            } else {

              // If there is a stored Role
              let roleID = roleSearch.roleID;
              let roleObj = message.guild.roles.resolve(roleID);
              let roleAdd = await message.member.roles.add(roleObj)
                .catch(console.error);


              // Remove any previous Levelling Roles IF ANY
              if (matchedRoles.length > 0) {

                for (let i = 0; i < matchedRoles.length; i++) {

                  let tempRole = matchedRoles[i];
                  let tempRoleObj = message.guild.roles.resolve(tempRole);
                  let roleRemove = await message.member.roles.remove(tempRoleObj)
                    .catch(console.error);

                }


                // If there is an assigned Role for a lower level, assign that!
                for (let i = uLevel; i >= 0; i--) {

                  let newRoleSearch = await LevelRoles.findOne({
                      where: {
                        guildID: message.guild.id,
                        level: i
                      }
                    })
                    .catch(console.error);

                  if (newRoleSearch) {

                    let newRoleID = newRoleSearch.roleID;
                    let newRoleObj = message.guild.roles.resolve(newRoleID);
                    let newRoleGrant = await message.member.roles.add(newRoleObj)
                      .catch(console.error);


                    // Remove previous (higher) role
                    let oldRoleSearch = await LevelRoles.findOne({
                        where: {
                          guildID: message.guild.id,
                          level: oldLevel
                        }
                      })
                      .catch(console.error);

                    if (oldRoleSearch) {

                      let oldRoleID = oldRoleSearch.roleID;
                      let oldRoleObj = message.guild.roles.resolve(oldRoleID);
                      let oldRoleRemove = await message.member.roles.remove(oldRoleObj)
                        .catch(console.error);

                    }


                    i = 0;

                  }

                }



              }


              return await announceChannel.send(lvlMessage);

            }


          } else if (uLevel > oldULevel) {

            let announceChannel = message.guild.channels.resolve(dbConfig[0].lvlChannel);
            let lvlMessage = dbConfig[0].levelUpMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", uLevel);

            // Level Role Check
            let roleSearch = await LevelRoles.findOne({
                where: {
                  guildID: message.guild.id,
                  level: uLevel
                }
              })
              .catch(console.error);

            // Fetch all Roles User has
            let userRoles = message.member.roles.cache;
            let matchedRoles = [];


            // See if any of the User's Roles match IDs stored in DB
            for (let i = 0; i < userRoles.length; i++) {
              //console.log(userRoles[i].id);
              let searchForMatch = await LevelRoles.findOne({
                  where: {
                    guildID: message.guild.id,
                    roleID: userRoles[i].id
                  }
                })
                .catch(console.error);

              if (searchForMatch !== undefined || searchForMatch !== null) {

                matchedRoles.push(userRoles[i].id);

              }

            }




            if (roleSearch === null || roleSearch === undefined) {

              // If no stored Roles are found


              // If there is an assigned Role for a lower level, assign that!
              for (let i = uLevel; i >= 0; i--) {

                let newRoleSearch = await LevelRoles.findOne({
                    where: {
                      guildID: message.guild.id,
                      level: i
                    }
                  })
                  .catch(console.error);

                if (newRoleSearch) {

                  let newRoleID = newRoleSearch.roleID;
                  let newRoleObj = message.guild.roles.resolve(newRoleID);
                  let newRoleGrant = await message.member.roles.add(newRoleObj)
                    .catch(console.error);

                  i = 0;

                }

              }


              return await announceChannel.send(lvlMessage);

            } else {

              // If there is a stored Role
              let roleID = roleSearch.roleID;
              let roleObj = message.guild.roles.resolve(roleID);
              let roleAdd = await message.member.roles.add(roleObj)
                .catch(console.error);


              // Remove any previous Levelling Roles IF ANY
              if (matchedRoles.length > 0) {

                for (let i = 0; i < matchedRoles.length; i++) {

                  let tempRole = matchedRoles[i];
                  let tempRoleObj = message.guild.roles.resolve(tempRole);
                  let roleRemove = await message.member.roles.remove(tempRoleObj)
                    .catch(console.error);

                }

              }

              return await announceChannel.send(lvlMessage);

            }

          }

        }


      }

    }



  }

























  if (prefixRegex.test(message.content)) {

    // COMMANDS

    // Slides the PREFIX off the command
    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    // Slaps the cmd into its own var
    const commandName = args.shift().toLowerCase();
    // If there is NOT a command with the given name or aliases, exit early
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;




    // COOLDOWNS
    // If a command has 'cooldown: x,' it will enable cooldown IN SECONDS
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    let cooldownAmount = (command.cooldown || 3) * 1000;


    // OVERRIDE COOLDOWN IF THIS IS TRIGGERED
    // A check for missing parameters
    // If a cmd has 'args: true,', it will throw the error
    // Requires the cmd file to have 'usage: '<user> <role>',' or similar
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
      }

      // Override larger cooldowns
      if (timestamps.has(message.author.id) === false) {
        cooldownAmount = 1000;
      }


      await message.channel.send(reply);
    }



    if (timestamps.has(message.author.id)) {

      // Developer Override
      if ( message.author.id === '156482326887530498' && message.content.includes("--overridecooldown") ) {
        timestamps.delete(message.author.id);
      }
      else {

        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          let timeLeft = (expirationTime - now) / 1000;

          // If greater than 60 Seconds, convert into Minutes
          if (timeLeft > 60 && timeLeft < 3600) {
            timeLeft = timeLeft / 60;
            return await message.reply(`Please wait ${timeLeft.toFixed(1)} more minute(s) before reusing the \`${command.name}\` command.`);
          }
          // If greater than 3600 Seconds, convert into Hours
          else if (timeLeft > 3600) {
            timeLeft = timeLeft / 3600;
            return await message.reply(`Please wait ${timeLeft.toFixed(1)} more hour(s) before reusing the \`${command.name}\` command.`);
          }

          return await message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }

      }      

    } else if ( message.author.id === '156482326887530498' && message.content.includes("--overridecooldown") ) {

      // Blank, I legit don't want a cooldown, but I don't want anything to happen here.
      // and Continue/Break don't work in IF statements, sooooooo

    } else {

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    }






    // A check for if the user ran a command inside DMs
    // if a cmd has 'guildOnly: true,', it won't work in DMs
    if (command.guildOnly && message.channel.type !== 'text') {
      return await message.reply('I can\'t execute that command inside DMs!');
    }

    // A check for if the user ran a command inside Guilds
    // if a cmd has 'dmOnly: true,', it won't work in Guilds
    if (command.dmOnly && message.channel.type !== 'dm') {
      return await message.reply('I can\'t execute that command inside Guilds!')
    }

    // Check if the Command is GuildOwner only or not
    // 'guildOwner: true,'
    if ( command.guildOwner && (message.author.id !== message.guild.ownerID || message.author.id !== '156482326887530498') ) {
      return await message.reply(`Sorry, but only the Server Owner can run this command.`);
    }

    // Check if the Command is botDev only or not
    // 'botDev: true,'
    if ( command.botDev && message.author.id !== '156482326887530498' ) {
      return await message.reply(`Sorry, only the developer of this Bot can run this command.`);
    }

    // A check for missing parameters
    // TO catch from above
    if (command.args && !args.length) {
      return;
    }







    // Check for permissions needed!
    let embedLinks = botMember.hasPermission('EMBED_LINKS', {
      checkAdmin: true
    });
    let attachFiles = botMember.hasPermission('ATTACH_FILES', {
      checkAdmin: true
    });

    if (embedLinks === false && command.name !== 'ping') {
      return await message.reply(`Sorry, but it would seem I don't have the Embed Links permission. I need that for my Embeds!`);
    }
    if (attachFiles === false && command.name === 'rank') {
      return await message.reply(`Sorry, but it would seem I don't have the Attach Files permission. I need that for this command!`);
    }







    // If there is, grab and run that command's execute() function
    try {
      command.execute(message, args);
    } // Any errors are caught here, and thrown back at the User and Console
    catch (error) {
      console.error(error);
      await message.reply('There was an error trying to execute that command!');
    }

  }



  /******************************************************/

});

/***********************************************/
// The token to connect the bot to the Bot Account on Discord
client.login(TOKEN);
