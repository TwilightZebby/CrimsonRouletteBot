const { PREFIX } = require('../config.js');
const { ConfigData, LevelRoles } = require('../bot_modules/tables.js');
const Discord = require("discord.js");

module.exports = {
    name: 'config',
    description: `Manage the settings to change how this Bot functions\nUse without any options to show current settings`,
    usage: '[configOption] [value]',
    //aliases: ['config'],
    //args: true,
    commandType: 'management',
    async execute(message, args) {
      
      // Thy Embed
      const configEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Config Module');


      // Only the Guild Owner can use this command (and myself)
      if ( message.author.id !== message.guild.ownerID || message.author.id !== "156482326887530498" ) {
        configEmbed.setTitle(`Something went wrong....`);
        configEmbed.setDescription(`Sorry, but only the Guild/Server Owner can use this command!`);
        return message.channel.send(configEmbed);
      }



      // If there is NO args inputted, show current configValues
      if ( !args.length ) {

        // Fetch the Guild's current configValues from the Database
        let guildConfig = await ConfigData.findOrCreate({ where: { guildID: message.guild.id } })
        .catch(e => { console.error(`Error searching for ConfigData - config CMD guildConfig -\n${e}`) });
        
        // If no data was found
        if ( !guildConfig ) {
          configEmbed.addFields({ name: `An error occurred!`, value: `Could not find Config Data for this Guild.\nIf this error keeps occurring, please contact \<\@156482326887530498\>` });
          return message.channel.send(configEmbed);
        }




        // If data found, fetch the values
        let tokenLevel = guildConfig[0].dataValues.tokenLevels;
        let lvlDown = guildConfig[0].dataValues.levelDown;
        let lvlUpMsg = guildConfig[0].dataValues.levelUpMsg;
        let lvlDwnMsg = guildConfig[0].dataValues.levelDownMsg;
        //let vcTokens = guildConfig[0].dataValues.voiceTokens;
        let riskRoul = guildConfig[0].dataValues.riskyRoul;
        let crimRoul = guildConfig[0].dataValues.crimRoul;
        let announceChannel = guildConfig[0].dataValues.lvlChannel;

        // Now place into Embed to show User
        configEmbed.setTitle(`${message.guild.name}'s Current Configuration`);
        configEmbed.setDescription(`Below are all the current set values in the Bot's settings for this Guild`);
        configEmbed.addFields(
          { name: `Allow Levelling`, value: tokenLevel, inline: true },
          { name: `Level Downs`, value: lvlDown, inline: true },
          { name: `Broadcast Channel`, value: `\<\#${announceChannel}\>`, inline: true },
          //{ name: `Voice Channel Tokens`, value: vcTokens },
          { name: `Risky Roulette Results`, value: riskRoul, inline: true },
          { name: `Roulette Commands`, value: crimRoul, inline: true },
          { name: `Level Up Message`, value: lvlUpMsg },
          { name: `Level Down Message`, value: lvlDwnMsg },
          { name: `Levelling Roles`, value: `Use **\`${PREFIX}config levels\`** to access the Level Roles Module` },
          { name: `\u200B`, value: `\u200B` },
          { name: `\u200B`, value: `Further explaination on what each Setting does can be found [here at top.gg](https://top.gg/bot/657859837023092746) or by using the \`${PREFIX}config guide\` command.\nTo edit a setting, use **\`${PREFIX}config [setting] / [value]\`**, making sure to INCLUDE the forward slash (/) between the Setting and Value!` }
        );

        return message.channel.send(configEmbed);

      }





      // Edit the specified Config Option!
      // Also my first time actually using Switch-Case statements because I can never usually get them to fudging work
      //     and I honestly prefer If-ElseIf-Else Statements and I don't care how messy they seem :P
      
      // First, grab the substring containing the name of the setting we want to edit
      let argString = args.join(' '); // Turns Array into String (otherwise it'd be each word as an array element)
      let argSubStrings = null;

      try {
        argSubStrings = argString.split(" / ");
      } catch(e) {
        configEmbed.spliceFields(0, 24); // Delete the previous Fields ready to re-use this Embed
        configEmbed.setTitle(`An Error Occurred!`);
        configEmbed.setDescription(`Hmmm, seems like I wasn't able to detect the seperator between the Setting and the Value.\nPlease try again, using the following format: \`${PREFIX}config [setting] / [value] \`\nFor example: \`${PREFIX}config Allow Levelling / true\``);

        return message.channel.send(configEmbed);
      }
      
      

      // Grab the two parts of the Argument as seperate vars for easier handling
      let settingName = argSubStrings.shift();
      settingName = settingName.toLowerCase();
      let settingValue = argSubStrings.shift();

      configEmbed.spliceFields(0, 24); // Delete the previous Fields ready to re-use this Embed


      // Because JavaScript is werid sometimes
      let updateConfig;
























      // LEVEL ROLES MODULE
      // Keeping seperate from the rest of the Config Module
      if ( settingName === "levels" || settingName === "level" ) {
        configEmbed.setFooter(`Level Role Module (Config Sub-Module)`);

        // Permissions check!
        let botMember = message.guild.members.resolve('657859837023092746');
        let manageRole = botMember.hasPermission('MANAGE_ROLES', { checkAdmin: true });

        if ( manageRole === false ) {
          configEmbed.setTitle(`Missing Permission!`);
          configEmbed.setDescription(`Oops! It would seem I am missing the Manage Roles Permission.\nI need this in order to give/revoke Roles.\nPlease also make sure the Role with this permission is above the Levelling Roles - I can only grant/revoke Roles below my highest one with this permission!`);
          return message.channel.send(configEmbed);
        }




        // Fetch LevelRoles DB
        let roledb = await LevelRoles.findAll({ where: { guildID: message.guild.id }, order: [ ['level', 'ASC'] ] })
        .catch(e => { 
          console.error(e);
          configEmbed.setTitle(`Something went wrong...`);
          configEmbed.setDescription(`There was an error fetching ${message.guild.name}'s Level Roles. Please try again later.`);
          return message.channel.send(configEmbed);
        });





        // For no further input (display current set Roles)
        if ( !settingValue ) {


          // Display all currently set Roles (if any)
          if ( !roledb.length ) {

            configEmbed.setTitle(`${message.guild.name} Level Roles`);
            configEmbed.setDescription(`*None have been set!*`);
            configEmbed.addFields({ name: `Extra Information`, value: `Use **\`${PREFIX}config levels / levelNumber / @role\`** to assign Roles to Levels!\nFor example: \`${PREFIX}config levels / 5 / @Level 5\` would assign the Role "Level 5" to our Level 5.\n\n*Note: This will only work for @role mentions, and NOT @user or @everyone mentions!\nWe also cannot create the Roles for you. You can do that under Server Settings -> Roles.*` });
            return message.channel.send(configEmbed);

          } 
          else {

            let roleArray = [];

            for ( let i = 0; i < roledb.length; i++ ) {

              let temp = roledb[i];
              roleArray.push(`**Level ${temp.level}:** \<\@\&${temp.roleID}\>`);

            }

            configEmbed.setTitle(`${message.guild.name} Level Roles`);
            configEmbed.setDescription(roleArray.join(`\n`));
            configEmbed.addFields(
              { name: `\u200B`, value: `\u200B` }, 
              { name: `Extra Information`, value: `Use the sub-command **\`${PREFIX}config levels / guide\`** to learn more about how to set/clear/reset Levelling Roles` },
              );
            return message.channel.send(configEmbed);

          }

        }
        else {

          // When stuff is given
          let extraValue;
          try {

            extraValue = argSubStrings.shift();

          } catch(e) {

            configEmbed.setTitle(`Whoops, an error occurred...`);
            configEmbed.setDescription(`I was unable to find a Role Mention, please try again using the format **\`${PREFIX}config levels / levelNumber / @role\`**`);
            return message.channel.send(configEmbed);

          }




          // IS SETTING VALUE "RESET"?
          if ( settingValue === "reset" ) {

            let resetRoles = await LevelRoles.destroy({ where: { guildID: message.guild.id } })
            .catch(err => { return message.reply(`Sorry, but I was unable to reset the Roles Database for this Server. Please try again.`) });

            configEmbed.setTitle(`Unassigned all Roles from all Levels`);
            configEmbed.setDescription(`You can reassign Roles to Levels using the \`${PREFIX}config levels\` sub-commands.`);
            return message.channel.send(configEmbed);

          }



          // IS SETTING VALUE "GUIDE"?
          if ( settingValue === "guide" ) {

            configEmbed.setTitle(`Levelling Role Guide`);
            configEmbed.addFields(
              { name: `How to assign a Role to a Level:`, value: `Use **\`${PREFIX}config levels / levelNumber / @role\`** to assign Roles to Levels!\nFor example: \`${PREFIX}config levels / 5 / @Level 5\` would assign the Role "Level 5" to our Level 5.\n\n*Note: This will only work for @role mentions, and NOT @user or @everyone mentions!\nWe also cannot create the Roles for you. You can do that under Server Settings -> Roles.*` },
              { name: `\u200B`, value: `\u200B` },
              { name: `How to unassign a Role from a Level:`, value: `Use **\`${PREFIX}config levels / levelNumber / clear\`** to unassign a Role from the specified Level.\nThis will mean no one can earn a Role from this Level anymore (unless a Role is reassigned!)` },
              { name: `\u200B`, value: `\u200B` },
              { name: `How to clear ALL Roles`, value: `To unassign *all* of the Roles from this Bot, use **\`${PREFIX}config levels / reset\`**.\nPlease note that all currently given Roles will *NOT* be taken off Users. You will have to do this yourself.\n(Either using Server Settings -> Members OR Server Settings -> Roles -> Delete Role)` },
            );

            return message.channel.send(configEmbed);

          }





          // Now test settingValue to make sure it's an Integer
          try {

            settingValue = parseInt(settingValue);
    
            if ( settingValue === NaN || settingValue === 'NaN' || isNaN(settingValue) ) {
              throw "Not a Number";
            } else if ( settingValue === undefined || settingValue === null ) {
              throw "Non Existant Value";
            }
    
          } catch (e) {
    
            configEmbed.setTitle(`Whoops, An error occurred...`);
            configEmbed.setDescription(`A Level Number wasn't found. Please try again using a Level Number BEFORE the Role Mention, eg:\n**\`${PREFIX}config levels / levelNumber / @role\`**`);
            return message.channel.send(configEmbed);
    
          }

          // Final checks - makes sure we don't have a LevelNumber less than 1 or greater than 200
          if ( settingValue < 1 || settingValue > 200 ) {

            configEmbed.setTitle(`Whoops, an error occurred...`);
            configEmbed.setDescription(`Sorry, but I cannot assign a Role to a Level less than 1 **or** greater than 200.`);
            return message.channel.send(configEmbed);

          }


          

          // IS EXTRA VALUE "CLEAR"?
          if ( extraValue === "clear" ) {

            let clearRole = await LevelRoles.destroy({ where: { guildID: message.guild.id, level: settingValue } })
            .catch(err => { return message.reply(`Sorry, but I was unable to unassign that Level from its Role. Please try again.`) });

            configEmbed.setTitle(`Successfully unassigned Role`);
            configEmbed.setDescription(`The Role for Level ${settingValue} has been successfully unassigned.`);
            return message.channel.send(configEmbed);

          }




          // Strip the <@& and > bits off
          extraValue = extraValue.slice(3, extraValue.length - 1);

          // Test extraValue to make sure it is a Role Mention!
          if ( !message.guild.roles.resolve(extraValue) ) {

            configEmbed.setTitle(`Whoops, an error occurred...`);
            configEmbed.setDescription(`I was unable to resolve that Role Mention, please try again.`);
            return message.channel.send(configEmbed);

          }







          // *NOW* we can assign Roles to Levels!

          // Firstly, see if that Guild & Level combo already exists
          let assignRole = await LevelRoles.findAll({ where: { guildID: message.guild.id, level: settingValue } })
          .catch(err => { return message.reply(`An Error Occurred! Please try again.`); });
          
          if ( assignRole.length < 1 ) {

            // If it DOESN'T exist already
            let newRole = await LevelRoles.create({ guildID: message.guild.id, level: settingValue, roleID: extraValue })
            .catch(err => { return message.reply(`An error occurred! Please try again.`); });

            // Send confirmation Embed
            configEmbed.setTitle(`New Level Role Created!`);
            configEmbed.setDescription(`Successfully set the Role \<\@\&${extraValue}\> to be assigned for Level **${settingValue}**`);
            return message.channel.send(configEmbed);

          } else {

            // If it DOES exist already
            let updatedRole = await LevelRoles.update({ roleID: extraValue }, { where: { guildID: message.guild.id, level: settingValue } })
            .catch(err => { return message.reply(`An error occurred! Please try again.`); });

            if ( updatedRole[0] === 1 ) {

              configEmbed.setTitle(`Level Role Changes Saved!`);
              configEmbed.setDescription(`Successfully set the Role \<\@\&${extraValue}\> to be assigned for Level **${settingValue}**`);
              return message.channel.send(configEmbed);

            } else {

              configEmbed.setTitle(`Level Role Changes....failed?`);
              configEmbed.setDescription(`Something went wrong while attempting to save... Maybe try again?`);
              return message.channel.send(configEmbed);

            }

          }

        }


      }



























      switch(settingName) {

        // Quick Guide
        case "?":
        case "guide":
        case "help":
          configEmbed.setTitle(`Config Guide`);
          configEmbed.setDescription(`Here is a quick guide on what each option does!\n*Reminder: The Level Role Module has it\'s own guide. You can use \`${PREFIX}config levels / guide\` to see it*`);
          configEmbed.addFields(
            { name: `Allow Levelling`, value: `Enables or Disables the whole Levelling part of this Bot. Useful for if you need to make quick tweaks while preventing Users from getting Tokens/Levels` },
            { name: `Level Downs`, value: `Toggle if Users can Level Down or not. Disable if you only want the Level Ups like the other standard Levelling Bots there are ;P` },
            { name: `Broadcase Channel`, value: `Set the channel that Level Up/Down Messages get sent to. Use \`null\` to disable this.` },
            { name: `Risky Roulette`, value: `Toggle the \`${PREFIX}cr\` command. Useful for preventing multiple members from suddenly gaining or losing Levels from a single command` },
            { name: `Roulette Commands`, value: `Toggles *both* Roulette Commands. Overrides the **Risky Roulette** config option if this one is disabled.` },
            { name: `lvl up messages / lvl down messages`, value: `Customise either of the Level Up or Down messages. Both requires \`user\` and \`levelNum\` to be used as placeholders so we know where to place the User and their new Level in the message.` }
          );
          message.channel.send(configEmbed);
          break;


        // Lvl Up Messages
        case "level up message":
        case "level up msg":
        case "lvl up msg":
          // check that "user" and "levelNum" exists
          if ( !settingValue.includes("user") ) {
            configEmbed.setTitle(`Something went wrong...`);
            configEmbed.setDescription(`"user" was not found in that string. Please try again! (example: \`user has levelled up to Level levelNum!\`)`);
            return message.channel.send(configEmbed);
          } else if ( !settingValue.includes("levelNum") ) {
            configEmbed.setTitle(`Something went wrong...`);
            configEmbed.setDescription(`"levelNum" was not found in that string. Please try again! (example: \`user has levelled up to Level levelNum!\`)`);
            return message.channel.send(configEmbed);
          }

          updateConfig = await ConfigData.update( { levelUpMsg: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to \`${settingValue}\``);
            return message.channel.send(configEmbed);
          }
          break;
        

        // Lvl Up Messages
        case "level down message":
        case "level down msg":
        case "lvl down msg":
          // check that "user" and "levelNum" exists
          if ( !settingValue.includes("user") ) {
            configEmbed.setTitle(`Something went wrong...`);
            configEmbed.setDescription(`"user" was not found in that string. Please try again! (example: \`user has levelled down to Level levelNum!\`)`);
            return message.channel.send(configEmbed);
          } else if ( !settingValue.includes("levelNum") ) {
            configEmbed.setTitle(`Something went wrong...`);
            configEmbed.setDescription(`"levelNum" was not found in that string. Please try again! (example: \`user has levelled down to Level levelNum!\`)`);
            return message.channel.send(configEmbed);
          }

          updateConfig = await ConfigData.update( { levelDownMsg: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to \`${settingValue}\``);
            return message.channel.send(configEmbed);
          }
          break;


        // Broadcast Levels Channel
        case "broadcast channel":
        case "broadcast":
        case "levels channel":
        case "lvl channel":
          
          let channelID;

          if ( settingValue === "null" ) {
            channelID = null;
          } else {

            try {
              channelID = message.guild.channels.resolveID(settingValue);
              channelID = channelID.substring(2, channelID.length - 1);
            } catch(err) {
              //console.error(err);
              configEmbed.setTitle(`Something went wrong...`);
              configEmbed.setDescription(`I am unable to find that Channel. Please try again using a Channel Mention (eg: \`#channel\`)`);
              return message.channel.send(configEmbed);
            }
          }

          updateConfig = await ConfigData.update( { lvlChannel: channelID }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });
  
          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;


        // Allow Levelling
        case "allow levelling":
        case "levelling":
          settingValue = settingValue.toLowerCase();
          if ( settingValue !== "true" && settingValue !== "false" ) { return message.reply(`Oops, that Setting will only accept either "true" or "false"`); }

          updateConfig = await ConfigData.update( { tokenLevels: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;


        // Level Down
        case "level down":
        case "lvl down":
          settingValue = settingValue.toLowerCase();
          if ( settingValue !== "true" && settingValue !== "false" ) { return message.reply(`Oops, that Setting will only accept either "true" or "false"`); }

          updateConfig = await ConfigData.update( { levelDown: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;


        // Voice Channel Tokens
        /*case "voice channel tokens"
        case: "voice channel token":
        case "vc tokens":
          settingValue = settingValue.toLowerCase();
          if ( settingValue !== "true" && settingValue !== "false" ) { return message.reply(`Oops, that Setting will only accept either "true" or "false"`); }

          updateConfig = await ConfigData.update( { voiceTokens: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;*/


        // Risky Roulette Results
        case "risky roulette results":
        case "risky roulette":
          settingValue = settingValue.toLowerCase();
          if ( settingValue !== "true" && settingValue !== "false" ) { return message.reply(`Oops, that Setting will only accept either "true" or "false"`); }

          updateConfig = await ConfigData.update( { riskyRoul: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;

        // All Roulette Commands
        case "roulette commands":
        case "roulette cmds":
          settingValue = settingValue.toLowerCase();
          if ( settingValue !== "true" && settingValue !== "false" ) { return message.reply(`Oops, that Setting will only accept either "true" or "false"`); }

          updateConfig = await ConfigData.update( { crimRoul: settingValue }, { where: { guildID: message.guild.id } })
          .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;


        // Else
        default:
          configEmbed.setTitle(`An Error occurred!`);
          configEmbed.setDescription(`You may have mistyped the Setting Name. Please try again.`);
          return message.channel.send(configEmbed);

      }



      //END OF COMMAND
    },
};
