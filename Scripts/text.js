var faceHandler = new FaceHandler();

//Register Expressions:
ex = {};

ex.amadeus = {};
ex.amadeus.smug = faceHandler.registerExpression(1, 2);
ex.amadeus.determined = faceHandler.registerExpression(3, 2);
ex.amadeus.creepy = faceHandler.registerExpression(5, 2);
ex.amadeus.confused = faceHandler.registerExpression(7, 2);
ex.amadeus.surprised = faceHandler.registerExpression(9, 2);
ex.amadeus.embarrased = faceHandler.registerExpression(15, 2);
ex.amadeus.onPhone = faceHandler.registerExpression(11, 2);
ex.amadeus.onPhoneBlownAway = faceHandler.registerExpression(13, 2);
ex.amadeus.onPhoneSquint = faceHandler.registerExpression(5, 1);

ex.emery = {};
ex.emery.happy = faceHandler.registerExpression(1, 3);
ex.emery.unsure = faceHandler.registerExpression(3, 3);
ex.emery.surprised = faceHandler.registerExpression(5, 3);
ex.emery.annoyed = faceHandler.registerExpression(7, 3);
ex.emery.sad = faceHandler.registerExpression(9,3);

ex.skeleton = {};
ex.skeleton.happy = faceHandler.registerExpression(1, 4);
ex.skeleton.confused = faceHandler.registerExpression(5, 4);
ex.skeleton.scared = faceHandler.registerExpression(7, 4);
ex.skeleton.secretive = faceHandler.registerExpression(9, 4);

ex.arnold = {};
ex.arnold.happy = faceHandler.registerExpression(1, 4, "squashed");
ex.arnold.stoic = faceHandler.registerExpression(3, 4, "squashed");
ex.arnold.berried = faceHandler.registerExpression(11, 4, "squashed");

ex.troll = {};
ex.troll.default = faceHandler.registerExpression(1, 1);
ex.troll.surprised = faceHandler.registerExpression(3, 1);

ex.thaddeus = {};
ex.thaddeus.smug = faceHandler.registerExpression(1, 5);
ex.thaddeus.sorrowful = faceHandler.registerExpression(3,5);

ex.oscar = {};
ex.oscar.happy = faceHandler.registerExpression(1, 6);
ex.oscar.sad   = faceHandler.registerExpression(3, 6);
ex.oscar.superhappy   = faceHandler.registerExpression(5, 6);

const expr = Object.freeze(ex);
delete ex;

//Text
const tex = {};

/** @const {object} */
/** This object will cause a dialogue writer to return control to the code.*/
tex.break = Object.freeze({});

tex.other = {
	aboutInspect: [
		{ text: "Hey, Harbinger!", aExpr: expr.emery.happy },
		["I noticed you're clever enough to use \"INSPECT\" in battle."],
		["Well, I was thinking..."],
		["Since we're psychically connected anyway, Whenever you try to INSPECT something, I can help you!"],
		["It's kind of a long story. I'm locked in a library right now."],
		["Anyway, there's this big book here entitled \"The ENCYCLOPEDIAE MONSTERNICA\"."],
		["I can use our psychic link to fill your brain with knowledge!"],
		["Let me start with this monster..."]
	],

	gameOverFlavorText: [
		"...and the world was lost.",
		"Try Again?",
		"Don't give up!",
		"Light never fails in the end."
	]
}

tex.intro = {
	emerySpeak: [
		"Hello?",
		"Can you hear me?",
		"My name is Emery.",
		"I am speaking to you through a telepathic link.",
		"You are probably wondering where you are...",
		"umm...",
		"To be honest, I don't know...",
		"You are a being foreign to our world, sent to defeat the darkness.",
		"Your body hasn't formed quite yet.",
		"...",
		"I'm sensing a puzzled emotion from your psyche. What's wrong?",
		"You don't know, do you?",
		"There is a prophecy in our world:",
		"\"When the darkness rise, and war is fought...",
		"...and the battle is hard, and victory sought...",
		"...When the evil is strong and the monster is heartless...",
		"...Then the light will form and fight the darkness.\"",
		"Just now, I detected your psyche spontaneously appear.",
		"You must be the light that will kill the darkness.",
		"Any moment now, your body will form, so I'll make this quick.",
		"You must climb the thousand steps from the heart of the Earth and face the darkness.",
		"They're coming! I must leave...",
		"Please, Save our world..."
	],

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
}

