// Creating the veraibles needed
const fs = require('fs'); // Node's native file system
const Discord = require("discord.js"); // Bringing in Discord.js
const { client } = require('./bot_modules/constants.js'); // Brings in the Discord Bot's Client
const { PREFIX, TOKEN } = require('./config.js'); // Slapping the PREFIX and token into their own vars
const { ConfigData, GuildLevels, LevelRoles } = require('./bot_modules/tables.js'); // Brings in the Databases
const LEVELS = require('./bot_modules/levels.json'); // Brings in the Levels Table
client.commands = new Discord.Collection(); // Extends JS's native map class
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Picks up all the .js files in the commands folder
const cooldowns = new Discord.Collection(); // For Cooldowns to work
const lvlCooldowns = new Discord.Collection(); // For Cooldowns specific to Levelling

for (const file of commandFiles) { // Slaps all the command files into the Collection
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}





// To make sure the bot is up and running
client.once("ready", () => {
  // Sync them Databases
  ConfigData.sync();
  GuildLevels.sync();
  LevelRoles.sync();

  client.user.setPresence({ activity: { name: `${PREFIX}help` }, status: 'online' });
  console.log("I am ready!");
});



// Debugging
process.on('warning', console.warn);
// Extra Error Catching
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
















/***********************************************/
// WHEN A NEW MEMBER JOINS A GUILD
//     - Creates a new row in the Levels DB to ensure working functionailty with cmds such as TOP
client.on('guildMemberAdd', async (member) => {

  try {

    let levelDb = await GuildLevels.create({
      guildID: member.guild.id,
      userID: member.id,
    });

  } catch (e) {

    return console.error(e);

  }

  // End of guildMemberAdd Event
});

















/***********************************************/
// WHEN A MEMBER LEAVES A GUILD
//     - To delete them from the Levels DB to make sure they don't pollute the Leaderboard(s)
client.on('guildMemberRemove', async (member) => {

  const levelDelete = await GuildLevels.destroy({ where: { guildID: member.guild.id, userID: member.id } })
  .catch(err => console.error(err));
  
  if(!levelDelete) {
    return console.log(`Nothing was deleted for ${member.displayName} upon leaving`);
  }

  // End of guildMemberRemove Event
});

















/***********************************************/
// WHEN BOT JOINS A GUILD
//     - Create Guild's entries into ConfigData Database
client.on('guildCreate', async (guild) => {

  // Add Guild to Config Database
  try {

    const guildConfig = await ConfigData.create({
      guildID: guild.id,
      // Other values default to the default ones set in /bot_modules/tables.js
    });

    // Add each Member to Levelling DB to get this Bot working on VPS
    let memStore = Array.from(guild.members.cache.values());
    // Filter out Bots
    for ( let i = 0; i < memStore.length; i++ ) {
      if ( memStore[i].user.bot === true ) {

        memStore.splice(i, 1);

      }
    }

    // Now loop to add actual Members to the Levelling DB
    let memLvlDB;
    for ( let i = 0; i < memStore.length; i++ ) {

      memLvlDB = await GuildLevels.create({
        guildID: guild.id,
        userID: memStore[i].id,
        // Other values default to 0
      }).catch(console.error);

    }
    
  } catch (e) {

    // Catch errors
    return console.error(e);

  }

  // End of guildCreate Event
});

















/***********************************************/
// WHEN BOT LEAVES A GUILD
//    - Delete all Database entries for that Guild
client.on('guildDelete', async (guild) => {

  // Grab the Guild's ID and delete all entries in the Database for it
  const configDelete = await ConfigData.destroy({ where: { guildID: guild.id } })
  .catch(err => console.error(`ERROR: Something happened. - index.js guildDelete - \n${err}`));
  if(!configDelete) {
    console.log(`Nothing was deleted for ${guild.name} on Guild Leave`);
  }

  const levelDelete = await GuildLevels.destroy({ where: { guildID: guild.id } })
  .catch(err => console.error(`ERROR: Something happened. - index.js levelDelete - \n${err}`));
  if(!levelDelete) {
    console.log(`Nothing was deleted for ${guild.name} on Guild Leave`);
  }

  const roleDelete = await LevelRoles.destroy({ where: { guildID: guild.id } })
  .catch(err => console.error(`ERROR: Something happened. - index.js roleDelete - \n${err}`));
  if (!roleDelete) {
    return console.log(`Nothing was deleted for ${guild.name} on Guild Leave`);
  }

});
















