let { PREFIX } = require('../config.js');
const Discord = require("discord.js");
const { ConfigData, GuildLevels, LevelRoles } = require('../bot_modules/tables.js');
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: '[command name]',
    commandType: 'general',
    async execute(message, args) {
      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);
      const { commands } = message.client;
      const helpEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Help Module');






      if (!args.length) {

        helpEmbed.setTitle(`Here is a list of all my commands:`);
        helpEmbed.setDescription(`< > means that is required.\n[ ] means that is optional.\n| means either/or.\n**DO NOT include these symbols when typing out the commands!**`);

        // helpEmbed.addFields({ name: "\u200B", value: "\u200B" });

        helpEmbed.addFields({ name: "General Commands", value: commands.filter(command => command.commandType === 'general').map(command => command.name).join(', ') });
        helpEmbed.addFields({ name: "Management Commands", value: commands.filter(command => command.commandType === 'management').map(command => command.name).join(', ') });
        helpEmbed.addFields({ name: "Informational Commands", value: commands.filter(command => command.commandType === 'info').map(command => command.name).join(', ') });
        helpEmbed.addFields({ name: "Roulette Commands", value: commands.filter(command => command.commandType === 'roulette').map(command => command.name).join(', ') });

        helpEmbed.addFields({ name: "\u200B", value: `You can use \`${PREFIX}help [command]\` to get more info on a specific command!` });

        return message.channel.send(helpEmbed);

      }







      // Fetch the command
      function commandSearch(name, commands) {

        // First, check Command Names
        let result = commands.get(name);

        // if undefined, check aliases
        if (!result) {

          for (let [key, value] of commands) {
            if (value.aliases === undefined) {
              continue;
            }

            if (value.aliases.includes(name)) {
              return commands.get(key);
            }
          };

        } else {

          return result;

        }
      }




      // Specific Command Help
      const name = args[0].toLowerCase();
      const command = commandSearch(name, commands);
      
      

      if(!command) {
        helpEmbed.setDescription("Yo, that\'s not a vaild command!");
        

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
