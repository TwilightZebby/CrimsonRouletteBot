# ARCHIVED OLD CODE
I have rewritten the code for my Bot, and have renamed it from "Crimson Roulette" to "Crimson Levels".

My new code is stored in a new GitHub Repro. ~~You can find my Bot on [top.gg](https://top.gg/bot/657859837023092746)~~ Bot was shut down, you can find [it on this Repro](https://github.com/TwilightZebby/CrimsonLevelsBot)

Below is a copy of the old description before this rewrite.

---
# Crimson Roulette Bot

CrimsonRoulette is yet another Levelling Bot. However, it's aim is to be more unique!

As such, we offer Roulette Commands and the possibility of levelling *down* as well as up!

**Don't worry about Permissions** - we only ask for the ones we need when you invite the Bot to your Server.

![Image detailing why we ask for certain permissions](https://i.imgur.com/oQyFRqv.png)

---

## Configurable options
*Using the c!config command - all config commands start with c!config and use forward slashes ( / ) to seperate options
Do NOT include the <> or pipes ( | ) when typing these out!*

- `allow levelling / <true|false>` -> Used to toggle if the Bot gives Tokens (our EXP)/Levels. Useful for temp-disabling to tweak stuff
> Default value: `true`

- `level downs / <true|false>` -> Toggle if people can level down or not when using the Roulette Commands. I know not all servers will want this on.
> Default value: `true`

- `broadcast channel / <#channelMention|null>` -> Set (if any) the channel for Level up/down messages to appear in. Use `null` to disable
> Default value: `null`

- `risky roulette / <true|false>` -> Toggle the c!cr command. Useful for if Servers don't want the chance of multiple members suddenly gaining/losing levels from one command
> Default value: `false`

- `roulette commands / <true|false>` -> Toggle both Roulette Commands. If disabled - this just becomes a standard Levelling Bot ;-;
> Default value: `true`

- `lvl up message / <message>` - Customise the message that appears for Level Ups!
- `lvl down message / <message>` - Customise the message that appears for Level Downs!
> These must include the term `user` (as a placeholder for the User who levelled up) and the term `levelNum` (placeholder for the User's new Level)

---

## Levelling Roles
We also have support to give Roles when Users reach a certain Level!

You can find out how to do this using the `c!config levels / guide` command.

---

## Command List
<> = Required. \[\] = Optional. *Do NOT include these when typing out commands*

- `help [command]` -> Help command. Shows a list of all commands, or help on a specific command.
- `info` -> Shows basic information about the Bot.
- `ping` -> Returns your ping between you and the Bot in milliseconds (ms). 
- `prefix` -> Shows the Bot's prefix. *Ability to change the prefix is coming soon*
- `reset` -> Used to set all the Users' Levels and Tokens to zero (0) for the Guild this is used in.
- `config` -> Configuration Module. See above.
- `rank` -> Shows what your current Token amount and Level are for the Guild this is used in.
- `top` -> Shows the top 10 Users (for that Guild) in Level and Token amount.
- `tr <bet>` -> Token Roulette Command. Use to bet your Tokens and test your luck!
- `cr <bet>` -> Same as `tr`, but includes risky results that can affect multiple User's Levels/Tokens! (Within that Guild)

---

## Other stuff
We also have the basic Levelling Bot stuff, such as a Top 10 command, and the ability for *Server Owners* to reset all the Levels in their Server.

This Bot is in active development, and we welcome feedback or suggestions over at our Support Server! ;)

---
This Bot uses Discord.js v12.

[Official Discord.js Guide](https://discordjs.guide/preparations/)

[Official Documentation for Discord.js v12](https://discord.js.org/#/docs/main/master/)

---
