var faceHandler = new FaceHandler();

//Register Expressions:
ex = {};

ex.amadeus = {};
ex.amadeus.smug       = faceHandler.registerExpression(1,2);
ex.amadeus.determined = faceHandler.registerExpression(3,2);
ex.amadeus.creepy     = faceHandler.registerExpression(5,2);
ex.amadeus.confused   = faceHandler.registerExpression(7,2);
ex.amadeus.surprised  = faceHandler.registerExpression(9,2);
ex.amadeus.embarrased = faceHandler.registerExpression(15,2);
ex.amadeus.onPhone    = faceHandler.registerExpression(11,2);
ex.amadeus.onPhoneBlownAway = faceHandler.registerExpression(13,2);
ex.amadeus.onPhoneSquint    = faceHandler.registerExpression(5,1);

ex.emery = {};
ex.emery.happy     = faceHandler.registerExpression(1,3);
ex.emery.unsure    = faceHandler.registerExpression(3,3);
ex.emery.surprised = faceHandler.registerExpression(5,3);
ex.emery.annoyed   = faceHandler.registerExpression(7,3);

ex.skeleton = {};
ex.skeleton.happy     = faceHandler.registerExpression(1,4);
ex.skeleton.confused  = faceHandler.registerExpression(5,4);
ex.skeleton.scared    = faceHandler.registerExpression(7,4);
ex.skeleton.secretive = faceHandler.registerExpression(9,4);

ex.arnold = {};
ex.arnold.happy = faceHandler.registerExpression(1,4,"squashed");
ex.arnold.stoic = faceHandler.registerExpression(3,4,"squashed");
ex.arnold.berried = faceHandler.registerExpression(11,4,"squashed");

ex.troll = {};
ex.troll.default   = faceHandler.registerExpression(1,1);
ex.troll.surprised = faceHandler.registerExpression(3,1);

const expr = Object.freeze(ex);
delete ex;

