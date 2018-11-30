
/* jshint undef: true, unused: true, asi : true, esversion: 6 */
/*
   dBBBBBb  dBP dBBBP dBBBBBb   dBBBBBb    dBBBBb
       dB'                 BB       dBP       dB'
   dBBBP' dBP dBP      dBP BB   dBBBBK'  dBP dB' 
  dBP    dBP dBP      dBP  BB  dBP  BB  dBP dB'  
 dBP    dBP dBBBBP   dBBBBBBB dBP  dB' dBBBBB'   2018 - Jeremy Yang
*/

/*---------------------------------------------------------------------------------
Picard is a Discord bot that promotes democracy in a server...

Current features:
    Proposing ideas to the #mod-vote channel
    Upon reaching X upvotes it is "passed" and moved to the announcements page
    Upon reaching X downvotes it is "rejected" and also moved
    
    All channels, emotes, permissible roles, and vote thresholds can be set by an admin
    
    Alerting moderators based on severity
    
    Suggestions in #feedback that go up to X upvotes are proposed as "petitions" 
    
    Messages with X :report: reactions are deleted and archived in #report-log
    
    The official Picard API is now called Ohtred after my Discord uname
---------------------------------------------------------------------------------*/
/*

Picard is hosted on Heroku as my alter-ego, Ohtred
If you wish to host your own version of Picard, here is a good tutorial: https://shiffman.net/a2z/bot-heroku/

Invite:
https://discordapp.com/oauth2/authorize?client_id=511672691028131872&permissions=8&scope=bot

*/

process.env.NODE_ENV = 'production'

//____________FIREBASE
//For persistent db.json
var admin = require("firebase-admin");

var serviceAccount = require("./_key.json");
//var serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACC.replace(/\\n/g, ''))
//^ not working atm

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://capt-picard.appspot.com"
});

var bucket = admin.storage().bucket();


//DISCORDJS API
const Discord = require('discord.js');
const client = new Discord.Client({
  autofetch: ['MESSAGE_REACTION_ADD'], //not implemented in discord API yet
  disabledEvents: ['TYPING_START', 'USER_UPDATE', 'USER_NOTE_UPDATE', 'VOICE_SERVER_UPDATE'],
});
var fs = require('fs')


// Downloads the file to db.json
bucket.file("db.json").download({destination:"db.json"}, function(err) { 
    if (err) console.error("Download error: "+err)
    else {
        fs.readFile('db.json', 'utf8', function (err, data) {
            if (err) throw err;
            init(JSON.parse(data));
        })
    }
})

//util
var util = require('./util')
    
function init(db) {
    
    //PERSPECTIVE API
    const Perspective = require('perspective-api-client');
    const perspective = new Perspective({apiKey: process.env.PERSPECTIVE_API_KEY});
    //--------------------------------------------
    
    //CUSTOM CHAT API
    var configs = [
        {name: "/r/BruhMoment",
            id: "483122820843307008",},
        {name: "r/okbuddyretard",
            id: "398241776327983104",}
    ]
    var Intercom = require('./intercom.js')
    var intercom = new Intercom(configs, client)
    //--------------------------------------------
    
    client.on('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);
        var guilds = client.guilds.array()
        for (var i = 0; i < guilds.length; i++) {
            var config = db[guilds[i].id]
            if (!config) {
                //default server config
                config = {
                    id: guilds[i].id,
                    name: guilds[i].name,
                    
                    reportable: ["general"],
                    permissible: [],
                    thresh: {
                        mod_upvote: 6,
                        mod_downvote: 6,
                        petition_upvote: 6,
                        report_vote: 7
                    },
                    upvote: "upvote",
                    downvote: "downvote",
                    report: "report",
                    channels: {
                        reportlog: "report-log",
                        feedback: "feedback",
                        modvoting: "mod-voting",
                        modannounce: "mod-announcements",
                        modactivity: "mod-activity",
                    }
                }
                db[guilds[i].id] = config
            }   
            var guild = client.guilds.find("id", config.id);
            if (guild) {
                //get history
                util.getChannel(guild.channels, config.channels.modvoting).fetchMessages({limit: config.fetch})
                util.getChannel(guild.channels, config.channels.feedback).fetchMessages({limit: config.fetch})
            }
        }
    })
    
    var Helper = require('./helper.js')
    var helper = new Helper(db, Discord, perspective);
    
    var Handler = require('./handler.js')
    var handler = new Handler(db,intercom,client,helper,util)
    
    client.on('message', handler.message);
    
    client.on('messageReactionAdd', handler.reactionAdd)
    
    client.on('messageReactionRemove', handler.reactionRemove)
    
    client.on('guildCreate', handler.guildCreate)
    
    client.on("presenceUpdate", handler.presenceUpdate);
    
    client.login(process.env.BOT_TOKEN)
    
    // Listen for process termination, upload latest db.json to be accessed on reboot
    process.on('SIGTERM', function() {    
        fs.writeFile('db.json', JSON.stringify(db), 'utf8', function(err) {
            if (err) console.error(err)
            bucket.upload("db.json", {
              gzip: true,
              metadata: { cacheControl: 'no-cache', },
            },function(err){
                if (err) console.error("Upload error: "+err)
                process.exit(2);
            });
        })
    });
}