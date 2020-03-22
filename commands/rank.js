const { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const Canvas = require('canvas');

// Made with help from the official Discord.JS Guide
// https://discordjs.guide/popular-topics/canvas.html

module.exports = {
    name: 'rank',
    description: 'Shows your current Level and Token Amount',
    usage: ' ',
    //aliases: [''],
    //args: true,
    guildOnly: true,
    commandType: 'info',
    async execute(message) {

      const rankEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Rank Info');

      let dbLevels = await GuildLevels.findOrCreate({ where: { guildID: message.guild.id, userID: message.author.id } })
      .catch(e => { 
        console.error(e);
        rankEmbed.setTitle(`Something went wrong...`);
        rankEmbed.setDescription(`There was an error fetching ${message.author}'s current Level/Tokens. Please try again later.`);
        return message.channel.send(rankEmbed);
      });

      let uLevel = dbLevels[0].userLevel;
      let uTokens = dbLevels[0].userTokens;
      
      // Canvas Stuff
      const canvas = Canvas.createCanvas(700, 250);
      const ctx = canvas.getContext('2d');
      const background = await Canvas.loadImage('./images/background.png'); // load background in
      
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Draws BG onto Canvas

      


      // Text!

      // Pass the entire Canvas object because you'll need to access its width, as well its context
      const applyText = (canvas, text) => {

	      // Declare a base size of the font
	      let fontSize = 70;

	      do {
		      // Assign the font to the context and decrement it so it can be measured again
		      ctx.font = `${fontSize -= 10}px sans-serif`;
		      // Compare pixel width of the text to the canvas minus the approximate avatar size
	        } while (ctx.measureText(text).width > canvas.width - 300);

	        // Return the result to use in the actual canvas
	        return ctx.font;
      };




      // DISPLAY NAME
      // Select the font size and type from one of the natively available fonts
	    ctx.font = applyText(canvas, message.member.displayName);
	    // Select the style that will be used to fill the text in
	    ctx.fillStyle = '#ffffff';
	    // Actually fill the text with a solid color
      ctx.fillText(message.member.displayName, canvas.width / 2.5, canvas.height / 2.6);



      // TOKENS
      ctx.font = '28px sans-serif';
	    ctx.fillStyle = '#ffffff';
      ctx.fillText(`Tokens: ${uTokens}`, canvas.width / 2.5, canvas.height / 1.3);


      // LEVELS
      ctx.font = '28px sans-serif';
	    ctx.fillStyle = '#ffffff';
      ctx.fillText(`Level: ${uLevel}`, canvas.width / 2.5, canvas.height / 1.6);





      // User Profile Pic
      ctx.strokeStyle = '#74037b';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Pick up the pen
	    ctx.beginPath();
	    // Start the arc to form a circle
	    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	    // Put the pen down
	    ctx.closePath();
	    // Clip off the region you drew on
      ctx.clip();
      
      const avatar = await Canvas.loadImage(message.member.user.displayAvatarURL({ format: 'png' }));
      ctx.drawImage(avatar, 25, 25, 200, 200);
      



      const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'rank.png'); // Loads Canvas into Discord Message
      return message.channel.send(attachment);


      //END OF COMMAND
    },
};
