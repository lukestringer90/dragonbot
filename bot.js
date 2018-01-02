const Discord = require("discord.js");
const fs = require("fs");
function keys(obj) {
    var keys = [];
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        };
    }return keys;
};
const bot = new Discord.Client();
const n = "\n";
bot.on("ready", () => {
    console.log("ready");
    bot.on("message", message => {
        var blacklist = require("./blacklist.json");
        var config = require("./config.json");
        var info = require("./info.json");
        if (((keys(blacklist)).indexOf(message.author.id) != -1 || message.author.bot === true || (message.channel.permissionsFor(message.guild.me)).has("SEND_MESSAGES") === false) && message.guild.owner.id != message.author.id) {
            return;
        } else if (message.content.startsWith(config.prefix)) {
            var msg = message.content.substring(config.prefix.length);
            if ((keys(config.admins)).indexOf(message.author.id) != -1 || message.guild.owner.id === message.author.id) {
                if (msg.startsWith("block ")) {
                    if (message.mentions.users.size != 1) {
                        message.channel.send(":warning: Please mention a user to block.\n`"+config.prefix+"block <user>`");
                    } else {
                        var person = message.mentions.users.first()
                        var id = (message.mentions.users.first()).id;
                        if ((keys(config.admins)).indexOf(id) != -1) {
                            message.channel.send(":warning: You can't block a bot mod.");
                        } else {
                            blacklist[id] = person.username+"#"+person.discriminator;
                            fs.writeFileSync("./blacklist.json", JSON.stringify(blacklist, null, 4));
                            message.channel.send(":thumbsup: Member blocked.");
                        };
                    };
                } else if (msg.startsWith("unblock ")) {
                    if (message.mentions.users.size != 1) {
                        message.channel.send(":Warning: Please mention a user to unblock.\n`"+config.prefix+"unblock <user>`");
                    } else {
                        var id = (message.mentions.users.first()).id;
                        delete blacklist[id];
                        fs.writeFileSync("./blacklist.json", JSON.stringify(blacklist, null, 4));
                        message.channel.send(":thumbsup: Member unblocked.");
                    };
                } else if (msg === "blocklist") {
                    var list = [];
                    (keys(blacklist)).forEach(id => {
                        list.push(blacklist[id])
                    })
                    if (list.length === 0) {
                        message.channel.send("There are no blocked users.");
                    } else {
                        list.join(n);
                        message.channel.send("List of blocked users:```"+list+"```");
                    };
                } else if (msg === "modlist") {
                    var list = [];
                    (keys(config.admins)).forEach(id => {
                        list.push(config.admins[id])
                    })
                    if (list.length === 0) {
                        message.channel.send("There are no bot mods.");
                    } else {
                        list.join(n);
                        message.channel.send("List of bot mods:```"+list+"```");
                    };
                };
                if (message.author.id === message.guild.owner.id) {
                    if (msg.startsWith("prefix ")) {
                        var newprefix = msg.substring("prefix ".length);
                        config.prefix = newprefix;
                        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
                        message.channel.send(":thumbsup: New prefix is `"+config.prefix+"`");
                    } else if (msg.startsWith("add ")) {
                        if (message.mentions.users.size != 1) {
                            message.channel.send(":Warning: Please mention a user to add to the mod list.\n`"+config.prefix+"add <user>`");
                        } else {
                            var person = message.mentions.users.first()
                            var id = (message.mentions.users.first()).id;
                            config.admins[id] = person.username+"#"+person.discriminator;
                            fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
                            message.channel.send(":thumbsup: Member added to the mod list.");
                        };
                    } else if (msg.startsWith("remove ")) {
                        if (message.mentions.users.size != 1) {
                            message.channel.send(":Warning: Please mention a user to remove from the mod list.\n`"+config.prefix+"remove <user>`");
                        } else {
                            var id = (message.mentions.users.first()).id;
                            delete config.admins[id];
                            fs.writeFileSync("./config.json", JSON.stringify(config, null, 4));
                            message.channel.send(":thumbsup: Member removed from the mod list.");
                        };
                    };
                };
            };
            if (msg.startsWith("store ")) {
                setTimeout(function(){message.delete()}, 200);
                if (msg.indexOf(" | ") === -1) {
                    message.channel.send(":warning: <@"+message.author.id+"> Incorrect format, try again.\n`"+config.prefix+"store <scroll name> | <forum profile URL>`");
                } else {
                    var full = msg.substring("store ".length);
                    var split = full.split(' | ', 2);
                    var scroll = split[0];
                    var forum = split[1];
                    if (forum.indexOf("https://forums.dragcave.net/profile/") === -1) {
                        message.channel.send(":warning: <@"+message.author.id+"> Invalid forum profile URL. Copy it directly from your profile page.");
                    } else {
                        info[message.author.id] = {
                            "scroll": scroll,
                            "forum": forum,
                            "locked": false
                        };
                        fs.writeFileSync("./info.json", JSON.stringify(info, null, 4));
                        message.channel.send(":thumbsup: <@"+message.author.id+"> Information stored.");
                    };
                };
            } else if (msg.startsWith("info ")) {
                if (message.mentions.users.size != 1) {
                    message.channel.send(":warning: Please mention someone to get their scroll and forum information.\n`"+config.prefix+"info <user>`");
                } else {
                    var id = (message.mentions.users.first()).id;
                    if ((keys(info)).indexOf(id) === -1) {
                        message.channel.send("There is no stored information for that user.");
                    } else if (info[id].locked === true) {
                        message.channel.send(":lock: That user's information is locked.");
                    } else {
                        message.react("👍");
                        message.author.send(new Discord.MessageEmbed()
                        .setColor(0xBC3A24)
                        .addField("Information for "+message.cleanContent.substring((config.prefix+"info @").length),"Scroll: ["+info[id].scroll+"](https://dragcave.net/user/"+info[id].scroll+")\nForum: [visit profile]("+info[id].forum+")")
                        );
                    };
                };
            } else if (msg === "lock") {
                info[message.author.id].locked = true;
                fs.writeFileSync("./info.json", JSON.stringify(info, null, 4));
                message.channel.send(":lock: Information locked.");
            } else if (msg === "unlock") {
                info[message.author.id].locked = false;
                fs.writeFileSync("./info.json", JSON.stringify(info, null, 4));
                message.channel.send(":unlock: Information unlocked.");
            } else if (msg.startsWith("delete")) {
                var dankmemes = msg.substring("delete ".length);
                if (dankmemes === "confirm") {
                    delete info[message.author.id];
                    fs.writeFileSync("./info.json", JSON.stringify(info, null, 4));
                    message.channel.send(":white_check_mark: Deleted your information from this bot's database.");
                } else {
                    message.channel.send("Are you sure you want to permanently delete your DC information from this bot? Use `"+config.prefix+"delete confirm` to confirm this action.");
                };
            } else if (msg === "help") {
                message.channel.send("**[Commands]**"+n+"`"+config.prefix+"store <scroll name> | <forum profile URL>` Store or update your DC information in the database."
                +n+"`"+config.prefix+"info <mention a user>` Get that user's Dragon Cave information DMed to you."
                /*+n+"`"+config.prefix+"botinfo` Gets some information about the bot and the server."*/
                +n+"`"+config.prefix+"lock` Your DC information no longer gets DMed to anyone."
                +n+"`"+config.prefix+"unlock` Allows others to get your DC information DMed to them again."
                +n+"`"+config.prefix+"delete` Deletes your information from the bot entirely.");
            } else if (msg === "modhelp" && (((keys(config.admins)).indexOf(message.author.id) != -1) || message.guild.owner.id === message.author.id)) {
                message.channel.send("**[Mod comamnds]**"+n+"`"+config.prefix+"block <user>` The bot will ignore commands made by that user."
                    +n+"`"+config.prefix+"unblock <user>` Stop ignoring commands by that user."
                    +n+"`"+config.prefix+"blocklist` List the people who are blocked from the bot."
                    +n+"`"+config.prefix+"modlist` List the people designated as bot mods.");
            } else if (msg === "ownerhelp" && message.guild.owner.id === message.author.id) {
                message.channel.send("**[Server owner commands]**"+n+"`"+config.prefix+"prefix <new prefix>` Change the bot's prefix used to trigger commands. It is currently `"+config.prefix+"`"
                +n+"`"+config.prefix+"add <user>` Adds a user to the bot mod list."
                +n+"`"+config.prefix+"remove <user>` Removes a user from the bot mod list.");
            };
        };
    });
});
bot.login("oops you thought you were going to steal the token, didn't you");