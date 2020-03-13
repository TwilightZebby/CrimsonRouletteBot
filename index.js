// Creating the veraibles needed
const fs = require('fs'); // Node's native file system
const Discord = require("discord.js"); // Bringing in Discord.js
const { client } = require('./bot_modules/constants.js'); // Brings in the Discord Bot's Client and Sequelize Database
const { PREFIX, TOKEN } = require('./config.js'); // Slapping the PREFIX and token into their own vars
const { ConfigData, GuildLevels } = require('./bot_modules/tables.js'); // Brings in the Databases
client.commands = new Discord.Collection(); // Extends JS's native map class
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Picks up all the .js files in the commands folder
const cooldowns = new Discord.Collection(); // For Cooldowns to work

for (const file of commandFiles) { // Slaps all the command files into the Collection
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}





// To make sure the bot is up and running
client.on("ready", () => {
  // Sync them Databases
  ConfigData.sync();
  GuildLevels.sync();

  client.user.setActivity(`${PREFIX}help`); // Sets a Playing Status on the Bot
  console.log("I am ready!");
});

















/***********************************************/
// WHEN BOT JOINS A GUILD
//     - Create Guild's entries into ConfigData Database
client.on('guildCreate', async (guild) => {

  // Add Guild to Config Database
  // NOT to Levelling DB since that is User-based not Guild-based
  try {

    const guildConfig = await ConfigData.create({
      guildID: guild.id,
      // Other values default to the default ones set in /bot_modules/tables.js
    });
    
  } catch (e) {

    // Catch errors
    return console.error(e);

  }

  // End of guildCreate Event
});

















/***********************************************/
// WHEN BOT LEAVES A GUILD
//    - Delete all Database entries for that Guild
client.on('guildDelete', async (guild) => {

  // Grab the Guild's ID and delete all entries in the Database for it
  const configDelete = await ConfigData.destroy({ where: { guildID: guild.id } })
        .catch(err => console.error(`ERROR: Something happened. - index.js guildDelete - \n${err}`));
  if(!configDelete) {
    console.log(`Nothing was deleted for ${guild.name} on Guild Leave`);
  }

  const levelDelete = await GuildLevels.destroy({ where: { guildID: guild.id } })
    .catch(err => console.error(`ERROR: Something happened. - index.js levelDelete - \n${err}`));
  if(!levelDelete) {
    return console.log(`Nothing was deleted for ${guild.name} on Guild Leave`);
  }

});
















/***********************************************/
/*THE COMMANDS*/
/*Runs whenever a message is sent in a command the Bot has access to*/

client.on("message", async (message) => {

  // If the msg does NOT start with the PREFIX, OR it was sent by the bot itself - STOP
  if (!message.content.startsWith(PREFIX) || message.author.bot) {
		return;
	};

  // Slides the PREFIX off the command
  const args = message.content.slice(PREFIX.length).split(/ +/);
  // Slaps the cmd into its own var
  const commandName = args.shift().toLowerCase();
  // If there is NOT a command with the given name or aliases, exit early
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;




  // COOLDOWNS
  // If a command has 'cooldown: x,' it will enable cooldown IN SECONDS
  if (!cooldowns.has(command.name)) {
     cooldowns.set(command.name, new Discord.Collection());
   }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
    }
   } else {
     timestamps.set(message.author.id, now);
     setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
   }






  // A check for if the user ran a command inside DMs
  // if a cmd has 'guildOnly: true,', it won't work in DMs
  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
  }

  // A check for if the user ran a command inside Guilds
  // if a cmd has 'dmOnly: true,', it won't work in Guilds
  if (command.dmOnly && message.channel.type !== 'dm') {
    return message.reply('I can\'t execute that command inside Guilds!')
  }

  // A check for missing parameters
  // If a cmd has 'args: true,', it will throw the error
  // Requires the cmd file to have 'usage: '<user> <role>',' or similar
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${PREFIX}${command.name} ${command.usage}\``;
      }
      return message.channel.send(reply);
  }





  

  // If there is, grab and run that command's execute() function
  try {
    command.execute(message, args);
  } // Any errors are caught here, and thrown back at the User and Console
  catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
  // Extra Error Catching
  process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

  /******************************************************/

});

/***********************************************/
// The token to connect the bot to the Bot Account on Discord
client.login(TOKEN);
