const { PREFIX } = require('../config.js');
const { PRIVATE, TRUSTED } = require('../bot_modules/guilds.js'); // Used for checking Command Access Perms per Guild
const Discord = require("discord.js");

module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    usage: '[command name]',
    commandType: 'general',
    guildAccess: 'all',
    execute(message, args) {
      const { commands } = message.client;
      const helpEmbed = new Discord.MessageEmbed().setColor('#07f51b').setFooter('Help Module');

      // CHECK WHICH GUILD COMMAND WAS USED IN
      // Private Server
      if (message.guild.id === PRIVATE && !args.length) {
        helpEmbed.setTitle('Here is a list of all my commands:');
        helpEmbed.setDescription(`< > means that is required.\n[] means that is optional.\n| means either/or.`);

        helpEmbed.addField('\u200B', 'Private Commands: Shown\nTrusted Commands: Shown');
        //helpEmbed.addField('\u200B', commands.map(command => command.name).join(', '));

        helpEmbed.addField(`General Commands`, commands.filter(command => command.commandType === 'general').map(command => command.name).join(', '));
        helpEmbed.addField(`Informational Commands`, commands.filter(command => command.commandType === 'information').map(command => command.name).join(', '));
        helpEmbed.addField(`Management Commands`, commands.filter(command => command.commandType === 'management').map(command => command.name).join(', '));
        helpEmbed.addField(`Fun Commands`, commands.filter(command => command.commandType === 'fun').map(command => command.name).join(', '));
        helpEmbed.addField('\u200B', `You can use \`${PREFIX}help [command name]\` to get more info on a specific command!`);

        return message.channel.send(helpEmbed);
      }
      // Trusted Servers
      else if (TRUSTED.includes(message.guild.id) && !args.length) {
        helpEmbed.setTitle('Here is a list of all my commands:');
        helpEmbed.setDescription(`< > means that is required.\n[] means that is optional.\n| means either/or.`);

        helpEmbed.addField('\u200B', 'Trusted Commands: Shown');
        //helpEmbed.addField('\u200B', commands.map(command => command.name).join(', '));

        helpEmbed.addField(`General Commands`, commands.filter(command => command.commandType === 'general' && command.guildAccess != 'private').map(command => command.name).join(', '));
        helpEmbed.addField(`Informational Commands`, commands.filter(command => command.commandType === 'information' && command.guildAccess != 'private').map(command => command.name).join(', '));
        helpEmbed.addField(`Management Commands`, commands.filter(command => command.commandType === 'management' && command.guildAccess != 'private').map(command => command.name).join(', '));
        helpEmbed.addField(`Fun Commands`, commands.filter(command => command.commandType === 'fun' && command.guildAccess != 'private').map(command => command.name).join(', '));
        helpEmbed.addField('\u200B', `You can use \`${PREFIX}help [command name]\` to get more info on a specific command!`);

        return message.channel.send(helpEmbed);
      }
      // Other Servers
      else if (!args.length) {
        helpEmbed.setTitle('Here is a list of all my commands:');
        helpEmbed.setDescription(`< > means that is required.\n[] means that is optional.\n| means either/or.`);
        
        //helpEmbed.addField('\u200B', commands.map(command => command.name).join(', '));

        helpEmbed.addField(`General Commands`, commands.filter(command => command.commandType === 'general' && command.guildAccess != 'private' && command.guildAccess != 'trusted').map(command => command.name).join(', '));
        helpEmbed.addField(`Informational Commands`, commands.filter(command => command.commandType === 'information' && command.guildAccess != 'private' && command.guildAccess != 'trusted').map(command => command.name).join(', '));
        helpEmbed.addField(`Management Commands`, commands.filter(command => command.commandType === 'management' && command.guildAccess != 'private' && command.guildAccess != 'trusted').map(command => command.name).join(', '));
        helpEmbed.addField(`Fun Commands`, commands.filter(command => command.commandType === 'fun' && command.guildAccess != 'private' && command.guildAccess != 'trusted').map(command => command.name).join(', '));
        helpEmbed.addField('\u200B', `You can use \`${PREFIX}help [command name]\` to get more info on a specific command!`);

        return message.channel.send(helpEmbed);
      }

      // Specific Command Help

      const name = args[0].toLowerCase();
      const command = commands.get(name);

      if(!command) {
        helpEmbed.addField('\u200B', `Yo, that\'s not a valid command!!`);

        return message.channel.send(helpEmbed);

      } else {
        helpEmbed.setTitle(`${command.name} command:`);

        if(command.aliases) {
          helpEmbed.addField('Aliases', `\u200B ${command.aliases.join(', ')}`);
        }
        if(command.description) {
          helpEmbed.addField('Description', `\u200B ${command.description}`);
        }
        if(command.usage) {
          helpEmbed.addField('Usage', `\u200B ${PREFIX}${command.name} ${command.usage}`);
        }

        return message.channel.send(helpEmbed);
      }

    },
};
