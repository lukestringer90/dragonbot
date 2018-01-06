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
        );
    },

    isMod = message => {
        return (config.mods.indexOf(message.author.id) != -1 || isAdmin(message));
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
            directory.edit(new Discord.MessageEmbed().setColor(embedcolor)
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
    console.log("ready");
    const avatar = require("node-schedule");
    const bluerule = new avatar.RecurrenceRule();
    bluerule.hour = [0, 3, 6, 9, 12, 15, 18, 21];
    bluerule.minute = 0;
    var blue = avatar.scheduleJob(bluerule, () => {
        bot.user.setAvatar("./avatars/firegemblue.png");
        (bot.users.get("176082223894757377")).send((new Date).getHours()+" blue");
    });

    const redrule = new avatar.RecurrenceRule();
    redrule.hour = [1, 4, 7, 10, 13, 16, 19, 22];
    redrule.minute = 0;
    var red = avatar.scheduleJob(redrule, () => {
        bot.user.setAvatar("./avatars/firegemred.png");
        (bot.users.get("176082223894757377")).send((new Date).getHours()+" red");
    });

    const greenrule = new avatar.RecurrenceRule();
    greenrule.hour = [2, 5, 8, 11, 14, 17, 20, 23];
    greenrule.minute = 0;
    var green = avatar.scheduleJob(greenrule, () => {
        bot.user.setAvatar("./avatars/firegemgreen.png");
        (bot.users.get("176082223894757377")).send((new Date).getHours()+" green");
    });

});

bot.on("messageReactionAdd", (reaction, user) => {
    if (reaction.message.channel.id != private.channel.request || user.id === bot.user.id) {return};
    if (reaction.emoji.name === "✅") {
        var message = reaction.message;
        var request = requests[message.id];
        setTimeout(()=>{message.delete()}, 500);
        // try {
            var person = bot.users.get(request.user);
            person.send(new Discord.MessageEmbed().setColor(embedcolor).setDescription("Your "+request.type+" request has been accepted."));
            ulog(user, "accepted "+person.username+"#"+person.discriminator+"'s "+request.type+" request.");

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
                    person.send(new Discord.MessageEmbed().setColor(embedcolor).setDescription("You have been verified."));
            };
            dirupdate(person);
        // } catch (err) {
        //    ulog(user, "accepted a "+request.type+" request, but the user is no longer in the guild.");
        //};
        delete requests[message.id];
        write(requests, "./requests.json");
    } else if (reaction.emoji.name === "❌") {
        var message = reaction.message;
        var request = requests[message.id];
        setTimeout(()=>{message.delete()}, 500);
        try {
            var person = bot.users.get(request.user);
        } catch (err) {
            ulog(user, "declined a "+request.type+" request. The user who made it is no longer in the guild.");
        };
        delete requests[message.id];
        write(requests, "./requests.json");
    };
});

bot.on("message", message => {
    if ( //Block the following...
        message.channel.type != "text" //DMs
        || message.content.startsWith(config.prefix) === false //Messages that are not commands
        || message.author.bot === true //Bots
        || (message.channel.permissionsFor(message.guild.me)).has("SEND_MESSAGES") === false //Missing permissions to send messages
        || (message.channel.permissionsFor(message.guild.me)).has("EMBED_LINKS") === false //Missing permissions to send embeds
        || (keys(blacklist)).indexOf(message.author.id) != -1 //Users on the blacklist
        || message.guild.id != private.guild //Prevents commands from being used on other guilds
    ) {return;}; //This stops the code if any of the above is detected
    var text = message.content.substring(config.prefix.length),
    cmd = text.replace(/ .*/,''), //Gets the first word in text
    args = text.substring(cmd.length + 1), //Everything else
    author = message.author;
    const send = (string, color = embedcolor) => {
        message.channel.send("<@"+message.author.id+">", new Discord.MessageEmbed().setColor(color).setDescription(string));
    };
    switch(true) {
        case (cmd === "scroll"):
            if (text === "scroll") {
                send(help("scroll"));
            } else {
                var validate = /^[a-zA-Z0-9-_ ]+$/; //Checking to make sure that it could be a valid scroll name on DC.
                if (args.search(validate) == -1 || args.length < 4 || args.length > 30) {
                    send(":x: Invalid arguments.\nInput your scroll *name*, not the URL.\nAlso, don't include the `<>` found in the command's description. The same is true with all commands.");
                } else {
                    if ((keys(info)).indexOf(author.id) === -1) {
                        //First-time setup
                        (getChannel(private.channel.directory)).send(new Discord.MessageEmbed().setColor(embedcolor)
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
                                "pending": {
                                    "scroll": null,
                                    "forum": null,
                                    "dragon": null
                                }
                            };
                            write(info, "./info.json");
                            log(message, "stored new scroll: "+args);
                            (getChannel(private.channel.request)).send(new Discord.MessageEmbed().setColor(0x42dcf4)
                            .setAuthor(author.username+"#"+author.discriminator, private.icon)
                            .addField("Verify new user", "Scroll: ["+args+"](https://dragcave.net/user/"+link(args)+")")
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
                            setTimeout(()=>{message.delete()}, 100);
                            send(":thumbsup: Successfully stored your info.");
                        });
                    } else {
                        if (info[author.id].pending.scroll != null) {
                            send("You already have a scroll change request pending!");
                            return;
                        };
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
        if ((keys(info)).indexOf(author.id) === -1) {send(":x: You need to use `!scroll` first.");return;}
        else if (text === "info") {send(help("info"))}
        else if (message.mentions.users.size != 1) {
            send(":warning: Invalid user. Mention a user to get their info.");
        } else {
            var person = message.mentions.users.first();
            getinfo = person => {
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
            if ((keys(info)).indexOf(person.id) === -1) {
                send("No information is stored for that user.");
            } else if (info[person.id].lock === true /* && isMod(message) === false */) {
                send(":lock: That user's information is locked.");
            } else if (person.id === "176082223894757377") {
                author.send(new Discord.MessageEmbed().setColor(0xa442f4)
                .addField(":sparkles: Information for Purpzie#1007", getinfo(person)).setFooter("Developer"));
                log(message, "got Purpzie#1007's info.");
            } else {
                author.send(new Discord.MessageEmbed().setColor(embedcolor).setAuthor("Information for "+person.username+"#"+person.discriminator, private.icon).setDescription(getinfo(person)))
                log(message, "got "+person.username+"#"+person.discriminator+"'s info.");
            };
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
                } else {
                    info[author.id].forum = args;
                    write(info, "./info.json");
                    setTimeout(()=>{message.delete()}, 100);
                    send(":thumbsup: Forum profile stored.");
                    log(message, "set their forum profile (<"+args+">)");
                    dirupdate(author);
                };
            };
        break;
    };

});

bot.login(private.token.main);

} catch (error) {console.log(error)};