const fs = require('fs');
const Discord = require("discord.js");
const { client } = require('./constants.js');
const { PREFIX, TOKEN, DBLTOKEN } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles, UserPrefs } = require('./tables.js');
const LEVELS = require('./levels.json');

module.exports = {

    // Recalculate Levels and Token Amounts
    async RecalculateAuthor(sumMethod, resultAmount, configDB, levelDB, message, roulEmbed) {

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
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
                      for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
                } else if (ulevel > oldLevel) {
      
                  let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
                  let lvlMessage = guildConfig[0].levelUpMsg;
                  lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
                  lvlMessage = lvlMessage.replace("levelNum", ulevel);
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
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
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
                      for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
                    
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
                } else if (ulevel > oldLevel) {
      
                  let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
                  let lvlMessage = guildConfig[0].levelUpMsg;
                  lvlMessage = lvlMessage.replace("user", `\<\@${message.author.id}\>`);
                  lvlMessage = lvlMessage.replace("levelNum", ulevel);
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
                }
              }
            }
          }
      
      
        }
      
      
        // End of Function
    },





    


    














































    async RecalculateMember(sumMethod, resultAmount, memberObj, configDB, levelDB, message, roulEmbed) {

        // Fetch the Guild's Config Data AND User's Level Data
        let guildConfig = await configDB.findOrCreate({ where: { guildID: message.guild.id } })
        .catch(e => { 
          console.error(e);
          roulEmbed.setTitle(`Something went wrong...`);
          roulEmbed.setDescription(`There was an error fetching ${message.guild.name} Config Data. Please try again later.`);
          return message.channel.send(roulEmbed);
        });
      
        let userData = await levelDB.findOrCreate({ where: { guildID: message.guild.id, userID: memberObj.id } })
        .catch(e => { 
          console.error(e);
          roulEmbed.setTitle(`Something went wrong...`);
          roulEmbed.setDescription(`There was an error fetching ${memberObj}'s current Level/Tokens. Please try again later.`);
          return message.channel.send(roulEmbed);
        });
      
      
      
      
        resultAmount = parseInt(resultAmount);
        let updateDB;
      
        if ( sumMethod === "add" ) {
      
      
          // Perform operation on Tokens
          let newTokenAmount = userData[0].userTokens + resultAmount;
      
          updateDB = await levelDB.update( { userTokens: newTokenAmount }, { where: { guildID: message.guild.id, userID: memberObj.id } })
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
                    userID: memberObj.id
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
                  lvlMessage = lvlMessage.replace("user", `\<\@${memberObj.id}\>`);
                  lvlMessage = lvlMessage.replace("levelNum", ulevel);
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
                      for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
                } else if (ulevel > oldLevel) {
      
                  let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
                  let lvlMessage = guildConfig[0].levelUpMsg;
                  lvlMessage = lvlMessage.replace("user", `\<\@${memberObj.id}\>`);
                  lvlMessage = lvlMessage.replace("levelNum", ulevel);
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
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
      
          updateDB = await levelDB.update( { userTokens: newTokenAmount }, { where: { guildID: message.guild.id, userID: memberObj.id } })
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
                    userID: memberObj.id
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
                  lvlMessage = lvlMessage.replace("user", `\<\@${memberObj.id}\>`);
                  lvlMessage = lvlMessage.replace("levelNum", ulevel);
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
      
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
                      for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
                } else if (ulevel > oldLevel) {
      
                  let announceChannel = message.guild.channels.resolve(guildConfig[0].lvlChannel);
                  let lvlMessage = guildConfig[0].levelUpMsg;
                  lvlMessage = lvlMessage.replace("user", `\<\@${memberObj.id}\>`);
                  lvlMessage = lvlMessage.replace("levelNum", ulevel);
                  
      
                  // Level Role Check
                  let roleSearch = await LevelRoles.findOne({ where: { guildID: message.guild.id, level: ulevel } })
                  .catch(console.error);
      
      
                  // Fetch all Roles User has
                  let userRoles = message.member.roles.cache;
                  let matchedRoles = [];
      
      
                  // See if any of the User's Roles match IDs stored in DB
                  for ( let i = 0; i < userRoles.length; i++ ) {
                    //console.log(userRoles[i].id);
                    let searchForMatch = await LevelRoles.findOne({ where: { guildID: message.guild.id, roleID: userRoles[i].id } })
                    .catch(console.error);
      
                    if ( searchForMatch !== undefined || searchForMatch !== null ) {
      
                      matchedRoles.push(userRoles[i].id);
      
                    }
      
                  }
      
                  
                  
                  if ( roleSearch === null || roleSearch === undefined ) {
      
                    // If no stored Roles are found
      
      
                    // If there is an assigned Role for a lower level, assign that!
                    for ( let i = ulevel; i >= 0; i-- ) {
      
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
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
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
      
      
      
                    return announceChannel.send(lvlMessage + ` <-- **Caused by Crimson Roulette Command!** (\`c!cr\`)`);
      
                  }
      
      
                }
              }
            }
          }
      
      
        }
      
      
        // End of Function
    },








































    // Function to grab the random member's Level DB
    async fetchMemberLevels(guildsID, membersID, GuildLevels) {

        let memberDB = await GuildLevels.findOrCreate({ where: { guildID: guildsID, userID: membersID } })
        .catch(e => { 
          console.error(e);
          roulEmbed.setTitle(`Something went wrong...`);
          roulEmbed.setDescription(`There was an error fetching \<\@${membersID}\>'s current Level/Tokens. Please try again later.`);
          return message.channel.send(roulEmbed);
        });

        return memberDB;

    },

};