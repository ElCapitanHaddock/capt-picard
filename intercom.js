/*IRRELEVANT TO THE CHATBOT*/
/*-------------------------*/
/*This is for personal use sending messages through the bot*/
/*Also for a personal appeals server*/

const request = require('request');

const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPTR_KEY);

//util
var util = require('./util')
    
var Chat = function(configs, client, Discord) {
    this.update = function(msg) {
        request({
          url: process.env.INTERCOM_PATH+'/from/',
          method: 'POST',
          json: {
              content: (msg.attachments.size > 0) ? msg.content + " " + msg.attachments.array()[0].url : msg.content, 
              username: msg.author.username, 
              channel: msg.channel.name, 
              guild: msg.guild.id, 
              guildname: msg.guild.name}
              
        }, function(error, response, body){ if (error) console.error(error) }); // no response needed atm...
    }
    
    var timeout = 1000
    var liveTimeout = 500 //live and chatting -> check every 1/2 sec
    var sleepTimeout = 5000 //30 seconds inactivity -> check every 5 secs
    var hibernateTimeout = 120000 //the chat API is literally timed out, -> check every 2 minutes 
    var emptyBeat = 0
    var maxEmpty = 120
    
    //after inactivity for 30 seconds, the timeout interval switches to sleepTimeout
    
    function heartbeat() {
        setTimeout(function() { //TBD set guild and channel on webapp
            //if (!guild) guild = client.guilds.find("id", "398241776327983104");
            
            request(process.env.INTERCOM_PATH+"/to", function(err, res, body) { //messy heartbeat, fix later
                if (err) console.error("error: " + err)
                if (body && body.charAt(0) !== '<') {
                    var messages = JSON.parse(body)
                    if (messages.constructor === Array) {
                        for (var i = 0; i < messages.length; i++) {
                            var con = configs.find(function(g) {  return g.name == messages[i].guild })
                            if (con) {
                                var guild = client.guilds.find("id", con.id)
                                //client.guilds.find("id", messages[i].guild)
                                if (guild) {
                                    let channel = util.getChannel(guild.channels, messages[i].channel)
                                    if (channel) channel.send(messages[i].content)
                                }
                            }
                        }
                        if (messages.length >= 1) {
                            emptyBeat = 0;
                            timeout = liveTimeout
                            heartbeat()
                        }
                        else {
                            if (emptyBeat >= maxEmpty) {
                                //console.log("Chat API inactive, sleeping...")
                                timeout = sleepTimeout
                                heartbeat()
                            }
                            else {
                                emptyBeat++
                                heartbeat()
                            }
                        }
                    }
                } //chat API is no longer responding, timed out on C9
                //check for timeout html view, starts with <
                if (body.charAt(0) == '<') {
                    //console.log("Chat API not responding, hibernating...")
                    timeout = hibernateTimeout
                    heartbeat()
                }
            });
        }, timeout)
    }
    heartbeat()
    
    function getAppeals() {
        setTimeout(function() {
            request(process.env.APPEALS_PATH+"/appeals", function(err, res, body) {
                if (err) console.error(err)
                if (data.startsWith("<")) return
                var data = JSON.parse(body)
                var guild = client.guilds.find("id", 507016473768624148)
                if (guild && data) {
                    var ch = util.getChannel(guild.channels, "mod-voting")
                    for (var i = 0; i < data.length; i++) {
                        
                        var prop_id = Math.random().toString(36).substring(4);
                        const embed = new Discord.RichEmbed()

                        embed.setTitle(".:: 𝐀𝐏𝐏𝐄𝐀𝐋")
                        //embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL)
                         
                        const encryptedIP = cryptr.encrypt(data.ip)
                        embed.setDescription(
                            "**Encrypted IP: **" + encryptedIP +
                            "\n**User: **<@" + data.id + ">" +
                            "```" + data.content + "```"
                        )
                        
                        embed.setFooter(prop_id)
                        embed.setTimestamp()
                        ch.send({embed})
                        
                        ch.send()
                    }
                }
            })
        },15000) //15s for now
    }
    getAppeals();
}

module.exports = Chat;