tex.aorta = {
	walkFlavor: [
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

	trollFoundText: [
		"!!!",
		["What're you doing way down here?", expr.troll.default],
		["Wait-a-minute..."],
		["...!", expr.troll.surprised, false],
		["YOU'RE THE HARBINGER OF LIGHT!!!", expr.troll.surprised],
		["Imagine what King Amadeus will say when I stop you...", expr.troll.default]
	],

	meetTroldiersText: [
		["Greetings, Harbinger!", expr.troll.default],
		["We are here on behalf of his majesty, Amadeus Trollvich."],
		["He has instructed us to dispose of you as efficiently as possible, for his schedule is too rotund."],
		["So without further ado:"]
	],

	meetAmadeusText: [
		"!!!",
		{ text: "Well, well, well.", aExpr: expr.amadeus.smug },
		["They told me I'd meet you someday."],
		["The harbinger of light."],
		["And now I'm sure you know what happens next."],
		["You and I are going to have a battle, and I am going to capture you."],
		["Then his majesty is going to give me a promotion!"],
		["So without further ado..."],
		{ text: "*phone rings*", sFX: "ringtone" },
		{ text: "...", sExpr: expr.amadeus.surprised },
		{ text: "Hello?", aExpr: expr.amadeus.onPhone },
		["Uh, I'm kind of busy right..."],
		["...Uh huh..."],
		["...yes..."],
		["...really?..."],
		{ text: "A TIME SHARE IN LOS ANGELES!!!", aExpr: expr.amadeus.onPhoneBlownAway },
		{ text: "Sorry, harbinger, your untimely demise will have to wait.", aExpr: expr.amadeus.smug },
		["I have time to share!"]
	],

	meetOscar: {
		intro: [
			["well, hi there!", expr.oscar.happy],
			["what's your name!"],
			"You tell it your name.",
			["WOW! WHAT A COOL NAME!",expr.oscar.superhappy],
			["I NEVER THOUGHT I'D MEET SOMEBODY WITH SUCH AN AMAZING NAME!"],
			["i've never seen a glowy person before.",expr.oscar.happy],
			"You ask the kid where you are.",
			["silly! this is my home!"],
			["this is where all the trolls live."],
			"What's a kid doing here in the middle of nowhere?",
			"You look around for its parents.",
			["where's your home?"],
			"Nowhere in sight.",
			"You ask the kid where its parents are. Last thing you need is for this kid to get hurt.",
			["..."],
			["...", expr.oscar.sad],
			["I don't have any parents."],
			["At least, I haven't had any as long as I can remember."],
			"...",
			"...You can't just leave him...",
		],

		choice: {
			prompt: "Take him with you?",
			yes: {
				button: "Yes",
				result: [
					"...it's settled.",
					"You ask him to come with you.",
					["REAAAALLLLYYYY!!!!!!!", expr.oscar.superhappy],
					["i'll be quiet!"],
					["and respectful!"],
					["and nice!"],
					["and polite!"],
					"The accordion kid joined the party!"
				],
			},

			no: {
				button: "No",
				result: [
					"...but you don't have a choice, do you?",
					"He'd just hold you back.",
					"You might not like it, but you can't take him with you.",
					["It was nice to meet you.", expr.oscar.sad],
					["I guess I'll go back to playing my accordion"]
				]
			}
		},
	},
	

	talkToAmadeusText: [
		{ text: "Fancy meeting you here...", aExpr: expr.amadeus.smug },
		["While I was gone, I had to reorganize my schedule to fit something important in."],
		["That's when I realized I still had some loose ends to tie up..."],
		{ text: "Namely, you.", aExpr: expr.amadeus.determined },
		{ text: "So now I'm actually going to finish...", aExpr: expr.amadeus.smug },
		{ text: "*phone rings again*", sFX: "ringtone" },
		{ text: "Oh, for the love of crying out loud.", aExpr: expr.amadeus.embarrased },
		{ text: "Yes?", aExpr: expr.amadeus.onPhone },
		["Oh, hello, Jemima."],
		["Yes, I'm just finishing up some business."],
		["Hmmm?"],
		["You reserved us a seat at chez troll?"],
		["Honey, I can't just leave."],
		{ text: "*distant enraged voices*", sExpr: expr.amadeus.onPhoneSquint },
		{ text: "Ok! Ok! I'm on my way.", aExpr: expr.amadeus.onPhone },
		{ text: "Looks like you're off the hook for now, Harbinger.", aExpr: expr.amadeus.determined },
		["But next time..."],
		["Next time I won't let anyone stop me from finishing you."],
		["Until next time."]
	],

	prefightAmadeusText: [
		["Well, hello there, harbinger.", expr.amadeus.smug],
		["Now that I've taken my wife out..."],
		["I finally have time to take you out.", expr.amadeus.determined],
		["The legends say you'll fight your way to the surface of the earth."],
		["Well, first you'll have to get through me."],
		["Amadeus! King of trolls!"],
		["And only the first of the ten generals..."],
		["Prepare to meet your maker...", expr.amadeus.smug],
		["BECAUSE YOU'VE ALREADY MET YOUR MURDERER!", expr.amadeus.creepy]
	],

	amadeusFight: Object.freeze(
		{
			banter1: [
				["What in the...", expr.amadeus.confused],
				["How did your wimpy shield not break?"],
				["I thought gold was malleable!", expr.amadeus.determined],
				["Whatever; certainly your shield can't take another hit..."]
			],

			banter2: [
				"again.",
				["I can't believe this.", expr.amadeus.confused],
				["...maybe I'm going about this all wrong...", expr.amadeus.smug],
				["Maybe it's time to get less..."],
				["...Predictable.", expr.amadeus.creepy]
			],

			banter3: [
				["Gotcha.", expr.amadeus.smug]
			],

			banter4: [
				["Wow.", expr.amadeus.surprised],
				["You mean business.", expr.amadeus.smug],
				["But the fight's not over yet!", expr.amadeus.determined]
			],

			flavor1: [
				["So you wanna talk, huh?", expr.amadeus.determined],
				["How's THIS for talking?"]
			],

			flavor2: [
				["Yes, I like my wicked hammer.", expr.amadeus.confused],
				["Not really sure how this is relevant..."],
				"Amadeus is not sure how this is relevant."
			],

			flavor3: [
				["You know...", expr.amadeus.smug],
				["You're smart, kid."],
				["TOO BAD I'M GOING TO BEAT THE TAR OUT OF YOU.", expr.amadeus.creepy],
				["That is, if you have tar...", expr.amadeus.confused],
				["To be honest, I don't know what \"tar\" is."]
			],
		}),
};

const text = Object.freeze(tex);