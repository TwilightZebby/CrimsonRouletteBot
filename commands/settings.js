const { PREFIX } = require('../config.js');
const { ConfigData } = require('../bot_modules/tables.js');
const Discord = require("discord.js");

module.exports = {
    name: 'settings',
    description: `Manage the settings to change how this Bot functions\nUse without any options to show current settings`,
    usage: '<configOption> <value>',
    aliases: ['config'],
    //args: true,
    commandType: 'general',
    async execute(message, args) {
      
      // Thy Embed
      const configEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Config');



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
        let vcTokens = guildConfig[0].dataValues.voiceTokens;
        let riskRoul = guildConfig[0].dataValues.riskyRoul;
        let crimRoul = guildConfig[0].dataValues.crimRoul;

        // Now place into Embed to show User
        configEmbed.setTitle(`${message.guild.name}'s Current Configuration`);
        configEmbed.setDescription(`Below are all the current set values in the Bot's settings for this Guild`);
        configEmbed.addFields(
          { name: `Allow Levelling`, value: tokenLevel, inline: true },
          { name: `Level Downs`, value: lvlDown, inline: true },
          { name: `Voice Channel Tokens`, value: vcTokens },
          { name: `Risky Roulette Results`, value: riskRoul, inline: true },
          { name: `Roulette Commands`, value: crimRoul, inline: true },
          { name: `Level Up Message (Not yet customisable)`, value: lvlUpMsg },
          { name: `Level Down Message (Not yet customisable)`, value: lvlDwnMsg },
          { name: `\u200B`, value: `Further explaination on what each Setting does can be found [here at top.gg](https://placeholder.com 'https://placeholder.com')\nTo edit a setting, use \`${PREFIX}config [setting] / [value]\`, making sure to INCLUDE the forward slash (/) between the Setting and Value!` }
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
      settingValue = settingValue.toLowerCase();

      configEmbed.spliceFields(0, 24); // Delete the previous Fields ready to re-use this Embed


      // Because JavaScript is werid sometimes
      let updateConfig;

      switch(settingName) {

        // Allow Levelling
        case "allow levelling" || "levelling":
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
        case "level down" || "lvl down":
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
        case "voice channel tokens" || "voice channel token" || "vc tokens":
          if ( settingValue !== "true" && settingValue !== "false" ) { return message.reply(`Oops, that Setting will only accept either "true" or "false"`); }

          updateConfig = await ConfigData.update( { voiceTokens: settingValue }, { where: { guildID: message.guild.id } })
            .catch(err => { return message.reply(`An Error Occured! Please try again.`); });

          if ( updateConfig ) {
            configEmbed.setTitle(`Successfully updated Config!`);
            configEmbed.setDescription(`The Setting **${settingName}** has been set to ${settingValue}`);
            return message.channel.send(configEmbed);
          }
          break;

        // Risky Roulette Results
        case "risky roulette results" || "risky roulette":
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
        case "roulette commands" || "roulette cmds":
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
