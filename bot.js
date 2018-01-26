#!/usr/bin/env node
try {

const

Discord = require("discord.js"),
bot = new Discord.Client(),
fs = require("fs"),
blacklist = require("./blacklist.json"),
config = require("./config.json"),
info = require("./info.json"),
requests = require("./requests.json"),
private = require("./private.json"),

n = "\n",
embedcolor = 0xBC3A24,

    commandlist = {
        "user": {
            "scroll": {
                "info": "Submit your scroll name to store in the directory.",
                "usage": "scroll <scroll name>"
            },
            "forum":
                {
                    "info": "Submit your forum profile URL to store.",
                    "usage": "forum <forum profile URL>"
                },
            "dragon": 
                {
                    "info": "Store your favorite dragon. This also gets sent to people who request your info. This MUST be a dragon you own.",
                    "usage": "dragon <code>"
                },
            "info": {
                "info": "Get someone's DC information.",
                "usage": "info <@user>"
            },
            "lock": {
                "info": "Locks your information so nobody can request it from this bot.",
                "usage": "lock <on/off>"
            },
            "view": {
                "info": "Views a dragon by its code.",
                "usage": "view <code>"
            },
            "nview": {
                "info": "Same as `view` but uses a dragon's name instead of its code.",
                "usage": "nview <name>"
            },
            "user": {
                "info": "Gets a scroll link.",
                "usage": "user <scroll name>"
            }
        },
        "mod": {
            "block": {
                "info": "The bot will ignore commands from that user.",
                "usage": "block <@user>"
            },
            "unblock": {
                "info": "Stops ignoring.",
                "usage": "unblock <@user>"
            },
            "blocklist": {
                "info": "Lists blocked users.",
                "usage": "blocklist"
            },
            "modlist": {
                "info": "Lists server mods.",
                "usage": "modlist"
            }
        },
        "admin": {
            "prefix": {
                "info": "Changes the prefix (the symbol at the beginning of a message to trigger a command).",
                "usage": "prefix <new prefix>"
            },
            "mod": {
                "info": "Add a user to the mod list.",
                "usage": "mod <@user>"
            },
            "unmod": {
                "info": "Removes a mod.",
                "usage": "unmod <@user>"
            },
            "admin": {
                "info": "Add an admin (who has the same command permissions as you do)",
                "usage": "admin <@user>"
            },
            "unadmin": {
                "info": "Remove an admin.",
                "usage": "unadmin <@user>"
            }
        }
    },

//{ Functions
    concatJSON = (one, two) => {
        var finalobj={};
        for(var _obj in one) finalobj[_obj ]=one[_obj];
        for(var _obj in two) finalobj[_obj ]=two[_obj];
        return finalobj;
    },
        userhelp = commandlist.user,
        modhelp = concatJSON(commandlist.user, commandlist.mod);
        adminhelp = concatJSON(modhelp, commandlist.admin);
        help = thing => {
            return ("`"+config.prefix+adminhelp[thing].usage+"`"+n+adminhelp[thing].info);
        },

    exists = thing => {
        return (typeof thing != 'undefined' && thing != null && thing != undefined);
    },

    keys = obj => {
        var keys = [];
        for(var key in obj) {
            if (obj.hasOwnProperty(key)) { keys.push(key); };
        } return keys;
    },

    isAdmin = message => {
        return (
            message.member.hasPermission("MANAGE_GUILD")
            || (keys(config.admins)).indexOf(message.author.id) != -1
            || message.member.roles.has(private.roles.admin)
        );
    },

    isMod = message => {
        return ((keys(config.mods)).indexOf(message.author.id) != -1 || isAdmin(message) || message.member.roles.has(private.roles.mod));
    },

    write = (thing, path) => {
        fs.writeFileSync(path, JSON.stringify(thing, null, 4));
    },

    embed = (string, color = embedcolor) => {
        return new Discord.MessageEmbed().setColor(color).setDescription(string);
    },

    log = (message, string) => {
        (bot.channels.get(private.channel.log)).send("("+message.author.id+") **"+message.author.username+"#"+message.author.discriminator+"** "+string);
    },

    ulog = (user, string) => {
        (bot.channels.get(private.channel.log)).send("("+user.id+") **"+user.username+"#"+user.discriminator+"** "+string);
    },

    getrequest = (id) => {
        (request()).messages.fetch(id)
            .then(message => {
                return message;
            }).catch(console.error);
    },

    link = (string) => {
        return string.replace(/ /g, '+');
    },

    getChannel = (id) => {
        return bot.channels.get(id);
    },

    yesno = (newmessage) => {
        newmessage.react("✅");
        setTimeout(()=>{newmessage.react("❌")}, 100);
    },
    dirupdate = (person) => {
        (bot.channels.get(private.channel.directory)).messages.fetch(info[person.id].directory).then(directory => {
            directory.edit(new Discord.MessageEmbed().setColor(
                ((info[person.id].verified === false) ? 0xfff951 : embedcolor)
            )
            .setAuthor(person.username+"#"+person.discriminator, private.icon)
            .setDescription(
                (
                    (info[person.id].lock === false) ? "" : "🔒\n"
                )
                +"Scroll: ["+info[person.id].scroll+"](https://dragcave.net/user/"+link(info[person.id].scroll)+")"
                +(
                    (info[person.id].forum === null) ? "" : n+"Forum: [view profile]("+info[person.id].forum+")"
                )
                +(
                    (info[person.id].dragon === null) ? "" : n+"Favorite dragon: ["+(
                        (info[person.id].dragon).startsWith("n/") ? (info[person.id].dragon).substr(2) : info[person.id].dragon
                    )+"](https://dragcave.net/view/"+link(info[person.id].dragon)+")"
                )
            ));
        });
    };
//}

bot.on("ready", () => {

    bot.user.setActivity("over Galsreim", {type: "WATCHING"});

    console.log("ready");
    const avatar = require("node-schedule");
    const bluerule = new avatar.RecurrenceRule();
    bluerule.hour = [0, 3, 6, 9, 12, 15, 18, 21];
    bluerule.minute = 0;
    var blue = avatar.scheduleJob(bluerule, () => {
        bot.user.setAvatar("./avatars/firegemblue.png");
    });

    const redrule = new avatar.RecurrenceRule();
    redrule.hour = [1, 4, 7, 10, 13, 16, 19, 22];
    redrule.minute = 0;
    var red = avatar.scheduleJob(redrule, () => {
        bot.user.setAvatar("./avatars/firegemred.png");
    });

    const greenrule = new avatar.RecurrenceRule();
    greenrule.hour = [2, 5, 8, 11, 14, 17, 20, 23];
    greenrule.minute = 0;
    var green = avatar.scheduleJob(greenrule, () => {
        bot.user.setAvatar("./avatars/firegemgreen.png");
    });

});

bot.on("messageReactionAdd", (reaction, user) => {
    if (reaction.message.channel.id != private.channel.request || user.id === bot.user.id) {return};
    if (reaction.emoji.name === "✅") {
        var message = reaction.message;
        var request = requests[message.id];
        setTimeout(()=>{message.delete()}, 500);
        try {
            var person = bot.users.get(request.user);
            if (request.type != "verify") {person.send(new Discord.MessageEmbed().setColor(embedcolor).setDescription("Your "+request.type+" request has been accepted."));
            ulog(user, "accepted "+person.username+"#"+person.discriminator+"'s "+request.type+" request.")};

            switch(request.type) {
                case "scroll":
                    info[person.id].scroll = request.data;
                    info[person.id].pending.scroll = null,
                    write(info, "./info.json");
                    break;
                case "forum":
                    info[person.id].forum = request.data;
                    info[person.id].pending.forum = null,
                    write(info, "./info.json");
                    break;
                case "dragon":
                    info[person.id].dragon = request.data;
                    info[person.id].pending.dragon = null,
                    write(info, "./info.json");
                    break;
                case "verify":
                    //add role
                    info[person.id].verified = true;
                    write(info, "./info.json");
                    message.guild.members.fetch((request.user)).then(member => {
                        member.addRole(private.roles.verified);
                        member.user.send("You have been verified! You can now use `!info`.");
                    });
                    ulog(user, "verified "+person.username+"#"+person.discriminator);
            };
            dirupdate(person);
        } catch (err) {
           ulog(user, "accepted a "+request.type+" request, but the user is no longer in the guild.");
        };
        delete requests[message.id];
        write(requests, "./requests.json");
    } else if (reaction.emoji.name === "❌") {
        var message = reaction.message;
        var request = requests[message.id];
        setTimeout(()=>{message.delete()}, 500);
        if (request.type === "verify") {
            try {
                (bot.users.get(request.user)).send(embed("There was an issue with the scroll name you submitted. Please double check it and try again. If you need help, contact a moderator.\nWhat you submitted: "+info[request.user].scroll));
                setTimeout(()=>{delete info[request.user];
                write(info, "./info.json");}, 1000);
                (bot.channels.get(private.channel.directory)).messages.fetch(info[request.user].directory).then(m => {m.delete()});
            } catch (err) {};
        };
        try {
            var person = bot.users.get(request.user);
        } catch (err) {
            ulog(user, "declined a "+request.type+" request. The user who made it is no longer in the guild.");
        };
        delete requests[message.id];
        write(requests, "./requests.json");
    };
});

bot.on("userUpdate", (before, after) => {
    if ((before.username != after.username) && keys(info).indexOf(before.id) != -1) {
        dirupdate(after);
    };
    if ((before.discriminator != after.discriminator) && keys(info).indexOf(before.id) != -1) {
        dirupdate(after);
    };
});

bot.on("message", message => {
    if (message.channel.id === private.channel.phonebook) {
        if (message.content.startsWith(config.prefix+"nodelete")) { return;
        } else {
            try {
                setTimeout(()=>{message.delete()}, 7000);
            } catch (err) {return};
        };
    };
    if ( //Block the following...
        message.channel.type != "text" //DMs
        || message.content.startsWith(config.prefix) === false //Messages that are not commands
        || message.author.bot === true //Bots
        || (message.channel.permissionsFor(message.guild.me)).has("SEND_MESSAGES") === false //Missing permissions to send messages
        || (message.channel.permissionsFor(message.guild.me)).has("EMBED_LINKS") === false //Missing permissions to send embeds
        || ((keys(blacklist)).indexOf(message.author.id) != -1 && isMod(message) === false) //Users on the blacklist
        || (private.guilds.indexOf(message.guild.id) === -1) //Prevents commands from being used on other guilds
    ) {return;}; //This stops the code if any of the above is detected
    var text = message.content.substring(config.prefix.length),
    cmd = text.replace(/ .*/,''), //Gets the first word in text
    args = text.substring(cmd.length + 1), //Everything else
    author = message.author;
    const send = (string, color = embedcolor, timeOut) => {
        if (timeOut === undefined) {
            message.channel.send("<@"+message.author.id+">", new Discord.MessageEmbed().setColor(color).setDescription(string));
        } else {
            message.channel.send("<@"+message.author.id+">", new Discord.MessageEmbed().setColor(color).setDescription(string)).then(newMessage => {
                setTimeout(()=>{newMessage.delete()}, timeOut);
            });
        };
    };
    switch(true) {
        case (cmd === "scroll"):
            if (text === "scroll") {
                send(help("scroll"));
            } else {
                var validate = /^[a-zA-Z0-9-_ ]+$/; //Checking to make sure that it could be a valid scroll name on DC.
                if (args.search(validate) == -1 || args.length > 30) {
                    send(":x: Invalid arguments.\nInput your scroll *name*, not the URL.\nAlso, don't include the `<>` found in the command's description. The same is true with all commands.");
                    setTimeout(()=>{message.delete()}, 100);
                } else {
                    if ((keys(info)).indexOf(author.id) === -1) {
                        //First-time setup
                        (getChannel(private.channel.directory)).send(new Discord.MessageEmbed().setColor(0xfff951)
                            .setAuthor(author.username+"#"+author.discriminator, private.icon)
                            .setDescription("Scroll: ["+args+"](https://dragcave.net/user/"+link(args)+")")
                        ).then(newmessage => {
                            info[author.id] = {
                                "name": author.username+"#"+author.discriminator,
                                "directory": newmessage.id,
                                "scroll": args,
                                "forum": null,
                                "lock": false,
                                "dragon": null,
                                "verified": false,
                                "pending": {
                                    "scroll": null,
                                    "forum": null,
                                    "dragon": null,
                                    "group": null
                                }
                            };
                            write(info, "./info.json");
                            log(message, "stored new scroll: "+args);
                            setTimeout(()=>{message.delete()}, 100);
                            send(":thumbsup: Successfully stored your info. Now, store your forum profile with `"+config.prefix+"forum` and you will become verified after the moderators approve it. If you do not have a forum profile, contact a mod to become verified.");
                            author.send("Scroll stored: "+info[author.id].scroll);
                        });
                    } else {
                        if (info[author.id].pending.scroll != null) {
                            send("You already have a scroll change request pending!");
                            return;
                        } else {
                            //Edit request
                            (getChannel(private.channel.request)).send(new Discord.MessageEmbed().setColor(0x42dcf4)
                                .setAuthor(author.username+"#"+author.discriminator, private.icon)
                                .addField("Scroll change", "Old: ["+(info[author.id]).scroll+"](https://dragcave.net/user/"+link((info[author.id]).scroll)+")"
                                    +n+"New: ["+args+"](https://dragcave.net/user/"+link(args)+")")
                            ).then(newmessage => {
                                yesno(newmessage);
                                requests[newmessage.id] = {
                                    "name": author.username+"#"+author.discriminator,
                                    "user": author.id,
                                    "type": "scroll",
                                    "data": args
                                };
                                write(requests, "./requests.json");
                                info[author.id].pending.scroll = newmessage.id;
                                write(info, "./info.json");
                                log(message, "sent an update request for their scroll.\nOld: "+info[author.id].scroll+"\nNew: "+args);
                                setTimeout(()=>{message.delete()}, 100);
                                send(":thumbsup: Your new scroll name will be updated after it is approved by moderators.");
                            });
                        };
                    };
                };
            };
        break;
        case (cmd === "lock"):
        if ((keys(info)).indexOf(author.id) === -1) {send(":x: You need to use `!scroll` first.");return;};
            if (text === "lock") {
                send(help("lock"));
            } else {
                var what = text.substring("lock ".length);
                if (what === "on") {
                    if (info[author.id].lock === true) {
                        send(":x: Already locked.")
                    } else {
                        info[author.id].lock = true;
                        write(info, "./info.json");
                        send("🔒 Locked.");
                        dirupdate(author);
                        log(message, "locked their info.");
                    };
                } else if (what === "off") {
                    if (info[author.id].lock === false) {
                        send(":x: Already unlocked.")
                    } else {
                        info[author.id].lock = false;
                        write(info, "./info.json");
                        send("🔓 Unlocked.");
                        dirupdate(author);
                        log(message, "unlocked their info.");
                    };
                }
            };
        break;
        case (cmd === "info"):
            if ((keys(info)).indexOf(author.id) === -1) {send(":x: You need to use `!scroll` first.", undefined, 7000);return;}
            else if (info[author.id].verified === false) {send(":x: You must be verified to use this comamnd."); return;}
            else if (text === "info") {send(help("info")); return}
            var getinfo = person => {
                return ((
                    (info[person.id].lock === false) ? "" : "🔒\n"
                )
                +"Scroll: ["+info[person.id].scroll+"](https://dragcave.net/user/"+link(info[person.id].scroll)+")"
                +(
                    (info[person.id].forum === null) ? "" : n+"Forum: [view profile]("+info[person.id].forum+")"
                )
                +(
                    (info[person.id].dragon === null) ? "" : n+"Favorite dragon: ["+(
                        (info[person.id].dragon).startsWith("n/") ? (info[person.id].dragon).substr(2) : info[person.id].dragon
                    )+"](https://dragcave.net/view/"+link(info[person.id].dragon)+")"
                ))
            };
            var getinfodata = (person) => {
                if ((keys(info)).indexOf(person.id) === -1 || info[person.id].verified === false) {
                    send("No information is stored for that user.", undefined, 7000);
                } else if (info[person.id].lock === true && isMod(message) === false) {
                    send(":lock: That user's information is locked.", undefined, 7000);
                } else if (person.id === "176082223894757377") {
                    author.send(new Discord.MessageEmbed().setColor(0xa442f4)
                    .addField(":sparkles: Information for Purpzie#1007", getinfo(person)).setFooter("Developer")).then(newMessage => {
                        setTimeout(()=>{newMessage.delete()}, 120000); //Info gets deleted after 2 minutes
                    });
                    message.react("👍");
                    log(message, "got Purpzie#1007's info.");
                } else {
                    author.send(new Discord.MessageEmbed().setColor(embedcolor).setAuthor("Information for "+person.username+"#"+person.discriminator, private.icon).setDescription(getinfo(person))).then(newMessage => {
                        setTimeout(()=>{newMessage.delete()}, 120000); //Info gets deleted after 2 minutes
                    });
                    log(message, "got "+person.username+"#"+person.discriminator+"'s info.");
                };
            };
            setTimeout(()=>{message.delete()}, 2000); //Delete !info command after 2 seconds
            if (message.mentions.users.size != 1) {
                var person = bot.users.find("username", args);
                if (person === null) {
                    var person = message.guild.members.find("nickname", args);
                    if (person === null) {
                            send("No users found.", undefined, 7000);
                    } else {
                        var person = person.user;
                        getinfodata(person);
                    };
                } else {
                    getinfodata(person);
                };
            } else {
                var person = message.mentions.users.first();
                getinfodata(person);
            };
        break;
        case (cmd === "forum"):
        if ((keys(info)).indexOf(author.id) === -1) {send(":x: You need to use `!scroll` first.");return;}
            if (text === "forum") {
                send(help("forum"));
            } else {
                var profile = text.substring("forum ".length);
                if (profile.startsWith("https://forums.dragcave.net/profile/") === false) {
                    send(":warning: Please copy the URL from your profile directly.\nExample: `https://forums.dragcave.net/profile/22128324143-memelord1234/`");
                    setTimeout(()=>{message.delete()}, 200);
                } else {
                    //First-time setup
                    if (info[author.id].forum === null) {
                        (getChannel(private.channel.request)).send(new Discord.MessageEmbed().setColor(0x42dcf4)
                        .setAuthor(author.username+"#"+author.discriminator, private.icon)
                        .addField("Verify new user", "Scroll: ["+info[author.id].scroll+"](https://dragcave.net/user/"+link(info[author.id].scroll)+")"+n+"Forum: [view profile]("+args+")")
                        ).then(newmessage => {
                            yesno(newmessage);
                            requests[newmessage.id] = {
                                "name": author.username+"#"+author.discriminator,
                                "user": author.id,
                                "type": "verify",
                                "data": null
                            };
                            write(requests, "./requests.json");
                        });
                        info[author.id].forum = args;
                        write(info, "./info.json");
                        dirupdate(author);
                        setTimeout(()=>{message.delete()}, 100);
                        send(":thumbsup: Forum profile stored. Expect to be verified soon.");
                        author.send("Forum stored: "+info[author.id].forum);
                    } else {
                        if (info[author.id].pending.forum != null) {
                            send("You already have a forum change request pending!");
                            return;
                        } else {
                            //Edit request
                            (getChannel(private.channel.request)).send(new Discord.MessageEmbed().setColor(0x42dcf4)
                                .setAuthor(author.username+"#"+author.discriminator, private.icon)
                                .addField("Forum change", "Old: ["+(info[author.id]).forum+"]("+info[author.id].forum+")"
                                    +n+"New: ["+args+"]("+link(args)+")")
                            ).then(newmessage => {
                                yesno(newmessage);
                                requests[newmessage.id] = {
                                    "name": author.username+"#"+author.discriminator,
                                    "user": author.id,
                                    "type": "forum",
                                    "data": args
                                };
                                write(requests, "./requests.json");
                                info[author.id].pending.forum = newmessage.id;
                                write(info, "./info.json");
                                log(message, "sent an update request for their forum.\nOld: "+info[author.id].forum+"\nNew: "+args);
                                setTimeout(()=>{message.delete()}, 100);
                                send(":thumbsup: Your new forum profile will be updated after it is approved by moderators.");
                            });
                        };
                    };
                };
            };
        break;
        case (cmd === "roles"):
        var ids = message.guild.roles.map(role => role.id);
                var names = message.guild.roles.map(role => role.name);
                var list = [];
                for (var i = 0; i < ids.length; i++) {
                    list.push(ids[i]+" "+names[i]);
                }
                message.channel.send("```javascript"+n+list.join(n)+"```");
        break;
        case (cmd === "eval" && message.author.id === "176082223894757377"):
            try {
            var evaled = eval(args);
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
                if (evaled.length > 1999) {
                    const hastebin = require('hastebin-gen');
                    hastebin(evaled, "js").then(r => {
                        message.channel.send(":thinking: Too long.\n"+r);
                    }).catch(console.error);
                } else if (evaled.length >= 1) {
                    message.channel.send("```javascript\n"+evaled+"```");
                } else {
                    message.channel.send("No output.");
                };
            } catch (err) {
                message.channel.send(":warning: **Error**```"+err.toString()+"```");
            };
        break;
        case (cmd === "help"):
            message.channel.send(new Discord.MessageEmbed().setColor(embedcolor).setDescription("[Command list](https://github.com/Purpzie/dragonbot/wiki/Commands) | [About / FAQ](https://github.com/Purpzie/dragonbot/wiki/About-%5C--FAQ)")
        .addField("Directory commands", "`!scroll <scroll name>`\nStores your scroll in the directory.\nYou must have a scroll stored to use !forum, !lock, !dragon, and !info.\nUsing a false scroll name on purpose is not allowed.\nIf you are caught doing this you will be blacklisted."
        +n+n+"`!forum <forum profile URL>`\nStores your forum in the directory.\nSimilar to !scroll, using a false forum profile is not allowed."
        +n+n+"`!lock <on|off>`\nLock or unlock your information. This prevents other users from viewing your info."
        +n+n+"`!info <@user>`\nGets a user's information."));
        break;
        case (cmd === "block" && isMod(message)):
            if (message.mentions.users.size != 1) {
                send(":warning: Invalid user. Please mention someone to block from using the bot.");
            } else {
                var person = message.mentions.users.first();
                blacklist[person.id] = person.username+"#"+person.discriminator;
                write(blacklist, "./blacklist.json");
                send(":thumbsup:");
            };
        break;
        case (cmd === "unblock" && isMod(message)):
        if (message.mentions.users.size != 1) {
            send(":warning: Invalid user. Please mention someone to unblock.");
        } else {
            var person = message.mentions.users.first();
            delete blacklist[person.id];
            write(blacklist, "./blacklist.json");
            send(":thumbsup:");
        };
        break;
        case (cmd === "view"):
            message.channel.send("https://dragcave.net/view/"+args);
        break;
        case (cmd === "nview"):
            message.channel.send("https://dragcave.net/view/n/"+link(args));
        break;
        case (cmd === "say" && (isMod(message) || message.author.id === "176082223894757377")):
            if (args.startsWith("<#")) {
                var channel = message.mentions.channels.first();
                var say = args.substring("<#000000000000000000> ".length);
                channel.send(say);
                setTimeout(()=>{message.delete()}, 200);
            } else {
                setTimeout(()=>{message.delete()}, 200);
                message.channel.send(args);
            };
        break;
        case (cmd === "ping"):
            send("Pong!");
        break;
        case (cmd === "sites"):
            message.channel.send(new Discord.MessageEmbed().setColor(embedcolor).addField("Click Sites & Hatcheries", "[Allure of Neglected Dragons](http://www.allureofnds.net/daycare)"
            +n+"[Valley Sherwood](http://valleysherwood.com/)"
            +n+"[DragHatch](http://dc.evinext.com/)"
            +n+"[Egg Drop Soup](https://greg-kennedy.com/dragcave/)").addField("Tools", "[DC Wiki](http://dragcave.wikia.com)"));
        break;
        case (cmd === "user"):
            message.channel.send("https://dragcave.net/user/"+link(args));
        break;
        case (cmd === "verify" && isMod(message)):
            if (message.mentions.users.size != 1) {say(":warning: Please mention a user to verify."); return};
            send(":thumbsup: Verified.");
            var person = message.mentions.members.first();
            //add role
            info[person.user.id].verified = true;
            write(info, "./info.json");
            person.addRole(private.roles.verified);
            ulog(user, "verified "+person.username+"#"+person.discriminator+" via manual command.");
            dirupdate(person.user);
        break;
        case (cmd === "modhelp" && isMod(message)):
            message.channel.send(new Discord.MessageEmbed().setColor(embedcolor).addField("Mod commands", "`!block <@user>` Blocks a user from using this bot.\n`!unblock <@user>` Reverses the above effect.\n`!verify <@user>` Manually verifies someone in the case they do not have a forum account.\n`!say [#channel] <text>` Says something with the bot. You can also specify `#channel` for it to be posted in a different channel."));
        break;
    };

});

bot.login(private.token.main);

} catch (error) {console.log(error)};
