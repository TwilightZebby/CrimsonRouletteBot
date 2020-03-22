const { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels } = require('../bot_modules/tables.js');
const Discord = require("discord.js");

module.exports = {
    name: 'top',
    description: 'Shows the top 10 of this Server',
    usage: ' ',
    //aliases: [''],
    //args: true,
    guildOnly: true,
    commandType: 'info',
    async execute(message) {
      
      const topEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Top 10');

      let lvldb = await GuildLevels.findAll({ where: { guildID: message.guild.id } })
      .catch(e => { 
        console.error(e);
        rankEmbed.setTitle(`Something went wrong...`);
        rankEmbed.setDescription(`There was an error fetching ${message.guild.name}'s Levels. Please try again later.`);
        return message.channel.send(rankEmbed);
      });


      
      // TURN INTO OBJECT TO SORT IN HIGHEST TO LOWEST ORDER
      // First, sort by Levels
      let levelObj = Object.values(lvldb);
      let lvlSorted; // To know when to break out of the Do-While Loop

      do {

          lvlSorted = false; // If this stays false, then sorting has been completed!

          for ( let i = 0; i < levelObj.length - 1; i++ ) {

              if ( levelObj[i].userLevel < levelObj[i + 1].userLevel ) {

                  let temp = levelObj[i];
                  levelObj[i] = levelObj[i + 1];
                  levelObj[i + 1] = temp;

                  lvlSorted = true; // Lets code know that we did a swap with values, and as such, continues the Loop

              }
          }
      } while ( lvlSorted === true );



      // Now, sort by Tokens in a different Object
      let tokenObj = Object.values(lvldb);
      let tokenSorted;

      do {

        tokenSorted = false;

        for ( let i = 0; i < tokenObj.length - 1; i++ ) {

          if ( tokenObj[i].userTokens < tokenObj[i + 1].userTokens ) {

            let temp = tokenObj[i];
            tokenObj[i] = tokenObj[i + 1];
            tokenObj[i + 1] = temp;

            tokenSorted = true;

          }
        }
      } while ( tokenSorted === true );




      // Now to display the top ten
      let topLevels = []; // To store the top Levels in
      let topTokens = []; // to store the top Tokens in


      // First, if there aren't actually ten Members in the Guild's Database
      if ( lvldb.length < 10 ) {

        for ( let i = 0; i < lvldb.length; i++ ) {

          // Resolve the ID into a Member Object so that we can fetch the Display Name
          let lMember = message.guild.members.resolve(levelObj[i].userID);
          let tMember = message.guild.members.resolve(tokenObj[i].userID);
          // Now for the rest of the data we need
          let lLevel = levelObj[i].userLevel;
          let tTokens = tokenObj[i].userTokens;

          // Form the String and dump into correct Array
          let lString = (i + 1) + `) ` + `\<\@${lMember.id}\>` + ` - Level ` + lLevel;
          let tString = (i + 1) + `) ` + `\<\@${tMember.id}\>` + ` - ` + tTokens + ` Tokens`;

          topLevels.push(lString);
          topTokens.push(tString);

        }

      } else {

        for ( let i = 0; i < 10; i++ ) {

          // Resolve the ID into a Member Object so that we can fetch the Display Name
          let lMember = message.guild.members.resolve(levelObj[i].userID);
          let tMember = message.guild.members.resolve(tokenObj[i].userID);
          // Now for the rest of the data we need
          let lLevel = levelObj[i].userLevel;
          let tTokens = tokenObj[i].userTokens;

          // Form the String and dump into correct Array
          let lString = (i + 1) + `) ` + `\<\@${lMember.id}\>` + ` - Level ` + lLevel;
          let tString = (i + 1) + `) ` + `\<\@${tMember.id}\>` + ` - ` + tTokens + ` Tokens`;

          topLevels.push(lString);
          topTokens.push(tString);

        }

      }



      // Now create the Embed
      topEmbed.setTitle(`${message.guild.name} Leaderboard`);
      topEmbed.setThumbnail(message.guild.iconURL());
      topEmbed.addFields(
        { name: `Top Levels:`, value: topLevels.join(`\n`) },
        { name: `Top Tokens:`, value: topTokens.join(`\n`) }
      );

      return message.channel.send(topEmbed);


      //END OF COMMAND
    },
};
