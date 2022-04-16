
class Area_Underworld extends Area {
    constructor() {
        super(Area_Underworld.text.flavor, ["IntrovertedGhost", "Skeleton", "Reaper"], "underworld-fight");
    }

    getEvents() {

        var events = [].concat(
            [Area_Underworld.talkEmery1,
            Area.flavorEvent,
            Area.flavorEvent,
            Area.flavorEvent,
            Area_Underworld.meetSkeletons],
            this.fillGrabBagThing(8),
            this.fillGrabBagThing(8),
            this.fillGrabBagThing(9),
            [Area_Underworld.talkSkeletons],
            this.fillGrabBagThing(9),
            this.fillGrabBagThing(),
            this.fillGrabBagThing(),
            [Area_Underworld.talkArnold],
            this.fillGrabBagThing(9),
            [Area_Underworld.enterThaddeusDungeon],
            this.fillGrabBagThing(9),
            this.fillGrabBagThing(),
            this.fillGrabBagThing(9),
            [Area_Underworld.fightThaddeus]
        );
        return events;
    }

    onStart() {
        changeBackground("back2");
        changeForeground("deadTrees");
        sound.playMusic(this.getBackgroundMusic());
        topWriter.show("You have exited the Aorta, and entered the underworld...");
    }

    fillGrabBagThing(length = 10) {
        var _this = this;
        var a = [
            Area.fightEvent
        ];

        while (a.length < length) {
            a.push(Area.flavorEvent);
        }

        return GrabBag.shuffle(a);
    }

    getBackgroundMusic() {
        return "underworld";
    }
}

//text

