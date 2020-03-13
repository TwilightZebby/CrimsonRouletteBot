const { PREFIX } = require('../config.js');
const Discord = require("discord.js");

module.exports = {
    name: 'guide',
    description: 'Use to see a brief guide on how this Bot works and what it does',
    usage: ' ',
    //aliases: [''],
    //args: true,
    commandType: 'general',
    execute(message) {
      const guideEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Guide Module');

      guideEmbed.setTitle(`Guide to Crimson Roulette Bot`);
      guideEmbed.addFields({ name: `\u200B`, value: `This is a placeholder for the Guide.\nPlease check again at a later date!` });

      return message.channel.send(guideEmbed);

      //END OF COMMAND
    },
};
