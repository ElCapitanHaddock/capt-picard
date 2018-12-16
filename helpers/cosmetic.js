

const memeLib = require('nodejs-meme-generator');
const memeGenerator = new memeLib();
var fs = require("fs")
const dogeify = require('dogeify-js');

var Cosmetic = function(perspective, translate, client, Discord) {
    /*C O S M E T I C
    usable by anyone*/
    var self = this
    
    self.about = function(msg, ctx, config, cb) {
        switch(ctx) {
            case "setup":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Setting up Ohtred")
                embed.addField("prefix [prefix]", "to set the server prefix")
                embed.addField("channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel]", "to link one of the features to a channel")
                embed.addField("emote [upvote|downvote|report] [emote]", "to set the emote to its corresponding mechanic.")
                embed.addField("permit [role]", "to permit a rolename to interact with me. If the role is unmentionable, use its ID instead")
                embed.addField("unpermit [role]", "to remove a role from interacting with me")
                embed.addField("reportable [channel]", "to add a channel to the list where messages are reportable")
                embed.addField("unreportable [channel]", "to remove a channel from the reportable list")
                embed.addField("blacklist [channel]", "to blacklist a channel")
                embed.addField("unblacklist [channel]", "to unblacklist a channel")
                embed.addField("config [mod_upvote|mod_downvote|mod_upvote2|mod_downvote2|petition_upvote|report_vote] [count]", "to set a voting threshold")
                embed.addField("lockdown [number 0-2]", "to lockdown the server against raiders (0: none, 1: autokick, 2: autoban)")
                embed.addField("report_time [number 10+]", "to set the amount of time a user gets muted for a report")
                embed.addField("counter [number 1-50]", "to set the change in # of users online in order to update the counter.\nIncrease if it's flooding your audits, decrease if it's not updating fast enough.")
                embed.addField("about usage", "learn how to use Ohtred after you set everything up\n......\n")
                embed.addField("**Join the support server and spam ping me**", "https://discord.gg/46KN5s8")
                cb(null, {embed})
                break;
            case "usage":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Main Commands")
                embed.addField("propose [description]", "to put your idea to vote", true)
                embed.addField("motion [threshold] [description]", "for a custom admin vote",true)
                embed.addField("alert [severity 1-4]", "to troll ping mods")
                embed.addField("analyze [text]", "to predict toxicity",true)
                embed.addField("translate [language] [text]", "to translate to that language", true)
                embed.addField("meme [url] [cap|tion]", "to make a meme")
                embed.addField("about","get a list of help commands", true)
                embed.addField("Other", "Report messages with your server's :report: emote\n"
                + "Name a category 🔺 and it will turn it into an online users counter",true)
                cb(null, {embed})
                break;
            case "management":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Management Commands")
                embed.addField("mute [user] [time]", "to mute a user", true)
                embed.addField("unmute [user]", "to unmute a user",true)
                embed.addField("kick [user]", "to kick a user")
                embed.addField("ban [user]", "to ban a user",true)
                embed.addField("unban [user]", "to unban a user", true)
                embed.addField("role [user] [role]", "to add/remove a role from a user", true)
                embed.addField("warn [user] [text]", "to send a user a warning DM", true)
                embed.addField("wash [1-100]", "to purge messages from the channel", true)
                embed.addField("autorole [role]", "to set an autorole", true)
                embed.addField("Automod","@Ohtred about automod")
                cb(null, {embed})
                break;
            case "server":
                var embed = new Discord.RichEmbed()
                embed.setTitle(config.name + " | Prefix: " + config.prefix)
                var permits = ""
                for (var i = 0; i < config.permissible.length; i++) {
                    permits += "<@&" + config.permissible[i] + ">\n"
                }
                embed.addField("Permitted Roles", (permits.length != 0) ? permits : "None set")
                embed.addField("Muted role", (config.mutedRole) ? "<@&"+config.mutedRole+">" : "None set", true)
                embed.addField("Auto-role", (config.autorole) ?  "<@&"+config.autorole+">" : "None set")
                embed.addField(
                    "Channels",
                    "  modvoting : <#"+config.channels.modvoting+">\n"+
                    "  modannounce : <#"+config.channels.modannounce+">\n"+
                    "  modactivity : <#"+config.channels.modactivity+">\n"+
                    "  feedback : <#"+config.channels.feedback+">\n"+
                    "  reportlog : <#"+config.channels.reportlog+">")
                embed.addField(
                    "Vote Thresholds",
                    "  Mod votes need "+config.thresh.mod_upvote+" "+config.upvote+" to pass\n"+
                    "  Mod votes need "+config.thresh.mod_downvote+" "+config.downvote+" to fail\n"+
                    "  Petitions need " +config.thresh.petition_upvote+" "+config.upvote+" to progress\n"+
                    "  Messages need "+config.thresh.report_vote+" "+config.report+" to be reported", true)
                embed.addField(    
                    "Intervals",
                    "  The # online counter display is updated with changes of " + config.counter + "\n"+
                    "  Users are muted for " + config.report_time + " seconds as a report punishment")
                
                var reports = ""
                for (var i = 0; i < config.reportable.length; i++) {
                    reports += "<#" + config.reportable[i] + ">\n"
                }
                embed.addField("Reportable Channels", (reports.length != 0) ? reports : "None set")
                
                var blacklist = ""
                for (var i = 0; i < config.blacklist.length; i++) {
                    blacklist += "<#" + config.blacklist[i] + ">\n"
                }
                embed.addField("Blacklisted Channels", (blacklist.length != 0) ? blacklist : "None set", true)
                embed.addField("Lockdown Level", (config.lockdown) ? config.lockdown : "None set")
                embed.setThumbnail(msg.guild.iconURL)
                embed.setFooter("🆔 "+msg.guild.id)
                cb(null, {embed})
                break;
            case "automod":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Automod")
                embed.setDescription(
                         "To enable automod in a channel, include any combination 📕,📗,📘, and 📙 in its description/topic. "+
                         "These represent toxicity (📕), incoherence (📗), sexual content (📘), and personal attacks (📙)."
                )
                embed.addField("Other descriptors", 
                         "❗ makes Ohtred ping the mods alongside auto-reports\n"+
                         "❌ makes Ohtred auto-delete the message as well\n"+
                         "👮 makes Ohtred warn the user when reported")
                cb(null, {embed})
                break;
            case "invite":
                cb(null, "https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot")
                break;
            case "docs":
                cb(null, "https://github.com/ElCapitanHaddock/capt-picard/blob/master/README.md")
                break;
            case "stats":
                cb(null, "```"+
                         "# Guilds: " + client.guilds.size + "\n"+
                         "# Users: " + client.users.size + "\n"+
                         "Ping: " + Math.round(client.ping) + "ms\n"+
                         "Uptime: " + (client.uptime / 1000) + "s```"
                )
                break;
                
            case "channels":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Channels")
                embed.addField("modvoting", "where proposals are sent to be voted/reacted to")
                embed.addField("modannounce", "where succesful proposals are archived/announced")
                embed.addField("modactivity", "where moderator voting activity is logged")
                embed.addField("feedback", "where users upvote popular ideas, send to modvoting as 'petitions'")
                embed.addField("reportlog", "where automod reports and manual user reports are logged")
                embed.addField("To set a channel, use @Ohtred channel [type] [channel]","Good luck!")
                cb({embed})
                break;
                
            case "voting":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Democracy")
                embed.addField("PROPOSALS",
                 "Proposals are mod-votes sent to the mod-voting channel.\n"+
                 "To propose a vote, use @Ohtred propose [description]. Only permitted roles can use propose.\n"+
                 "To have it include a @here ping, include ❗ in the description. For @everyone, include ❗❗\n"+
                 "To up/downvote, react to the proposal with whatever your up/downvote emote is (default: 👍)\n"+
                 "To set the modvoting proposal channel, use @Ohtred channel [mod_upvote]\n"+
                 "To configure proposal vote thresholds, use @Ohtred config [mod_upvote|mod_downvote] [count]")
                 
                embed.addField("MOTIONS",
                 "Motions are the same as proposals, except they take an extra parameter for a custom threshold.\n"+
                 "To send a motion, use @Ohtred motion [thresh] [description]. Only admins can send motions.\n"+
                 "The minimum threshold is 2 votes. Use motions for whatever require a unique voting threshold.")
                 
                 embed.addField("PETITIONS", 
                 "Petitions require no commands, they are drawn from messages in the #feedback channel.\n"+
                 "Server-wide discourse goes in #feedback.\n"+
                 "When any message hits the upvote threshold, it auto-passes into #mod-voting")
                 embed.addField("@Ohtred about setup", "to find out how to set all this up")
                cb({embed})
                break;
            
            case "embassy":
                var embed = new Discord.RichEmbed()
                embed.setTitle("Embassy")
                embed.setDescription(
                    "Your embassy is the channel that you share with other servers. Any messages you send on your own embassy, goes to currently defined target embassy, and vice versa."
                    +" They are similar to other bot's wormholes and speakerphones, but instead of using plain ugly messages,"
                    +" Ohtred uses sexy webhooks to make it looks super similar to an actual inter-server channel."
                    )
                embed.addField("@Ohtred embassy [channel]", "This command sets your official embassy channel")
                embed.addField("Connecting to the other server", "Ohtred makes it really simple. All you have to do is **edit the channel description** to be the **ID** of the other server (and nothing else). To get your server's ID and send it to the other server, type in *@Ohtred about server*. It's at the bottom.")
                embed.addField("Don't forget!","In order to hook up two embassies, both servers need to have Ohtred, and both servers have to be mutually set (with the ID as channel description)")
                embed.addField("Just like embassies in real life, you can only operate **one** per other server", "Good luck!")
                cb({embed})
                break;
            case "credits":
                cb(null, "```This bot was envisioned and entirely programmed by me, but I couldn't have done it entirely myself.\n"
                + "Thanks to the meticulous testing and input of the people of /r/okbuddyretard and /r/bruhmoment.\n"
                + "Thanks to Yandex and PerspectiveAPI for their generously APIs.\n"
                + "Thanks to Jamie Hewlett for his amazing artwork that is Ohtred's PFP.\n"
                + "Thanks to LunarShadows for helping with the PFP and setting up the support server!\n...\n"
                + "And most of all, thanks to YOU, for choosing my bot. I hope it works out for you.```\nIf you're feeling generous, please give my bot an upvote: https://discordbots.org/bot/511672691028131872")
                break;
            case "support":
                cb(null, "Join the badass support server here https://discord.gg/46KN5s8\nJust spam ping/dm me until you get my attention.")
                break;
            default:
                cb(msg.author.toString() + " Try *@Ohtred about [topic]*```topics - setup|usage|server|voting|automod|embassy|stats|invite|credits|support```")
                break;
        }
    }
    
    self.paterico = function(msg, ctx, config, cb) {
        var paterico_guild = client.guilds.find(function(g) { return g.id == 509166690060337174 })
        if (paterico_guild) {
        var patericos = paterico_guild.emojis.array()
        var emote = patericos[Math.floor(Math.random()*patericos.length)];
        msg.channel.send(emote.toString())
        } else msg.reply("cut the powerlines")
    }
    
    self.analyze = function(msg, ctx, config, cb) {
        var metrics = ["TOXICITY",
        "SEVERE_TOXICITY",	
        "IDENTITY_ATTACK",
        "INSULT",
        "PROFANITY",
        "SEXUALLY_EXPLICIT",
        "THREAT",
        "FLIRTATION",
        "ATTACK_ON_AUTHOR",
        "ATTACK_ON_COMMENTER",
        "INCOHERENT",
        "INFLAMMATORY",
        "LIKELY_TO_REJECT",
        "OBSCENE",
        "SPAM",
        "UNSUBSTANTIAL"]
        var params = ctx.trim().split(" ")
        if (params[0] && metrics.indexOf(params[0].toUpperCase()) !== -1 && params[1]) {
            params = [params[0].toUpperCase(), params.slice(1).join(" ")];
            var met = params[0];
            var text = params[1];
            (async function() {
                try {
                    const result = await perspective.analyze(text, {attributes: [met]});
                    var score = Math.round(result.attributeScores[met].summaryScore.value * 100)
                    const embed = new Discord.RichEmbed()
                    var emote = "🗿"
                        embed.setColor("PURPLE")
                    if (score < 10) { emote = "😂"
                        embed.setColor("GREEN")
                    }
                    else if (score < 30) { emote = "😤"
                        embed.setColor("#ffd000")
                    }
                    else if (score < 70) { emote = "😡"
                        embed.setColor("ORANGE")
                    }
                    else if (score < 99) { emote = "👺"
                        embed.setColor("RED")
                    }
                    embed.setDescription(emote + " " + text)
                    embed.setTitle(met + " || " + score + "%")
                    cb(null, embed);
                }
                catch(error) { cb("<:red_x:520403429835800576> Sorry " + msg.author.toString() + ", I couldn't understand that message") }
            })()
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please pick a metric: ```" + metrics + "```")
    }
    
    self.translate = function(msg, ctx, config, cb) { //todo: add link to Yandex here
        var params = ctx.trim().split(" ")
        if (params[0] && params[1]) {
            params = [params[0], params.slice(1).join(" ")]
            translate.translate(params[1], { to: params[0] }, function(err, res) {
              if (err) msg.reply("<:red_x:520403429835800576> Yandex Error: " + err)
              else if (res.text) {
                  var embed = new Discord.RichEmbed()
                  embed.setTitle(params[0].toLowerCase()+ " || " + params[1].substring(0,100))
                  embed.setDescription(res.text)
                  msg.channel.send({embed}).then().catch(function(error){console.error(error)})
              }
              else cb("<:red_x:520403429835800576> " + msg.author.toString() + " language not recognized.\nHere's the full list: https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/#api-overview__languages")
            });
        }
        else cb("<:red_x:520403429835800576> " + msg.author.toString() + ", please specify a target language and message.")
    }
    
    self.doge = function(msg, ctx, config, cb) {
        cb(null,"<:doge:522630325990457344> " + dogeify(ctx.toLowerCase().replace(/@everyone/g,"").replace(/@here/g,"").replace(/@/g,"")))
    }
    
    self.check_guild = function(msg, ctx, config, cb) {
        var found = client.guilds.find(function(g) { return g.id == ctx })
        if (found) msg.reply("Found!")
        else msg.reply("Not found!")
    }
    
    //mingus whingus
    self.meme = function(msg, ctx, config, cb) {
        var params = ctx.trim().split(" ")
        if (params[0] && params[1] && params[0].trim() && params[1].trim()) {
            params = [params[0], params.slice(1).join(" ")]
            
            var opts = {topText:"",bottomText:"",url:params[0]}
            
            if (params[1].includes("|")) {
                var spl = params[1].split("|")
                opts.topText = spl[0]
                opts.bottomText = spl[1]
            }
            else {
                opts.topText = params[1].slice(0, params[1].length/2 || 1)
                opts.bottomText = (params[1].length/2 > 1) ? params[1].slice(params[1].length/2) : ""
            }
            memeGenerator.generateMeme(opts)
            .then(function(data) {
                var random = Math.random().toString(36).substring(4);
                fs.writeFile(random+".png", data, 'base64', function(err) {
                    if (err) console.error(err)
                    else {
                        msg.channel.send({
                          files: [{
                            attachment: './'+random+'.png',
                            name: random+'.jpg'
                          }]
                        }).then(function() {
                            fs.unlink('./'+random+'.png', (err) => {
                              if (err) throw err;
                              console.log('Cached meme was deleted');
                            });
                        })
                    }
                });
            }).catch(function(error) { cb("Please include a valid image-url!") })
        } else cb("Please include both the caption and image-url!")
    }
}
module.exports = Cosmetic