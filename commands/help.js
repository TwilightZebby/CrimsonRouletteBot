const { PREFIX } = require('../config.js');
const Discord = require("discord.js");

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: '[command name]',
    commandType: 'general',
    execute(message, args) {
      const { commands } = message.client;
      const helpEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Help Module');






      if (!args.length) {

        helpEmbed.setTitle(`Here is a list of all my commands:`);
        helpEmbed.setDescription(`< > means that is required.\n[ ] means that is optional.\n| means either/or.\n**DO NOT include these symbols when typing out the commands!**`);

        // helpEmbed.addFields({ name: "\u200B", value: "\u200B" });

        helpEmbed.addFields({ name: "General Commands", value: commands.filter(command => command.commandType === 'general').map(command => command.name).join(', ') });
        helpEmbed.addFields({ name: "Informational Commands", value: commands.filter(command => command.commandType === 'info').map(command => command.name).join(', ') });

        helpEmbed.addFields({ name: "\u200B", value: `You can use \`${PREFIX}help [command]\` to get more info on a specific command!` });

        return message.channel.send(helpEmbed);

      }







      // Specific Command Help

      const name = args[0].toLowerCase();
      const command = commands.get(name);

      if(!command) {
        helpEmbed.addFields({ name: "\u200B", value: "Yo, that\'s not a vaild command!" });
        

        return message.channel.send(helpEmbed);

      } else {
        helpEmbed.setTitle(`${command.name} command:`);

        if(command.aliases) {
          helpEmbed.addFields({ name: "Aliases", value: `\u200B ${command.aliases.join(', ')}` });
        }
        if(command.description) {
          helpEmbed.addFields({ name: 'Description', value: `\u200B ${command.description}` });
        }
        if(command.usage) {
          helpEmbed.addFields({ name: 'Usage', value: `\u200B ${PREFIX}${command.name} ${command.usage}` });
        }

        return message.channel.send(helpEmbed);
      }

    },
};
