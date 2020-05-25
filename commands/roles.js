let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles, UserBG } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
let functFile = require('../bot_modules/functions.js');

module.exports = {
  name: 'roles',
  description: 'Used for managing the Levelling Roles',
  usage: `<levelNumber> / <@role> \nroles <levelNumber> / clear\nroles reset`,
  aliases: ['role'],
  //args: true,
  commandType: 'management',
  async execute(message, args) {

    PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
    const configEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Levelling Role Config Module');


    // Only the Guild Owner can use this command (and myself)
    if (message.author.id !== message.guild.ownerID || message.author.id !== "156482326887530498") {
      configEmbed.setTitle(`Something went wrong....`);
      configEmbed.setDescription(`Sorry, but only the Guild/Server Owner can use this command!`);
      return message.channel.send(configEmbed);
    }


    if (!args.length) {


      // Fetch LevelRoles DB
      let roledb = await LevelRoles.findAll({
          where: {
            guildID: message.guild.id
          },
          order: [
            ['level', 'ASC']
          ]
        })
        .catch(e => {
          console.error(e);
          configEmbed.setTitle(`Something went wrong...`);
          configEmbed.setDescription(`There was an error fetching ${message.guild.name}'s Level Roles. Please try again later.`);
          return message.channel.send(configEmbed);
        });



      // Display all currently set Roles (if any)
      if (!roledb.length) {

        configEmbed.setTitle(`${message.guild.name} Level Roles`);
        configEmbed.setDescription(`*None have been set!*`);
        configEmbed.addFields({
          name: `Extra Information`,
          value: `Use **\`${PREFIX}roles levelNumber / @role\`** to assign Roles to Levels!\nFor example: \`${PREFIX}roles 5 / @Level 5\` would assign the Role "Level 5" to our Level 5.\n\n*Note: This will only work for @role mentions, and NOT @user or @everyone mentions!\nWe also cannot create the Roles for you. You can do that under Server Settings -> Roles.*`
        });
        return message.channel.send(configEmbed);

      } else {

        let roleArray = [];

        for (let i = 0; i < roledb.length; i++) {

          let temp = roledb[i];
          roleArray.push(`**Level ${temp.level}:** \<\@\&${temp.roleID}\>`);

        }

        configEmbed.setTitle(`${message.guild.name} Level Roles`);
        configEmbed.setDescription(roleArray.join(`\n`));
        configEmbed.addFields({
          name: `\u200B`,
          value: `\u200B`
        }, {
          name: `Extra Information`,
          value: `Use the sub-command **\`${PREFIX}roles guide\`** to learn more about how to set/clear/reset Levelling Roles`
        }, );
        return message.channel.send(configEmbed);

      }




    } else if (args[0] === "reset") {

      // FIRST, confirmation
      configEmbed.setTitle(`Confirmation`);
      configEmbed.setDescription(`This will clear all currently assigned Roles from the Bot. Are you sure you want to do this?\n**Send \`yes\` to confirm**`);
      message.channel.send(configEmbed);

      let filter = m => m.content.includes("yes");
      let confirmCollector = message.channel.createMessageCollector(filter, {
          time: 5000
        })
        .on('collect', m => confirmCollector.stop())
        .on('end', (collected, reason) => Confirmation(collected, reason));


      // confirmation function
      async function Confirmation(collected, reason) {

        if (reason === "time" || reason === "idle") {

          configEmbed.setTitle(`⌛ Timeout Error`);
          configEmbed.setDescription(`You were too slow I'm afraid. Please try again`);
          return message.channel.send(configEmbed);

        }

        let collect = collected.array();
        let userConfirm = collect[0];

        if (userConfirm === null) {
          configEmbed.setTitle(`An error occurred...`);
          configEmbed.setDescription(`Please try again`);
          return message.channel.send(configEmbed);
        }

        if (!userConfirm.content.includes("yes")) {
          configEmbed.setTitle(`Role Reset cancelled`);
          configEmbed.setDescription(`Since a "yes" was not found, the reset was cancelled.`);
          return message.channel.send(configEmbed);
        }


        // Reset Roles since yes was found
        let resetRoles = await LevelRoles.destroy({
            where: {
              guildID: message.guild.id
            }
          })
          .catch(err => {
            return message.reply(`Sorry, but I was unable to reset the Roles Database for this Server. Please try again.`)
          });

        configEmbed.setTitle(`Unassigned all Roles from all Levels`);
        configEmbed.setDescription(`You can reassign Roles to Levels using the \`${PREFIX}roles\` command.`);
        return message.channel.send(configEmbed);

      }




    } else if (args[0] === "guide") {

      configEmbed.setTitle(`Levelling Role Guide`);
      configEmbed.addFields({
        name: `How to assign a Role to a Level:`,
        value: `Use **\`${PREFIX}roles levelNumber / @role\`** to assign Roles to Levels!\nFor example: \`${PREFIX}roles 5 / @Level 5\` would assign the Role "Level 5" to our Level 5.\n\n*Note: This will only work for @role mentions, and NOT @user or @everyone mentions!\nWe also cannot create the Roles for you. You can do that under Server Settings -> Roles.*`
      }, {
        name: `\u200B`,
        value: `\u200B`
      }, {
        name: `How to unassign a Role from a Level:`,
        value: `Use **\`${PREFIX}roles levelNumber / clear\`** to unassign a Role from the specified Level.\nThis will mean no one can earn a Role from this Level anymore (unless a Role is reassigned!)`
      }, {
        name: `\u200B`,
        value: `\u200B`
      }, {
        name: `How to clear ALL Roles`,
        value: `To unassign *all* of the Roles from this Bot, use **\`${PREFIX}roles reset\`**.\nPlease note that all currently given Roles will *NOT* be taken off Users. You will have to do this yourself.\n(Using Server Settings -> Members)`
      }, );

      return message.channel.send(configEmbed);




    }











    let argString = args.join(' '); // Turns Array into String (otherwise it'd be each word as an array element)
    let argSubStrings = null;

    try {
      argSubStrings = argString.split(" / ");
    } catch (e) {

      configEmbed.setTitle(`An Error Occurred!`);
      configEmbed.setDescription(`Hmmm, seems like I wasn't able to detect the seperator between the Setting and the Value.\nPlease try again, using the following format: \`${PREFIX}config [setting] / [value] \`\nFor example: \`${PREFIX}roles <levelNumber|reset> \ <@role|clear>\``);
      return message.channel.send(configEmbed);

    }



































    // Grab the two parts of the Argument as seperate vars for easier handling
    let settingName = argSubStrings.shift();
    settingName = settingName.toLowerCase();
    let settingValue;


    // Permissions check!
    let botMember = message.guild.members.resolve('657859837023092746');
    let manageRole = botMember.hasPermission('MANAGE_ROLES', {
      checkAdmin: true
    });

    if (manageRole === false) {
      configEmbed.setTitle(`Missing Permission!`);
      configEmbed.setDescription(`Oops! It would seem I am missing the Manage Roles Permission.\nI need this in order to give/revoke Roles.\nPlease also make sure the Role with this permission is above the Levelling Roles - I can only grant/revoke Roles below my highest one with this permission!`);
      return message.channel.send(configEmbed);
    }











    // When stuff is given
    if (args.length >= 2) {
      try {

        settingValue = argSubStrings.shift();

      } catch (e) {

        configEmbed.setTitle(`Whoops, an error occurred...`);
        configEmbed.setDescription(`I was unable to find a Role Mention or "clear", please try again using the format **\`${PREFIX}roles levelNumber / <@role|clear>\`**`);
        return message.channel.send(configEmbed);

      }






      // Now test settingName to make sure it's an Integer
      try {

        settingName = parseInt(settingName);

        if (settingName === NaN || settingName === 'NaN' || isNaN(settingName)) {
          throw "Not a Number";
        } else if (settingName === undefined || settingName === null) {
          throw "Non Existant Value";
        }

      } catch (e) {

        configEmbed.setTitle(`Whoops, An error occurred...`);
        configEmbed.setDescription(`A Level Number wasn't found. Please try again using a Level Number BEFORE the Role Mention, eg:\n**\`${PREFIX}roles levelNumber / <@role|clear>\`**`);
        return message.channel.send(configEmbed);

      }

      // Final checks - makes sure we don't have a LevelNumber less than 1 or greater than 200
      if (settingName < 1 || settingName > 200) {

        configEmbed.setTitle(`Whoops, an error occurred...`);
        configEmbed.setDescription(`Sorry, but I cannot assign a Role to a Level less than 1 **or** greater than 200.`);
        return message.channel.send(configEmbed);

      }




      if (settingValue === "clear") {

        let clearRole = await LevelRoles.destroy({
            where: {
              guildID: message.guild.id,
              level: settingName
            }
          })
          .catch(err => {
            return message.reply(`Sorry, but I was unable to unassign that Level from its Role. Please try again.`)
          });

        configEmbed.setTitle(`Successfully unassigned Role`);
        configEmbed.setDescription(`The Role for Level ${settingName} has been successfully unassigned.`);
        return message.channel.send(configEmbed);

      }




      // Strip the <@& and > bits off
      settingValue = settingValue.slice(3, settingValue.length - 1);

      // Test extraValue to make sure it is a Role Mention!
      if (!message.guild.roles.resolve(settingValue)) {

        configEmbed.setTitle(`Whoops, an error occurred...`);
        configEmbed.setDescription(`I was unable to resolve that Role Mention, please try again.`);
        return message.channel.send(configEmbed);

      }







      // *NOW* we can assign Roles to Levels!

      // Firstly, see if that Guild & Level combo already exists
      let assignRole = await LevelRoles.findAll({
          where: {
            guildID: message.guild.id,
            level: settingName
          }
        })
        .catch(err => {
          return message.reply(`An Error Occurred! Please try again.`);
        });

      if (assignRole.length < 1) {

        // If it DOESN'T exist already
        let newRole = await LevelRoles.create({
            guildID: message.guild.id,
            level: settingName,
            roleID: settingValue
          })
          .catch(err => {
            return message.reply(`An error occurred! Please try again.`);
          });

        // Send confirmation Embed
        configEmbed.setTitle(`New Level Role Created!`);
        configEmbed.setDescription(`Successfully set the Role \<\@\&${settingValue}\> to be assigned for Level **${settingName}**`);
        return message.channel.send(configEmbed);

      } else {

        // If it DOES exist already
        let updatedRole = await LevelRoles.update({
            roleID: settingValue
          }, {
            where: {
              guildID: message.guild.id,
              level: settingName
            }
          })
          .catch(err => {
            return message.reply(`An error occurred! Please try again.`);
          });

        if (updatedRole[0] === 1) {

          configEmbed.setTitle(`Level Role Changes Saved!`);
          configEmbed.setDescription(`Successfully set the Role \<\@\&${settingValue}\> to be assigned for Level **${settingName}**`);
          return message.channel.send(configEmbed);

        } else {

          configEmbed.setTitle(`Level Role Changes....failed?`);
          configEmbed.setDescription(`Something went wrong while attempting to save... Maybe try again?`);
          return message.channel.send(configEmbed);

        }
      }
    }
  },


  //END OF COMMAND
};