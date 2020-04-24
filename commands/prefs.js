const fs = require('fs');
const { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles, UserPrefs } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
// LIMITED BACKGROUNDS - require meeting certain requirements to unlock

module.exports = {
    name: 'prefs',
    description: 'Manage your own preferences for this Bot (including the Background for the Rank Command!)',
    usage: ` \n${PREFIX}prefs <option> / <value>`,
    //aliases: [''],
    //args: true,
    cooldown: 5,
    commandType: 'management',
    async execute(message, args) {

      let limitedBackgrounds = [ "beta", "darkShadow" ];
      const prefEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('User Preferences');



      // Fetch all the Image Files
      let backgroundFiles = fs.readdirSync('./images').filter(file => file.endsWith('.png'));
      let backgroundArray = [];
      let displayArray = [];
      for ( file of backgroundFiles ) {
        let tempSTRING = file.toString();
        let tempSTRINGLength = tempSTRING.length;
        tempSTRING = tempSTRING.substr(0, tempSTRINGLength - 4);

        backgroundArray.push(tempSTRING);

        




        // ***********************************************************************
        // SORT OUT IF USER HAS UNLOCKED A BACKGROUND OR NOT
        // Removal of background from the Array unlocks it for use

        // Beta BG
        if ( client.user.id === "664495280141500446" ) {
          
          for ( let i = 0; i < limitedBackgrounds.length - 1; i++ ) {

            let tempStore = limitedBackgrounds[i];
            if ( tempStore === "beta" ) {
              limitedBackgrounds.splice(i, 1);
            }

          }

        }
        
        // Bot Dev Override ;P
        if ( message.author.id === "156482326887530498" ) {
          limitedBackgrounds = [];
        }










        // Add emojis as icons to those with limitations
        if ( limitedBackgrounds.includes(tempSTRING) ) {
          tempSTRING += "🔒";
        }
        
        displayArray.push(tempSTRING);
      }





      if ( !args.length ) {

        // DISPLAY ALL CURRENT SETTINGS FOR USER'S PREFS

        // Fetch said settings
        let userPrefsDB = await UserPrefs.findOrCreate({ where: { userID: message.author.id } })
        .catch(e => {
          console.error(e);
          prefEmbed.setTitle(`Oops, something went wrong...`);
          prefEmbed.setDescription(`I was unable to find the preferences for ${message.author}. Please try again...`);
          return message.channel.send(prefEmbed);
        });


        // Split apart values
        let userBackground = userPrefsDB[0].background;


        // Slap values into Embed
        prefEmbed.setTitle(`${message.author.username} Preferences`);
        prefEmbed.addFields(
          { name: `Rank Background`, value: userBackground },
          { name: `\u200B`, value: `\u200B` },
          { name: `Set Preferences`, value: `To edit a preference, use **\`${PREFIX}prefs [option] / [value]\`**, making sure to INCLUDE the forward slash (/) between the Option and Value!` },
          { name: `Rank Background Information`, value: `If you want to know what backgrounds you can choose from, use \`${PREFIX}prefs background / list\`` }
        );
        return message.channel.send(prefEmbed);

      }
      else {

        // SET PREFS
        let argString = args.join(' '); // Turns Array into String (otherwise it'd be each word as an array element)
        let argSubStrings = null;

        try {
          argSubStrings = argString.split(" / ");
        } catch(e) {
          prefEmbed.spliceFields(0, 24); // Delete the previous Fields ready to re-use this Embed
          prefEmbed.setTitle(`An Error Occurred!`);
          prefEmbed.setDescription(`Hmmm, seems like I wasn't able to detect the seperator between the Setting and the Value.\nPlease try again, using the following format: \`${PREFIX}prefs [setting] / [value] \`\nFor example: \`${PREFIX}prefs background / default\``);

          return message.channel.send(prefEmbed);
        }



        // Grab the two parts of the Argument as seperate vars for easier handling
        let settingName = argSubStrings.shift();
        settingName = settingName.toLowerCase();
        let settingValue = argSubStrings.shift();




        switch(settingName) {


          // Rank Command Background
          case "rank background":
          case "background":

            let settingValueBackup = settingValue;
            settingValue = settingValue.toLowerCase();
            // Check if the given value is a valid one
            if ( settingValue === "list" ) {

              // Show a list of all the correct Background Choices
              prefEmbed.setTitle(`List of Backgrounds`);
              prefEmbed.setDescription(displayArray.join(`, `));
              prefEmbed.addFields(
                { name: `\u200B`, value: `\u200B` },
                { name: `Preview Backgrounds`, value: `If you want to see a preview of a Background, use the \`${PREFIX}prefs background / preview / backgroundName\` command.` },
                { name: `Set Backgrounds`, value: `To change your Background, use the \`${PREFIX}prefs background / backgroundName\` command` }
              );
              return message.channel.send(prefEmbed);

            }
            else if ( settingValue === "preview" ) {

              // Display a preview of the specified Background
              let previewChoice;

              // Error Checking (see if User actually submitted a BG Name)
              try {
                previewChoice = argSubStrings.shift();
              } catch(err) {
                //console.error(err);
                prefEmbed.setTitle(`Something went wrong...`);
                prefEmbed.setDescription(`I was unable to find a Background Name. Please try again.`);
                return message.channel.send(prefEmbed);
              }

              // Error Checking (see if given BG Name exists within /images/ folder)
              if ( !backgroundArray.includes(previewChoice) ) {
                prefEmbed.setTitle(`Something went wrong...`);
                prefEmbed.setDescription(`I was unable to find a the background **${previewChoice}**.\nPlease try again. You can use the command \`${PREFIX}prefs background / list\` to see a list of all available backgrounds!`);
                return message.channel.send(prefEmbed);
              }


              // Grab given BG, and display it to User
              return message.channel.send({
                embed: {
                  image: {
                    url: `attachment://${previewChoice}.png`
                  },
                  title: `Background Preview`,
                  description: `Background Name: **${previewChoice}**`,
                  color: '#07f51b',
                },
                files: [{
                  attachment: `./images/${previewChoice}.png`,
                  name: `${previewChoice}.png`
                }]
              })
              .catch(console.error);


            }
            else {

              // Check background exists
              if ( !backgroundArray.includes(settingValueBackup) ) {
                prefEmbed.setTitle(`Something went wrong...`);
                prefEmbed.setDescription(`I was unable to find a the background **${settingValue}**.\nPlease try again. You can use the command \`${PREFIX}prefs background / list\` to see a list of all available backgrounds!`);
                return message.channel.send(prefEmbed);
              }

              










              // LOCKED BACKGROUND MESSAGES
              if ( limitedBackgrounds.includes(settingValueBackup) ) {


                switch (settingValueBackup) {


                  case "beta":
                    prefEmbed.setTitle(`Buzz! Sorry, that Background is locked!`);
                    prefEmbed.setDescription(`The **${settingValueBackup}** background can only be used with the Beta version of this Bot. Sorry!`);
                    message.channel.send(prefEmbed);
                    break;


                  case "darkShadow":
                    prefEmbed.setTitle(`Buzz! Sorry, that Background is locked!`);
                    prefEmbed.setDescription(`The **${settingValueBackup}** background can only be used by the Bot's Developer, sorry!`);
                    message.channel.send(prefEmbed);
                    break;


                  default:
                    prefEmbed.setTitle(`Buzz! Sorry, that Background is locked!`);
                    prefEmbed.setDescription(`This background is currently locked for you...`);
                    message.channel.send(prefEmbed);
                    break;


                }

                return;

              }


















              // Update UserPrefs DB
              let updatePrefs = await UserPrefs.update({ background: settingValueBackup }, { where: { userID: message.author.id } })
              .catch(err => {
                console.error(err);
                prefEmbed.setTitle(`Something went wrong...`);
                prefEmbed.setDescription(`I was unable to update your background preferences. Please try again later...`);
                return message.channel.send(prefEmbed);
              });

              prefEmbed.setTitle(`Successfully updated preferences!`);
              prefEmbed.setDescription(`${message.author} preferences for rank background were updated to use the **${settingValueBackup}** background!`);
              return message.channel.send(prefEmbed);


            }

            break;

        }

      }
      

      // END OF COMMAND
    },
};