Area_Underworld.text = {
    flavor: [
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

    emerySpeak: [
        { text: "Hello?", aExpr: expr.emery.unsure },
        ["Is it you, Harbinger?"],
        { text: "It is!", aExpr: expr.emery.happy },
        ["It's me, Emery."],
        ["I finally reestablished contact."],
        ["I am going to watch you as you go on your way and, hopefully, meet you once you get to the surface."],
        ["For now, let me see where you are..."],
        { text: "Hmmm...", sExpr: expr.emery.unsure },
        { text: "Wow.", aExpr: expr.emery.surprised },
        { text: "Already to the underworld, I see.", aExpr: expr.emery.happy },
        ["Well, let me warn you; There are some pretty unsavory fellows around there."],
        { text: "I'm think my uncle Thaddeus is down there somewhere.", aExpr: expr.emery.unsure },
        { text: "Also, my research indicates that the people down there REALLY like these things called \"Skullberries\".", aExpr: expr.emery.happy },
        ["That's all I know. People don't usually leave the underworld, so information about it is scarce."],
        { text: "I wish I knew where the exit was. Maybe there'll be someone you can ask for directions?", aExpr: expr.emery.unsure },
        { text: "Anyway, the world needs you, Harbinger!", aExpr: expr.emery.happy },
        ["Keep going, I'll talk to you if need."]
    ],

    meetSkeletonsText: [
        "You come across two skeletons...",
        { text: "Whoa!", aExpr: expr.skeleton.happy },
        { text: "It's the talking nightlight himself!", aExpr: expr.skeleton.happy },
        { text: "Franklin, he has his sword out.", aExpr: expr.arnold.stoic },
        { text: "Hey! hear us out!", aExpr: expr.skeleton.scared },
        ["Arnold and I, we aren't like the other skeletons..."],
        { text: "nope.", aExpr: expr.arnold.stoic },
        { text: "I only commited tax evasion.", aExpr: expr.skeleton.scared },
        ["And Arnold..."],
        ["..."],
        ["What DID you do, Arnold?"],
        { text: "I'd rather not talk about it.", aExpr: expr.arnold.stoic },
        { text: "See! He regrets it!", aExpr: expr.skeleton.scared },
        ["We may have done some bad things when we were alive, but we see the world better now that we have no eyes"],
        ["Don't go telling everyone down here this but..."],
        { text: "...we'd rather not see the darkness terrorize the earth for a kajillion years...", aExpr: expr.skeleton.secretive },
        { text: "Definitely not my definition of fun.", aExpr: expr.arnold.stoic },
        { text: "So, please don't chop us up into smithereens.", aExpr: expr.skeleton.happy },
        { text: "That doesn't sound very fun either.", aExpr: expr.arnold.stoic },
        { text: "You should ask them for directions! They seem nice.", aExpr: expr.emery.happy },
        "You ask.",
        { text: "Well, to do that you'd have to fight King Thaddeus.", aExpr: expr.skeleton.happy },
        { text: "You've got to be kidding me. Thaddeus is the king?", aExpr: expr.emery.annoyed },
        { text: "Basically, you keep walking straight until you see him.", aExpr: expr.skeleton.happy },
        ["You literally CAN'T miss him."],
        ["..."],
        { text: "You aren't going to fight him are you?", aExpr: expr.skeleton.confused },
        { text: "...", sExpr: expr.skeleton.confused },
        { text: "Well, we better get back to work.", aExpr: expr.skeleton.happy },
        ["These skullberries aren't going to pick themselves."]
    ],

    meetSkeletons2Text: [
        "It's those two clowns again.",
        { text: "Just in time!", aExpr: expr.skeleton.scared },
        ["Arnold just accidently got some skullberry juice in his eye!"],
        { text: "...", sExpr: expr.arnold.berried, sFX: "berried" },
        { text: "This stuff was not designed for your eye.", aExpr: expr.arnold.berried },
        { text: "Of course not, Arnold!", aExpr: expr.skeleton.confused },
        { text: "He's having a bad time.", aExpr: expr.skeleton.scared },
        { text: "...", sExpr: expr.arnold.berried },
        { text: "Think you could patch him up with some of your healing magic?", aExpr: expr.skeleton.scared },
        { text: "...", sExpr: expr.arnold.berried },
        text.break,
        { text: "...", sExpr: expr.arnold.stoic, sFX: "magic" },
        { text: "All better now. Right, Arnold?", aExpr: expr.skeleton.happy },
        { text: "Yes. back to my unusually peachy self.", aExpr: expr.arnold.stoic },
        { text: "Thank you so much, Harbinger!", aExpr: expr.skeleton.happy },
        { text: "If only there was some way we could repay you...", aExpr: expr.skeleton.confused },
        "...",
        { text: "We could give him some of our skullberries.", aExpr: expr.arnold.stoic },
        { text: "That's a wonderful idea!", aExpr: expr.skeleton.happy },
        ["Here you go, Harbinger!"],
        "Franklin just gave you 7\u00BD skullberries",
        ["Sorry, I took a bite out of one of them."],
        ["Anyway, good luck, and see you later!"]
    ],

    talkArnoldText: [
        "It's only Arnold...",
        { text: "I'm scared.", aExpr: expr.arnold.stoic },
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

    preFightThaddeus: {
        intro: [
            "You approach the door to the third area.",
            ["Ah, hello, Arnold. Who's your friend here?", expr.thaddeus.smug],
            ["Cut the charade, Thaddeus. Where's Franklin?", expr.arnold.stoic],
            ["I have him right where I want him, just like you.", expr.thaddeus.smug],
            ["But first, I have a proposition for you."],
            ["Harbinger, what if I told you, we don't have to fight?"],
            ["Here in the underworld is the one place the DARKNESS can't see."],
            ["I could let you live here."],
            ["It is a meager dwelling, sure, but we have skull berries."],
            ["The zombies sometimes get together to play some cards, usually hearts."],
            ["Sure it isn't perfect, but nothing is."],
            ["What do you say, Harbinger? Bury the hatchet?"]
        ],

        chooseYes: [
            "You decide to...",
            "...",
            "...",
            ["You're not really thinking about this are you?", expr.emery.sad],
            ["Harbinger..."],
            ["You're not going to leave me here?"],
            ["You're the only thing I have left."],
            ["Harbinger..."],
            "...",
            "you accept."
            //Cut to black, then fade in to looping footage of the harbinger sitting in the underworld.
            //Something telling you to load or reset the game appears.
        ],

        chooseNo: [
            "You decline.",
            "This is about more than surviving.",
            ["I gave you a chance, Harbinger.", expr.thaddeus.smug],
            ["Once you leave here, there is nowhere you can hide."],
            ["And there is no way I can just let you leave."],
            ["Thaddeus, you jerk.", expr.emery.annoyed]
        ]
    },

    postFightThaddeus: [
        ["What?", expr.thaddeus.sorrowful],
        ["Are you surprised?"],
        ["Even death does not spare me from this place."],
        ["Take your stupid birthright."],
        ["Even though it let me leave this place..."],
        ["It never let me feel whole."],
        ["Bye, Harbinger."],
        ["..."],
        ["Now that you've defeated me, the DARKNESS has no reason to let me survive..."],
        ["..."],
        text.break,
        ["Now that you've inherited the birthright, the door will be unlocked.", expr.arnold.stoic],
        ["Go. I'll find Franklin."]
    ]
};

//logic

Area_Underworld.talkEmery1 = Area.registerEvent(async function () {
    file.set("Inspect-Level", 1); //flag for dialogue in-fight.
    sound.pause();
    await new Writer(bottomWriter, Area_Underworld.text.emerySpeak).writeAllAsync();
    sound.unpause();
    DialogueTypewriter.clearAll();
});

Area_Underworld.meetSkeletons = Area.registerEvent(async function () {
    contentManager.clear();
    var franklin = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(0.9,1.1)");
    var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
    Skeleton.sprites.setSprite(arnold, 1, 2);
    Skeleton.sprites.setSprite(franklin, 1, 2);
    contentManager.add($('<div class="monster"></div>').html(arnold));
    contentManager.add($('<div class="monster"></div>').html(franklin));
    await contentManager.approach();
    await new Writer(bottomWriter, Area_Underworld.text.meetSkeletonsText).writeAllAsync();
    await contentManager.recede()
    contentManager.clear();
    sound.unpause();
    DialogueTypewriter.clearAll();
});

Area_Underworld.talkSkeletons = Area.registerEvent(async function () {
    sound.pause();
    contentManager.clear();
    var franklin = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(0.9,1.1)");
    var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
    Skeleton.sprites.setSprite(arnold, 2, 2);
    Skeleton.sprites.setSprite(franklin, 1, 2);
    contentManager.add($('<div class="monster"></div>').html(franklin));
    contentManager.add($('<div class="monster"></div>').html(arnold));
    contentManager.approach();
    var w = new Writer(bottomWriter, Area_Underworld.text.meetSkeletons2Text);
    await w.writeAllAsync();
    Skeleton.sprites.setSprite(arnold, 1, 2);
    await w.writeAllAsync();
    await contentManager.recede();
    contentManager.clear();
    sound.unpause();
    DialogueTypewriter.clearAll();
});

Area_Underworld.talkArnold = Area.registerEvent(async function () {
    sound.pause();
    contentManager.clear();
    var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
    Skeleton.sprites.setSprite(arnold, 1, 1);
    contentManager.add($('<div class="monster"></div>').html(arnold));
    contentManager.approach();
    await new Writer(bottomWriter, Area_Underworld.text.talkArnoldText).writeAllAsync();
    contentManager.clear();
    sound.unpause();
    DialogueTypewriter.clearAll();
});

Area_Underworld.enterThaddeusDungeon = Area.getBackgroundChangeEvent("You enter Thaddeus' dungeon.", "wideTunnel");

Area_Underworld.fightThaddeus = Area.registerEvent(async function () {
    changeBackground("bigDoor");
    sound.stop();
    contentManager.clear();
    var $a = $('<div class="monster"></div>');
    var $b = $('<div id="thaddeus"></div>');
    contentManager.add($a);
    $a.html($b);
    Thaddeus.sprites.setSprite($b, 1, 1);
    await contentManager.approachFromLeft();

    await new Writer(bottomWriter, Area_Underworld.text.preFightThaddeus.intro).writeAllAsync();
    var answer = await getChoice(["Accept", "Decline"], hcursor);
    if (answer === "Accept") {
        await new Writer(bottomWriter, Area_Underworld.text.preFightThaddeus.chooseYes).writeAllAsync();
        //Cut to black, then fade in to looping footage of the harbinger sitting in the underworld.
        //Something telling you to load or reset the game appears.
    }
    else // Decline
    {
        await new Writer(bottomWriter, Area_Underworld.text.preFightThaddeus.chooseNo).writeAllAsync();
        currentBattle = new Battle("thaddeus", [new Thaddeus()], false);
        await currentBattle.getPromise();

        DialogueTypewriter.clearAll();
        await Helper.delay(2);

        sound.stop();
        var $a = $('<div class="monster fadeInOpacity"></div>');
        var $b = $('<div id="thaddeus"></div>');
        contentManager.add($a);
        contentManager.approach(false);
        $a.html($b);
        Thaddeus.sprites.setSprite($b, 1, 1);

        await Helper.delay(2);

        var w = new Writer(bottomWriter, Area_Underworld.text.postFightThaddeus);
        await w.writeAllAsync();
        await contentManager.recedeToLeft();
        await Helper.delay(1);
        // Thaddeus leaves, arnold enters
        contentManager.clear();
        var arnold = $('<div style="height: 140%; width:  70%;"></div>').css("transform-origin", "bottom").css("transform", "scale(1.1,0.7)");
        Skeleton.sprites.setSprite(arnold, 1, 1);
        contentManager.add($('<div class="monster"></div>').html(arnold));
        await contentManager.approachFromLeft();
        await w.writeAllAsync();
    }
});