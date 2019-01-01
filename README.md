# The sharpest cat on Discord.
##### By Jeremy Yang

## ⚖️ Judge
* Propose ideas to the #mod-vote tribunal with a simple command  
* They either pass or fail, which can represent anything you want
* Configure custom pass/fail thresholds
* Suggestions in #feedback that are popular enough progress as "petitions"  
* Due process means everything - whiskers holds the mod team accountable
 
## 📰 Reporter
* React to an inappropriate message with enough :report: reactions, and Whiskers deletes it
* Then he archives it in #report-log (with image retention)
* Whiskers can also auto-mute reported users for a customizable amount of time
* Auto-moderate channels, alongside metrics such as NSFW or toxicity (and many more)
* He is constantly learning through Google's PerspectiveAPI

## 💪 Bouncer 
* You can tell Whiskers to auto-kick or auto-ban raiders
* Enable autorole, and optionally require joining accounts to connect an external account, preventing alts
* Allow mods to bypass anti-alt measures with a moderator password
  
## 🌿 Diplomat
* Interserver channels - Whiskers will help you operate EMBASSIES.
* Simple and intuitive to set up
* Messages sent on either embassy will be sent to the other one.
* Use it for diplomacy, inter-server events, or even just plain fun!
  
## 🔎 Detective
* Whiskers can tell you the chance of an announcement to be negatively percieved before sending it 
* He can analyze the contents of images, and grab text from them
* What's that? In the blink of an eye, Whiskers' can uncannily identify images
* Sniff out plagarism with the image locate command, or find similar images with the mirror command

## And More ❗
* Kick, ban, unban, role, and timed mute commands 
* Minimalistic userinfo and roleinfo commands
* Auto-display the number of online users with a simple 🔺 category prefix
* Whiskers is multilingual - translate from Welsh to Arabic to Yiddish to Tagalog
* Custom prefixes

...
##### NOTE: Here's an invite without admin: https://discordapp.com/oauth2/authorize?client_id=528809041032511498&permissions=805686464&scope=bot

## Commands 
```
Anyone

    @whiskers analyze [metric] [text] to predict if a message follows the metric (15 metrics to choose from)
    
    @whiskers translate [language] [text] to translate a message to the specified language
    
    @whiskers meme [url] [top text|bottom text] to auto-scale and generate a fresh meme
    
    @whiskers doge [text] to generate dogeified text
	
    @whiskers describe [image url] to analyze and label the contents of an image
    
    @whiskers identify [image url] to guess what an image represents (reverse-search)
    
    @whiskers read [image url] grabs text from an image and posts it in a copypastable format
    
Approved Roles

    @whiskers propose [text] to send a proposal to the modvoting channel (constant voting threshold)
    
    @whiskers motion [threshold] [description] - a proposal with a custom threshold
    
    @whiskers alert [severity 1-4] to alert mods to an altercation (my server bans pinging mods but allows approved users to alert)

Moderators

    @whiskers mute/unmute/ban/unban/kick/role/warn [user/role]
    
    @whiskers autorole [role] - sets up an autorole, typically for verification
    
    @whiskers wash [1-100] - purges the specified number of messages

Admin Only

    @whiskers lockdown [0-2] - locks down the server (0: none, 1: autokick, 2: autoban)
    
    @whiskers embassy [channel] sets up an embassy in a channel that can be connected to another server
    
    @whiskers verification [0-1] - sets the verification mode

    @whiskers prefix [prefix] self explanatory
   
    @whiskers channel [modvoting|modannounce|modactivity|feedback|reportlog] [channel] to link one of the features to a channel
    
    @whiskers emote [upvote|downvote|report] [emote_name] to set the name of the emote to its corresponding mechanic
    
    @whiskers permit [rolename] to permit a rolename to interact with me
    
    @whiskers unpermit [rolename] to remove a role from interacting with me
    
    @whiskers reportable [channel] to add a channel to the list where messages are reportable

    @whiskers config [mod_upvote|mod_downvote|petition_upvote|report_vote] [count] to set a voting threshold

    @whiskers counter [interval 1-50] to set the change in # of users online in order to update the counter
    
    @whiskers report_time [number 10+] to set the amount of time a user gets muted for a report (default 60s)

And more...
```

[![Discord Bots](https://discordbots.org/api/widget/528809041032511498.svg?usernamecolor=FFFFFF&topcolor=000000&datacolor=FFFFFF&middlecolor=000000&highlightcolor=000000&labelcolor=ff9c00)](https://discordbots.org/bot/511672691028131872)

##### Thanks to [Yandex](http://translate.yandex.com/) and [PerspectiveAPI](https://perspectiveapi.com) for their fantastic APIs
