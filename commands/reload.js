let { PREFIX } = require('../config.js');
const { ConfigData, GuildLevels, LevelRoles, UserBG } = require('../bot_modules/tables.js');
const Discord = require("discord.js");
const { client } = require('../bot_modules/constants.js');
let functFile = require('../bot_modules/functions.js');

module.exports = {
    name: 'reload',
    description: 'Reloads the given command.',
    usage: '<command>',
    //aliases: [''],
    args: true,
    commandType: 'management',
    botDev: true,
    async execute(message, args) {

      PREFIX = await functFile.LoadPrefix(message.guild.id, ConfigData);

      // Grab the input
      let commandName = args.shift().toLowerCase();

      // Fetch command
      let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
      // if no command found
      if (!command) {
        return await message.reply(`There is no command with the name/alias of **${commandName}**`);
      }

      // Delete from cache
      delete require.cache[require.resolve(`./${commandName}.js`)];

      // Fetch updated command
      try {
        let newCommand = require(`./${commandName}.js`);
        client.commands.set(newCommand.name, newCommand);
        return await message.reply(`Successfully reloaded the **${commandName}** command!`);
      } catch (error) {
        console.error(error);
        return await message.reply(`There was an error while reloading the **${commandName}** command. Please see the Console Logs for more details...`);
      }


      //END OF COMMAND
    },
};