/***********************************************/
// THE COMMANDS
// Runs whenever a message is sent in a command the Bot has access to
// Also where Levels and Tokens are given/calculated

client.on("message", async (message) => {

  // Prevent DM Usage ;P
  if ( message.channel.type === 'dm' ) {
    return;
  }

  // If the msg it was sent by the bot itself - STOP
  if ( message.author.bot ) {
		return;
  }
  















  
  // Sneaky joke things that I'll remove at a later date ;P
  // JOKE THING ONE: Whenever user ChiefLunaMoon posts a message in a Guild that has this Bot, there's a 25% chance of
  //                 this Bot reacting to her message with a cheeky "Luna Shut Up" emoji my best friend made (Tehehehehe)
  if ( message.author.id === '383017585584766977' ) {

    let lunaChance = Math.floor( ( Math.random() * 100 ) + 0 );
    if ( lunaChance <= 5 ) {

      message.react('693205701056790699')
      .catch(console.error);

    }

  }


  // JOKE THING TWO: Whenever one of Dr1fterX's Bots posts a message containing the word "online", and they are in the same Guild as this Bot,
  //                 there's a 75% chance of this Bot reacting to their message with a "Shut Up" emoji (of the 12 Doctor from Doctor Who!) (Hehe)
  let botIDArray = [ '421726280078327808', '531455603017515009', '471723159347920910', '567808751306801162', '595642260947861523', '568031271243218963', '546800707140059137', '610961014351069204' ];
  if ( botIDArray.includes(message.author.id) && message.content.includes("online") ) {

    let stigChance = Math.floor( ( Math.random() * 100 ) + 0 );
    if ( stigChance <= 50 ) {

      message.react('693796947118784594')
      .catch(console.error);

    }

  }















  // PREFIX CHECK
  const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);

  
  // If there is NO PREFIX, do the Levelling Stuff
  if ( !prefixRegex.test(message.content) ) {

    let userObj = message.author;
    let memberObj = message.member;



    // First, grab the Databases
    let dbConfig = await ConfigData.findOrCreate({ where: { guildID: message.guild.id } })
    .catch(e => { console.error(`Error searching for ConfigData - index.js dbConfig -\n${e}`) });

    let dbLevels = await GuildLevels.findOrCreate({ where: { guildID: message.guild.id, userID: userObj.id } })
    .catch(e => { console.error(`Error searching for LevelData - index.js dbLevels -\n${e}`) });





    // If Levelling is disabled, RETURN
    if ( dbConfig[0].tokenLevels === false ) {
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
    let tokenReward = Math.floor( ( Math.random() * 10 ) + 2 );
    
    // Add these new Tokens to the Message Author
    let newTokenAmount = dbLevels[0].userTokens + tokenReward;
    // Save to Database
    updateConfig = await GuildLevels.update( { userTokens: newTokenAmount }, { where: { guildID: message.guild.id, userID: message.author.id } })
    .catch(err => { console.error(err); });


    let oldULevel = dbLevels[0].userLevel; // Used for comparsion

    let uLevel = 0;

    // Now re-calcuate the Level
    let lvls = Object.values(LEVELS);
    for ( let i = 0; i < lvls.length; i++ ) {

      // Go through the LEVELS Obj, and do a comparsion between the values
      if ( newTokenAmount < lvls[i] ) {

        // To catch for Level 0
        uLevel = i - 1;
        if ( uLevel < 0 ) {
          uLevel = 0;
        }

        
        // Save to Database
        updateConfig = await GuildLevels.update( { userLevel: uLevel }, { where: { guildID: message.guild.id, userID: message.author.id } })
        .catch(err => { console.error(err); });

        // Check Lvls
        if ( updateConfig ) {
          i += 99999999; // To make sure Loop is broken out of early

          if ( dbConfig[0].lvlChannel === null || dbConfig[0].lvlChannel === undefined ) {
            return;
          }
          else if ( uLevel < oldULevel ) {

            let announceChannel = message.guild.channels.resolve(dbConfig[0].lvlChannel);
            let lvlMessage = dbConfig[0].levelDownMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", uLevel);

            // Level Role Check
            let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: uLevel } })
            .catch(console.error);


            // Fetch all Roles User has
            let userRoles = message.member.roles.cache;
            let matchedRoles = [];


            // See if any of the User's Roles match IDs stored in DB
            for ( let i = 0; i < userRoles.length; i++ ) {
              console.log(userRoles[i].id);
              let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
              .catch(console.error);

              if ( searchForMatch !== undefined || searchForMatch !== null ) {

                matchedRoles.push(userRoles[i].id);

              }

            }




            
            if ( roleSearch === null || roleSearch === undefined ) {

              // If no stored Roles are found


              // If there is an assigned Role for a lower level, assign that!
              for ( let i = uLevel; i >= 0; i-- ) {

                let newRoleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: i } })
                .catch(console.error);

                if ( newRoleSearch ) {

                  let newRoleID = newRoleSearch.roleID;
                  let newRoleObj = message.guild.roles.resolve(newRoleID);
                  let newRoleGrant = await message.member.roles.add(newRoleObj)
                  .catch(console.error);


                  // Remove previous (higher) role
                  let oldRoleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: oldLevel } })
                  .catch(console.error);

                  if ( oldRoleSearch ) {

                    let oldRoleID = oldRoleSearch.roleID;
                    let oldRoleObj = message.guild.roles.resolve(oldRoleID);
                    let oldRoleRemove = await message.member.roles.remove(oldRoleObj)
                    .catch(console.error);

                  }


                  i = 0;

                }

              }


              return announceChannel.send(lvlMessage);

            } else {

              // If there is a stored Role
              let roleID = roleSearch.roleID;
              let roleObj = message.guild.roles.resolve(roleID);
              let roleAdd = await message.member.roles.add(roleObj)
              .catch(console.error);


              // Remove any previous Levelling Roles IF ANY
              if ( matchedRoles.length > 0 ) {

                for ( let i = 0; i < matchedRoles.length; i++ ) {

                  let tempRole = matchedRoles[i];
                  let tempRoleObj = message.guild.roles.resolve(tempRole);
                  let roleRemove = await message.member.roles.remove(tempRoleObj)
                  .catch(console.error);

                }


                // If there is an assigned Role for a lower level, assign that!
                for ( let i = uLevel; i >= 0; i-- ) {

                  let newRoleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: i } })
                  .catch(console.error);

                  if ( newRoleSearch ) {

                    let newRoleID = newRoleSearch.roleID;
                    let newRoleObj = message.guild.roles.resolve(newRoleID);
                    let newRoleGrant = await message.member.roles.add(newRoleObj)
                    .catch(console.error);


                    // Remove previous (higher) role
                    let oldRoleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: oldLevel } })
                    .catch(console.error);

                    if ( oldRoleSearch ) {

                      let oldRoleID = oldRoleSearch.roleID;
                      let oldRoleObj = message.guild.roles.resolve(oldRoleID);
                      let oldRoleRemove = await message.member.roles.remove(oldRoleObj)
                      .catch(console.error);

                    }


                    i = 0;

                  }

                }



              }


              return announceChannel.send(lvlMessage);

            }


          } 
          else if ( uLevel > oldULevel ) {

            let announceChannel = message.guild.channels.resolve(dbConfig[0].lvlChannel);
            let lvlMessage = dbConfig[0].levelUpMsg;
            lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
            lvlMessage = lvlMessage.replace("levelNum", uLevel);

            // Level Role Check
            let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: uLevel } })
            .catch(console.error);
            
            // Fetch all Roles User has
            let userRoles = message.member.roles.cache;
            let matchedRoles = [];


            // See if any of the User's Roles match IDs stored in DB
            for ( let i = 0; i < userRoles.length; i++ ) {
              console.log(userRoles[i].id);
              let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
              .catch(console.error);

              if ( searchForMatch !== undefined || searchForMatch !== null ) {

                matchedRoles.push(userRoles[i].id);

              }

            }



            
            if ( roleSearch === null || roleSearch === undefined ) {

              // If no stored Roles are found


              // If there is an assigned Role for a lower level, assign that!
              for ( let i = uLevel; i >= 0; i-- ) {

                let newRoleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: i } })
                .catch(console.error);

                if ( newRoleSearch ) {

                  let newRoleID = newRoleSearch.roleID;
                  let newRoleObj = message.guild.roles.resolve(newRoleID);
                  let newRoleGrant = await message.member.roles.add(newRoleObj)
                  .catch(console.error);

                  i = 0;

                }

              }


              return announceChannel.send(lvlMessage);

            } else {

              // If there is a stored Role
              let roleID = roleSearch.roleID;
              let roleObj = message.guild.roles.resolve(roleID);
              let roleAdd = await message.member.roles.add(roleObj)
              .catch(console.error);


              // Remove any previous Levelling Roles IF ANY
              if ( matchedRoles.length > 0 ) {

                for ( let i = 0; i < matchedRoles.length; i++ ) {

                  let tempRole = matchedRoles[i];
                  let tempRoleObj = message.guild.roles.resolve(tempRole);
                  let roleRemove = await message.member.roles.remove(tempRoleObj)
                  .catch(console.error);

                }

              }

              return announceChannel.send(lvlMessage);

            }
            
          }
  
        }

        
      }

    }



  }

























  if ( prefixRegex.test(message.content) ) {

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
    const cooldownAmount = (command.cooldown || 3) * 1000;
   
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
      if (now < expirationTime) {
        let timeLeft = (expirationTime - now) / 1000;
      
        // If greater than 60 Seconds, convert into Minutes
        if ( timeLeft > 60 && timeLeft < 3600 ) {
          timeLeft = timeLeft / 60;
          return message.reply(`Please wait ${timeLeft.toFixed(1)} more minute(s) before reusing the \`${command.name}\` command.`);
        }
        // If greater than 3600 Seconds, convert into Hours
        else if ( timeLeft > 3600 ) {
          timeLeft = timeLeft / 3600;
          return message.reply(`Please wait ${timeLeft.toFixed(1)} more hour(s) before reusing the \`${command.name}\` command.`);
        }
      
        return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
      }
     } else {
       timestamps.set(message.author.id, now);
       setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
     }
   
   
   
   
   
   
    // A check for if the user ran a command inside DMs
    // if a cmd has 'guildOnly: true,', it won't work in DMs
    if (command.guildOnly && message.channel.type !== 'text') {
      return message.reply('I can\'t execute that command inside DMs!');
    }
  
    // A check for if the user ran a command inside Guilds
    // if a cmd has 'dmOnly: true,', it won't work in Guilds
    if (command.dmOnly && message.channel.type !== 'dm') {
      return message.reply('I can\'t execute that command inside Guilds!')
    }
  
    // A check for missing parameters
    // If a cmd has 'args: true,', it will throw the error
    // Requires the cmd file to have 'usage: '<user> <role>',' or similar
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
          reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }
  
  
  
  
  
    
  
    // If there is, grab and run that command's execute() function
    try {
      command.execute(message, args);
    } // Any errors are caught here, and thrown back at the User and Console
    catch (error) {
      console.error(error);
      message.reply('There was an error trying to execute that command!');
    }

  }

  

  /******************************************************/

});

/***********************************************/
// The token to connect the bot to the Bot Account on Discord
client.login(TOKEN);