//Text
const text = Object.freeze({

	area1WalkFlavorText:[
	"You walk through the dungeon...",
	"You run through the dungeon...",
	"The stone stretches for eons...",
	"You feel a slight fatigue...",
	"Perhaps it is only a little farther...",
	"You tell yourself that there's a light at the end of this tunnel...",
	"You crawl through the dungeon...",
	"You rest and then keep going...",
	"You ignore the mildewy smell...",
	"Your feet ache from the walking...",
	"The sword feels heavy at your side..."
	],

	underworldWalkFlavorText:[
	"You feel a hollow breeze.",
	"You hear distant groans.",
	"Tendrils of hopelessness creep toward your heart.",
	"Your light feels so much brighter here.",
	"Nothing but you seems to move.",
	"You shiver.",
	"You take another step.",
	"You feel like someone is watching...",
	"You ignore the smell...",
	"You attempt to count the tombstones...",
	"So many tombstones..."
	],

	emery: Object.freeze({
		introText: [
		"Hello?",
		"Can you hear me?",
		"My name is Emery.",
		"I am speaking to you through a telepathic link.",
		"You are probably wondering where you are...",
		"umm...",
		"It's kind of hard to explain...",
		"You are a being foreign to our world, sent to defeat the darkness.",
		"Your body hasn't formed yet.",
		"...",
		"I sense a puzzled emotion from your psyche. What's wrong?",
		"OH! I forgot...",
		"There is a prophecy in our world:",
		"\"When the darkness rise, and war is fought...",
		"...and the battle is hard, and victory sought...",
		"...When the evil is strong and the monster is heartless...",
		"...Then the light will form and fight the darkness.\"",
		"Just now, I detected your psyche spontaneously appear.",
		"You are the light that will kill the darkness.",
		"Any moment now, your body will form, so I'll make this quick.",
		"You must climb the thousand steps from the heart of the universe and face the darkness.",
		"They're coming! I must leave...",
		"Please, Save our world..."
		],

		talk1: [
			{text:"Hello?",aExpr:expr.emery.unsure},
			["Is it you, Harbinger?"],
			{text:"It is!",aExpr:expr.emery.happy},
			["It's me, Emery."],
			["I finally reestablished contact."],
			["I am going to watch you as you go on your way and, hopefully, meet you once you get to the surface."],
			["For now, let me see where you are..."],
			{text:"Hmmm...",sExpr:expr.emery.unsure},
			{text:"Wow.",aExpr:expr.emery.surprised},
			{text:"Already to the underworld, I see.",aExpr:expr.emery.happy},
			["Well, let me warn you; There are some unsavory fellows around there."],
			{text:"I'm pretty sure my uncle Thaddeus is down there somewhere.",aExpr:expr.emery.unsure},
			["He did some not-so-good things..."],
			{text:"Also, my studies indicate that the people down there REALLY like these things called \"Skullberries\".",aExpr:expr.emery.happy},
			["Maybe if you find some you can do something with them..."],
			{text:"Other than that, I'm not really sure what to do...",aExpr:expr.emery.unsure},
			{text:"Anyway, the world needs you, Harbinger!",aExpr:expr.emery.happy},
			["Keep going, I'll talk to you if need."]
		],

		aboutInspect: [
			{text:"Hey, Harbinger!",aExpr:expr.emery.happy},
			["I noticed you're clever enough to use \"INSPECT\" in battle."],
			["Well, I was thinking..."],
			["Since we're psychically connected anyway, Whenever you try to INSPECT something, I can help you!"],
			["It's kind of a long story. I'm locked in a library right now."],
			["Anyway, there's this big book here entitled \"The ENCYCLOPEDIAE MONSTERNICA\"."],
			["I can use our psychic link to fill your brain with knowledge!"],
			["Let me start with this monster..."]
		]
	}),

	underworld: Object.freeze({
		meetSkeletonsText: [
		"You come across two skeletons...",
		{text:"Whoa!", aExpr:expr.skeleton.happy},
		{text:"It's the talking nightlight himself!", aExpr:expr.skeleton.happy},
		{text:"Franklin, he has his sword out.", aExpr:expr.arnold.stoic},
		{text:"Hey! hear us out!", aExpr:expr.skeleton.scared},
		["Arnold and I, we aren't like the other skeletons..."],
		{text:"nope.", aExpr:expr.arnold.stoic},
		{text:"I only commited tax evasion.", aExpr:expr.skeleton.scared},
		["Arnold..."],
		["What did you do, Arnold?"],
		{text:"Id rather not talk about it.", aExpr:expr.arnold.stoic},
		{text:"See! He regrets it!", aExpr:expr.skeleton.scared},
		["We may have done some bad things when we were alive, but we see the world better now that we have no eyes"],
		["Don't go telling everyone down here this but..."],
		{text:"...we'd rather not see the darkness terrorize the earth for a kajillion years...", aExpr:expr.skeleton.secretive},
		{text:"Definitely not my definition of fun.", aExpr:expr.arnold.stoic},
		{text:"So in conclusion, please don't chop us up into smithereens.", aExpr:expr.skeleton.happy},
		{text:"That doesn't sound very fun either.", aExpr:expr.arnold.stoic},
		{text:"You should ask them for directions on leaving.",aExpr:expr.emery.happy},
		"You ask.",
		{text:"Well, to do that you'd have to fight King Thaddeus.", aExpr:expr.skeleton.happy},
		{text:"You've got to be kidding me.", aExpr:expr.emery.annoyed},
		{text:"Basically, you keep walking straight until you see him.", aExpr:expr.skeleton.happy},
		["You literally CAN'T miss him."],
		{text:"You aren't going to fight him are you?",aExpr:expr.skeleton.confused},
		{text:"...",sExpr:expr.skeleton.confused},
		{text:"Well, we better get back to work.",aExpr:expr.skeleton.happy},
		["These skullberries aren't going to pick themselves."]
		],

		meetSkeletons2Text: [
		"It's those two clowns again.",
		{text:"Just in time!", aExpr:expr.skeleton.scared},
		["Arnold just accidently got some skullberry juice in his eye!"],
		{text:"...", sExpr:expr.arnold.berried, sFX:"berried"},
		{text:"This stuff was not designed for your eye.", aExpr:expr.arnold.berried},
		{text:"Of course not, Arnold!",aExpr:expr.skeleton.confused},
		{text:"He's having a bad time.", aExpr:expr.skeleton.scared},
		{text:"...", sExpr:expr.arnold.berried},
		{text:"Think you could patch him up with some of your healing magic?", aExpr:expr.skeleton.scared},
		{text:"...", sExpr:expr.arnold.berried},
		{text:"...", sExpr:expr.arnold.stoic, sFX:"magic"},
		{text:"All better now. Right, Arnold?",aExpr:expr.skeleton.happy},
		{text:"Yes. back to my unusually peachy self.", aExpr:expr.arnold.stoic},
		{text:"Thank you so much, Harbinger!",aExpr:expr.skeleton.happy},
		{text:"If only there was some way we could repay you...",aExpr:expr.skeleton.confused},
		"...",
		{text:"We could give him some of our skullberries.", aExpr:expr.arnold.stoic},
		{text:"That's a wonderful idea!",aExpr:expr.skeleton.happy},
		["Here you go, Harbinger!"],
		"Franklin just gave you 7\u00BD skullberries",
		["Sorry, I took a bite out of one of them."],
		["Anyway, good luck, and see you later!"]
		],

		talkArnoldText: [
		"It's only Arnold...",
		{text:"I'm scared.", aExpr:expr.arnold.stoic},
		["I walked away for a few moments and when I got back..."],
		["Franklin was gone."],
		["I found this note in his berry-basket that states,"],
		["\"Taking a short break, brb\""],
		["I immediately knew that he did not write the note due to the presence of texting acronyms."],
		["I believe king Thaddeus is holding him hostage and plans to use him as a bargaining chip for your imprisonment."],
		["Please save him. He is my only friend."],
		"You agree to save Franklin.",
		["Thank you very much. I will accompany you on the journey there."],
		["I will be very silent, but believe me, I will be behind you the entire time."],
		["We have no time to lose!"]
		],

		prefightThaddeusText: [
		"You approach the door to the third area.",
		"What's up, kid."
		]
	}),

	darknessIntroText: [
	"...And so you are left in complete and utter darkness.",
	"...Left with nothing but your loneliness to keep you company.",
	"...But in darkness is how many legends are born.",
	],

	wakeIntroText: [
	"You awake in a dying earth.",
	
	"Standing is difficult; You have never had a body before.",
	"You realize you have been speaking to yourself; therefore, you must have a mouth.",
	"You have gained \"TALK\", the ability to speak to your enemies in battle.",

	"You grab the sword of darkness' bane.",
	"You have gained \"ATTACK\", the ability to deal damage to your enemies.",

	"You take the shield of brightness' blessing.",
	"You have gained \"DEFEND\", the ability to block enemies' \"ATTACK\"s.",

	"...",
	"You bear a great burden.",
	"If you were to perish...",
	"Everything would be lost, and you would be all alone.",
	"All. Alone.",
	"This must never happen again."
	],

	trollFoundText: [
	"!!!",
	["What're you doing way down here?",expr.troll.default],
	["Wait-a-minute..."],
	["...!",expr.troll.surprised,false],
	["YOU'RE THE HARBINGER OF LIGHT!!!",expr.troll.surprised],
	["Imagine what King Amadeus will say when I stop you...",expr.troll.default]
	],

	meetTroldiersText: [
		["Greetings, Harbinger!",expr.troll.default],
		["We are here on behalf of his majesty, Amadeus Trollvich."],
		["He has instructed us to dispose of you as efficiently as possible, for his schedule is too rotund."],
		["So without further ado:"]
		],

	meetAmadeusText: [
	"!!!",
	{text:"Well, well, well.", aExpr:expr.amadeus.smug},
	["They told me I'd meet you someday."],
	["The harbinger of light."],
	["And now I'm sure you know what happens next."],
	["You and I are going to have a battle, and I am going to capture you."],
	["Then his majesty is going to give me a promotion!"],
	["So without further ado..."],
	{text:"*phone rings*",sFX:"ringtone"},
	{text:"..."   ,sExpr:expr.amadeus.surprised},
	{text:"Hello?",aExpr:expr.amadeus.onPhone},
	["Uh, I'm kind of busy right..."],
	["...Uh huh..."],
	["...yes..."],
	["...really?..."],
	{text:"A TIME SHARE IN LOS ANGELES!!!",aExpr:expr.amadeus.onPhoneBlownAway},
	{text:"Sorry, harbinger, your untimely demise will have to wait.",aExpr:expr.amadeus.smug},
	["I have time to share!"]
	],

	talkToAmadeusText: [
	{text:"Fancy meeting you here...",aExpr:expr.amadeus.smug},
	["While I was gone, I had to reorganize my schedule to fit something important in."],
	["That's when I realized I still had some loose ends to tie up..."],
	{text:"Namely, you.",aExpr:expr.amadeus.determined},
	{text:"So now I'm actually going to finish...",aExpr:expr.amadeus.smug},
	{text:"*phone rings again*",sFX:"ringtone"},
	{text:"Oh, for the love of crying out loud.",aExpr:expr.amadeus.embarrased},
	{text:"Yes?",aExpr:expr.amadeus.onPhone},
	["Oh, hello, Jemima."],
	["Yes, I'm just finishing up some business."],
	["Hmmm?"],
	["You reserved us a seat at chez troll?"],
	["Honey, I can't just leave."],
	{text:"*distant enraged voices*",sExpr:expr.amadeus.onPhoneSquint},
	{text:"Ok! Ok! I'm on my way.",aExpr:expr.amadeus.onPhone},
	{text:"Looks like you're off the hook for now, Harbinger.",aExpr:expr.amadeus.determined},
	["But next time..."],
	["Next time I won't let anyone stop me from finishing you."],
	["Until next time."]
	],

	prefightAmadeusText: [
	["Well, hello there, harbinger.",expr.amadeus.smug],
	["Now that I've taken my wife out..."],
	["I finally have time to take you out.",expr.amadeus.determined],
	["The legends say you'll fight your way to the surface of the earth."],
	["Well, first you'll have to get through me."],
	["Amadeus! King of trolls!"],
	["And only the first of the ten generals..."],
	["Prepare to meet your maker...",expr.amadeus.smug],
	["BECAUSE YOU'VE ALREADY MET YOUR MURDERER!",expr.amadeus.creepy] 
	],

	amadeusFight: Object.freeze(
	{
		banter1: [
		["What in the...",expr.amadeus.confused],
		["How did your wimpy shield not break?"],
		["I thought gold was malleable!",expr.amadeus.determined],
		["Whatever; certainly your shield can't take another hit..."]
		],

		banter2: [
		"again.",
		["I can't believe this.",expr.amadeus.confused],
		["...maybe I'm going about this all wrong...",expr.amadeus.smug],
		["Maybe it's time to get less..."],
		["...Predictable.",expr.amadeus.creepy]
		],

		banter3: [
		["Gotcha.",expr.amadeus.smug]
		],

		banter4: [
		["Wow.",expr.amadeus.surprised],
		["You mean business.",expr.amadeus.smug],
		["But the fight's not over yet!",expr.amadeus.determined]
		],

		flavor1: [
		["So you wanna talk, huh?",expr.amadeus.determined],
		["How's THIS for talking?"]
		],

		flavor2: [
		["Yes, I like my wicked hammer.",expr.amadeus.confused],
		["Not really sure how this is relevant..."],
		"Amadeus is not sure how this is relevant."
		],

		flavor3: [
		["You know...",expr.amadeus.smug],
		["You're smart, kid."],
		["TOO BAD I'M GOING TO BEAT THE TAR OUT OF YOU.",expr.amadeus.creepy],
		["That is, if you have tar...",expr.amadeus.confused],
		["To be honest, I don't know what \"tar\" is."]
		],
	}),

	gameOverFlavorText: [
	"...and the world was lost.",
	"Try Again?",
	"Don't give up!",
	"Light never fails in the end."
	]
});