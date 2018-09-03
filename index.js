const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const infractions = ["HACKS", "ADVERTISING", "MUTE EVADING", "INAPPROPRIATE NAME", "INAPPROPRIATE SKIN", "INAPPROPRIATE NICKNAME", "IRL SCAMMING", "SCAMMING", "INAPPROPRIATE ITEM", "INAPPROPRIATE LINK", "THREATS", "HARRASMENT", "INAPPROPRIATE BEHAVIOR", "CROSS TEAMING",
	"INAPPROPRIATE BUILDING", "TRAPPING", "BUG EXPLOITATION", "DOX", "DDOS"];
const punishmentTime = ["31d", "", "1d", "", "", "1d", "", "3d", "1d", "31d", "7d", "3d", "3d", "1d", "31d", "3d", "31d", "", ""];
const banType = ["ip", "ip", "ip", "", "", "ip", "ip", "ip", "ip", "ip", "ip", "ip", "ip", "ip", "ip", "ip", "ip", "ip"];

bot.on("ready", async () => {
	console.log(`${bot.user.username} is online`);
	bot.user.setActivity("With World Economies");//Default type is playing
});

bot.on("messageReactionAdd", async (reaction, user) => {
	if(reaction.message.channel.type == "dm") return;
	if(reaction.count == 1) return;
	
	if(!reaction.message.guild.members.get(user.id).roles.find(r => r.name === "Report Processor"))
		return;

	let reportChannel = reaction.message.guild.channels.find(c => c.name === "reports");
	let archivedChannel = reaction.message.guild.channels.find(c => c.name === "archived_reports");

	let msgmove;
	if(reaction.message.channel.id == reportChannel.id){
		if(reaction.emoji.name == "✅"){
			msgmove = "**ACCEPTED**\n" + reaction.message.content + "\n**Processed By: **" + user.toString();

			reaction.message.delete();
			return archivedChannel.send(msgmove);
		}
		if(reaction.emoji.name == "❌"){
			msgmove = "**DENIED**\n" + reaction.message.content + "\n**Processed By: **" + user.toString();
			
			reaction.message.delete();
			return archivedChannel.send(msgmove);
		}
	}
	if(reaction.message.channel.id == archivedChannel.id){
		if(reaction.emoji.name == "⬅"){
			let temp = reaction.message.content.split("\n").slice(1);
			temp.pop();
			msgmove = temp.join("\n");
			reaction.message.delete();
			return reportChannel.send(msgmove);
		}
	}
});

bot.on("message", async message => {
	//try{
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	let args = messageArray.slice(1)//.join(" ").split(", ");
	if(!message.channel.type == "dm"){
		let reportChannel = message.guild.channels.find(c => c.name === "reports");
		let archivedChannel = message.guild.channels.find(c => c.name === "archived_reports");
	}

	if(message.channel.type == "text"){
		reportChannel = message.guild.channels.find(c => c.name === "reports");
		archivedChannel = message.guild.channels.find(c => c.name === "archived_reports");
		
		if(message.channel.id == reportChannel.id && !message.author.bot){
			if(cmd !== `${prefix}report`)
				message.delete();
		}
	}

	if(cmd === `${prefix}report`){
		if(message.channel.type == "dm") return message.author.send("Use this command in a server!");
		if(reportChannel == null) return message.channel.send("Create a channel named reports!");
		if(message.channel.id == reportChannel.id){
			var index;
			let bancmd;
			if(args.length < 3){
				message.delete();
				return message.author.send(`Too few arguments, do ${prefix}help for help`);
			}
			var num;
			if(infractions.includes(args[1].toUpperCase())){
				index = infractions.indexOf(args[1].toUpperCase());
				num = 2;
			}
			else if(infractions.includes((args[1] + " " + args[2]).toUpperCase())){
				index = infractions.indexOf((args[1] + " " + args[2]).toUpperCase());
				num = 3;
			}
			else{
				message.delete();
				return message.author.send(`Invalid offense, do ${prefix}offenses for a list of supported offenses`);
			}

			let display = "**Name:** " + args[0] + "\n**Offense:** " + args[1];
			if(num == 3)
				display = display + " " + args[2];
			bancmd = "/" + banType[index] + "ban " + args[0] + " ";
			if(!punishmentTime[index] == "")
				bancmd = bancmd + punishmentTime[index] + " ";
			bancmd = bancmd + args[1];

			if(args.length == num+1){
				bancmd = bancmd + " - " + args[args.length-1];
			}
			else{
				let temparg = args.slice(num);
				temparg.pop();
				bancmd = bancmd + ", " + temparg.join(" ") + " - " + args[args.length-1];
				
				display = display + "\n**Notes: **" + temparg.join(" ");
			}

			display = display + "\n**Evidence: **" + args[args.length-1] + "\n**Reported By: **" + message.author.toString() + "\n" + bancmd;

			message.delete();
			return reportChannel.send(display);
		} else
			return message.channel.send("Use this command in the reports channel!");
	}

	
	if(message.author.bot){
		if(message.channel.id == reportChannel.id){
			message.react("✅");
			message.react("❌");
		}
		if(message.channel.id == archivedChannel.id)
			message.react("⬅");
		

	}
	
	if(cmd === `${prefix}offenses`){
		let embed = new Discord.RichEmbed()
		.setTitle("Recognized Offenses")
		.setColor("#FFC125");
		let str = ""
		for(var i = 0; i < infractions.length; i++){
			str = str + "\n" + infractions[i];
		}

		embed.addField("Offenses are not case-sensitive", str);
		embed.addField("Not finding what you're looking for?", "Shoot a message over to hello2248!");
		if(!message.channel.type == "dm");
			message.delete();
		return message.author.send(embed);
	}

	if(cmd === `${prefix}botinfo`){
		let icon = bot.user.displayAvatarURL;
		let embed = new Discord.RichEmbed()
		.setTitle("Bot Information")
		.setColor("#256645")
		.setThumbnail(icon)
		.addField("Bot Name", bot.user.username)
		.addField("Author", "hello2248");
		if(!message.channel.type == "dm");
			message.delete();
		return message.author.send(embed);
	}
	if(cmd === `${prefix}help`){
		let embed = new Discord.RichEmbed()
		.setTitle("Bot Help")
		.setColor("#256645")
		.addField(">help", "Brings up the help page you're reading")
		.addField(">offenses", "Loads a list of all the recognized offenses")
		.addField(">botinfo", "Displays general information about the bot")
		.addField(">report <player> <offense> [notes] <evidence>", "Submit a report for the given player.Notes are optional")
		.addField("Still need help?", "Send a message to hello2248 for further assistance!");
		if(!message.channel.type == "dm");
			message.delete();
		return message.author.send(embed);
	}


//} 
//catch(err){
	
//}
});

bot.login(process.env.token);