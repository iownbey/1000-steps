
class Monster
{
    constructor(name, health, defense, runChance)
    {
        this.important = true;
        this.myName = name;
        this.h = health;
        this.d = defense;
        this.r = runChance;
        this.dieAtEndOfTurn = false;
        this.jobj = null;
    }

    attack()
    {
        return {text:"Not Implemented.",damage:0};
    }

    run()
    {
        return (Math.random() <= this.r);
    }

    runMessage()
    {
        return null;
    }

    hit(damage)
    {
        this.h-=damage;
        return this.h <= 0;
    }

    talk()
    {
        return "";
    }

    magic()
    {
        return "Magic has no effect on a " + this.myName + ".";
    }

    remove()
    {
        this.jobj.fadeOut(2000, function () {this.remove();});
    }

    htmlPicture(root,picture)
    {
        var h = $('<img class="imageMonster" src="' + Helper.imageURL(picture) + '">');
        root.append(h);
        this.jobj = h;
    }

    html(root)
    {
        var h = $('<p>missing, no?</p>');
        root.append(h);
        this.jobj = h;
    }
}

class Aragore extends Monster
{
    constructor()
    {
        super("Aragore",100,0,0);
        this.maxH = this.h;
        this.index = 0;
    }

    attack()
    {
        this.index++;
        switch(this.index)
        {
            case 1: return {text:"Aragore scalds you with his fiery breath, dealing " + player.checkDamage(5) + " damage.",damage:10};
            case 2: return {text:"Aragore hesitates.",damage:0};
            case 3: return {text:"Aragore claws at you with immense fury. You take " + player.checkDamage(12) + " damage",damage:12};
            case 4: return {text:"Aragore prepares.",damage:0};
            case 5: return {text:"Aragore whacks you with his tail. You take " + player.checkDamage(5) + " damage.", damage:5};
            case 6: return {text:"Aragore looks you straight in the eye, and his unholy glare pierces your soul. You take " + player.checkDamage(20) + " damage.",damage:20};
            case 7:
            {
                this.h += 5;
                if (this.h > this.maxH) this.h = this.maxH;
                return {text:"Aragore uses healing magic.", damage:0}
            }; break;

            case 8:
            {
                this.index = 0;
                return this.attack();
            }; break;
        }
    }

    talk()
    {
        return "Aragore replies, \"" + getRandomNonRepeating(["Your kind deserve death.","I locked you in the dungeon for a reason.","I will do what the monster's could not.","I will make sure this is painful."]) + "\"";
    }

    magic()
    {
        player.changeHealth(-5);
        return "Aragore repels the magic back at you, and you take 5 damage.";
    }

    html(root)
    {
        var h = $(
            `<div id="aragore">
            <div class="head"></div>
            </div>`
            );
        root.append(h);
        this.jobj = h;
    }
}

class Amadeus extends Monster
{
    constructor()
    {
        super("Amadeus", 150, 0, 0);
        this.charge = 0;
        this.waited = false;
        this.shiverAnim;
        this.breatheAnim;
        this.intelligence = 0;
        this.flavorer = new GrabBag([
            text.amadeusFight.flavor1,
            text.amadeusFight.flavor2,
            text.amadeusFight.flavor3
            ]);
    }

    smack()
    {
        this.shiverAnim.end();
        this.setPicture(4);
        CSSAnimation.trigger($("#gamewindow"),"shake");
        var _this = this;
        setTimeout(function(){_this.setPicture(1); _this.breatheAnim.start();},1000);
        this.charge = 0;
    }

    say(text)
    {
        var w = new Writer(bottomWriter,text);
        currentBattle.queueAction(function () 
        {
            w.write();
            if (w.complete) currentBattle.finishAction();
        });
    }

    attack()
    {
        this.charge++;
        switch(this.charge)
        {
            case 1:
            {
                this.setPicture(2);
                return {damage:0,text:"Amadeus lifts his wicked-cool mallet."};
            }; break;

            case 2:
            {
                this.setPicture(3);
                this.breatheAnim.end();
                this.shiverAnim.start();
                return {damage:0,text:"Amadeus holds his mallet high above his head like a boss."};
            }; break;

            case 3:
            {
                if (player.defending)
                {
                    if (this.intelligence == 0)
                    {
                        this.smack();
                        this.intelligence = 1;
                        this.say(text.amadeusFight.banter1);
                        return {damage:0,text:"Amadeus crashes his mallet upon you, dealing absolutely no damage."}
                    }
                    else if (this.intelligence == 1)
                    {
                        this.smack();
                        this.intelligence = 2;
                        this.say(text.amadeusFight.banter2);
                        return {damage:0,text:"Amadeus crashes his mallet upon you, dealing absolutely no damage..."}
                    }
                    else if (this.intelligence > 1)
                    {
                        if (this.waited)
                        {
                            this.smack();
                            this.waited = false;
                            if (this.intelligence == 2)
                            {
                                this.intelligence = 3;
                                this.say(text.amadeusFight.banter4);
                            }
                            return {damage:0,text:"Amadeus finally crashes down the mallet, dealing nothing."};
                        }
                        else
                        {
                            this.charge--;
                            this.say(text.amadeusFight.banter3);
                            this.waited = true;
                            return {damage:0,text:"Amadeus hesitates."};
                        }
                    }
                }

                this.smack();

                return {damage:9999,text:"Amadeus crashes his mallet upon you, dealing a ludicrous 9999 damage."}
            }; break;
        }
        return {text:"You broke Amadeus! The server cries out in agony."}
    }

    html(root)
    {
        var h = $('<div id="amadeus"></div>');
        root.append(h);
        this.jobj = h;
        this.setPicture(1);
        this.shiverAnim = new CSSAnimation(h,"shiver");
        this.breatheAnim = new CSSAnimation(h,"trollPose").start();
    }

    setPicture(image)
    {
        Amadeus.sprites.setSprite(this.jobj,image,1);
    }

    magic()
    {
        return "Amadeus' golden tunic reflected all the light, making it useless.";
    }

    talk()
    {
        var _this = this;
        if (this.flavorer.empty)
        {
            return "Amadeus is all out of things to say.";
        }
        else 
        {
            var w = new Writer(topWriter,_this.flavorer.pull());
            return new Doer([w.getThing()]);
        }
    }

    inspect()
    {
        var _this = this;
        return [
        "It's a red troll.",
        "He says his name is Amadeus.",
        "He deals a lot of damage.",
        "He has a lot of health."
        ]
    }
}
Amadeus.sprites = new SpriteSheet("Images/troll2.png",4,1);

class Decoy extends Monster
{
    constructor()
    {
        super("Decoy", 1000, 0, 0);
        this.important = false;
        this.flavorer = new NonrepeatingGetter(["Decoy taunts","Decoy hangs out","Decoy is content to be beat"]);
    }

    attack()
    {
        var text = this.flavorer.get() + " and deals " + player.checkDamage(1) + " damage.";
        return {text,damage:1};
    }

    magic()
    {
        return "Magic has no effect on a block of stupidity.";
    }

    talk()
    {
        return "Decoy gives you the silent treatment.";
    }

    html(root)
    {
        this.htmlPicture(root,"decoy");
    }

    inspect()
    {
        return [
        "I have no clue what this is."
        ]
        var _this = this;
        return [
        {text:"That thing is weird.",aExpr:expr.emery.unsure},
        ["Decoy:|Health is " + _this.h + "/1000|Attack is 1"],
        ["There's one of those little sidebox things here in the book..."],
        ["\"Decoys are unimportant monsters, which means their death is not necessary to win the battle.\""],
        ["huh."],
        ]
    }
}

class Door extends Monster
{
    constructor()
    {
        super("Iron Door", 100, 0, 0);
        this.flavorer = new NonrepeatingGetter(["The door exasperates you with its lack of movement.","The door does not budge.","The door would laugh at you if it had a mouth."]);
    }

    attack()
    {
        var text = this.flavorer.get();
        return {text,damage:0};
    }

    magic()
    {
        this.dieAtEndOfTurn = true;
        return "The door opened with ease.";
    }

    talk()
    {
        return "Silly Goose! It does not respond because it is a door.";
    }

    html(root)
    {
        this.htmlPicture(root,"door");
    }

    inspect()
    {
        return [
            "It's a door.",
            "That's it."
        ]
        var _this = this;
        return [
        {text:"Let me see here...",aExpr:expr.emery.happy},
        {text:"waitaminute. Is that a door?", aExpr:expr.emery.unsure}
        ["I guess I'll have to use a different book..."],
        ["Uhhhhh..."],
        ["\"ARCANE ARCHITECTURE\" 2nd Edition; Here we go."]
        ["Iron Door:|Health is " + _this.h + "/100|Attack is 0|Annoyance is 173"],
        ["The lock is impenetrable to all forms of science."],
        ["Have fun with that."]
        ]
    }
}

class IntrovertedGhost extends Monster
{
    constructor()
    {
        super("Introverted Ghost",20,0,0.2);
        this.powerup = 0;
    }

    attack()
    {
        var damage = 5 + this.powerup;
        return {text:"Introverted Ghost hit you, dealing "  + player.checkDamage(damage) + " damage.",damage};
    }

    magic()
    {
        this.powerup+=5;
        return "The Introverted Ghost absorbed your magics, increasing his power.";
    }

    talk()
    {
        this.dieAtEndOfTurn = true;
        return "You scared the Introverted Ghost away."
    }

    html(root)
    {
        var h = $(
            '<div class="ghost ghostPose"></div>'
            );
        root.append(h);
        this.jobj = h;
        var endBlink = function()
        {
            h.css("background-position","bottom");
            setTimeout(startBlink,Math.randomInt(500,3000));
        }
        var startBlink = function()
        {
            h.css("background-position","top");
            setTimeout(endBlink,150);
        }
        setTimeout(startBlink,Math.randomInt(500,3000));
    }

    inspect()
    {
        var _this = this;
        return [
        {text:"Let me see here...",aExpr:expr.emery.happy},
        ["Introverted Ghost:|Health is " + _this.h + "/20|Attack is 5"],
        ["It says here that \"They are capable of absorbing magic\" so I probably wouldn't use\"CAST\""],
        ["I would imagine they don't like \"TALK\"ing due to their introverted-ness"],
        ["Otherwise they seem to be pretty cookie-cutter."],
        ["Hope that helps."]
        ]
    }
}

class Reaper extends Monster
{
    constructor()
    {
        super("Reaper", 15, 2, 1);
        this.sycthe = null;
    }

    attack()
    {
        if (player.health >= 14)
        {
            var damage = Math.randomInt(1,5);
            CSSAnimation.trigger(this.sycthe,"spin360");
            return {text:("Reaper dealt " + player.checkDamage(damage) + " damage."),damage};
        }
        else
        {
            var damage = player.health;
            cover.flash("black",null,null,100);
            CSSAnimation.trigger(this.sycthe,"spin360");
            return {text:"Reaper used \"SPECTRAL SLICE\".",damage};
        }
    }

    talk()
    {
        return "Reaper cannot speak, for he has no mouth.";
    }

    html(root)
    {
        this.sycthe = $('<div class="reaperSycthe"></div>');
        var h = $(
            `
            <div class="reaperShadow"></div>
            <div class="reaper ghostPose"></div>
            `
            );
        root.append(h);
        root.append(this.sycthe);
        this.jobj = h;
    }

    inspect()
    {
        var _this = this;
        return [
        {text:"Huh, I can't seem to find this one...",aExpr:expr.emery.unsure},
        ["Give me a sec..."],
        ["..."],
        ["Aha! I had to look in the \"OBSCURIS ALMANAC\" for this one.",expr.emery.happy],
        ["Reaper:|Health is " + _this.h + "/15|Attack is 1-5 randomly"],
        ["They are capable of a move called \"SPECTRAL SLICE\""],
        ["It will mortally wound you instantly if your health falls below fourteen."],
        ["Spooky."]
        ]
    }
}

class Skeleton extends Monster
{
    constructor()
    {
        super("Generic Skeleton", 30, 2, 1);
    }

    attack()
    {
        Skeleton.sprites.animate(this.jobj,Skeleton.attackAnim,100);
        return {text:("Skeleton dealt " + player.checkDamage(4) + " damage."),damage:4};
    }

    talk()
    {
        return "...ehehehehehehehehehe...";
    }

    html(root)
    {
        var h = $(
            `
            <div class="skeleton"></div>
            `
            );
        root.append(h);
        Skeleton.sprites.setSprite(h,1,1);
        this.jobj = h;
    }

    inspect()
    {
        var _this = this;
        return [
        {text:"Heh...",aExpr:expr.emery.happy},
        ["It's a \"Spooky, Scary Skeleton\""],
        ["Generic Skeleton:|Health is " + _this.h + "/30|Attack is 4"],
        ["That's it."],
        ["Pretty Generic..."]
        ]
    }
}
Skeleton.attackAnim = [{x:4,y:1},{x:4,y:2,time:500},{x:1,y:1}];
Skeleton.sprites = new SpriteSheet("Images/skeleton.png",4,2);

class Thaddeus extends Monster
{
    constructor()
    {
        super("Thaddeus", 200, NaN, 0);
        this.sycthe = null;
    }

    attack()
    {
        if (player.health >= 25)
        {
            var damage = Math.randomInt(6,13);
            CSSAnimation.trigger(this.sycthe,"spin360");
            return {text:("Thaddeus dealt " + player.checkDamage(damage) + " damage."),damage};
        }
        else
        {
            var damage = player.health;
            cover.flash("black",null,null,100);
            CSSAnimation.trigger(this.sycthe,"spin360");
            return {text:"Thaddeus used \"SPECTRAL SLICE++\".",damage};
        }
    }

    talk()
    {
        return "...";
    }

    html(root)
    {
        this.sycthe = $('<div id="thaddeusSycthe"></div>');
        var h = $(
            `
            <div id="thaddeus"></div>
            `
            );
        root.append(h);
        root.append(this.sycthe);
        this.jobj = h;
        Thaddeus.sprites.setSprite(h,2,1);
    }

    inspect()
    {
        var _this = this;
        return [
        {text:"I don't need a book to tell you about this guy.",aExpr:expr.emery.annoyed},
        ["Emery's Uncle Thaddeus:|Health is " + _this.h + "/15|Attack is 6-13 randomly|Past History is a whopping 25!"],
        ["Uncle Thaddeus seems to have mastered the \"SPECTRAL SLICE\"; He can mortally wound you if your health drops below 25."],
        ["He's scrappy.|Don't underestimate him."]
        ]
    }
}
Thaddeus.sprites = new SpriteSheet("Images/thaddeus.png",2,2);

class Sponge extends Monster
{
    constructor()
    {
        super("Sponge", 30, 2, 1);
        this.flavorText = new NonrepeatingGetter(["Sponge douses you with water.","Sponge attacks you with his magical Spongey powers.","Sponge bobs.","A crab jumps out of Sponge at you."]);
    }

    attack()
    {
        var ft = this.flavorText.get();
        return {text:(ft + nl + "Sponge dealt " + player.checkDamage(2) + " damage."),damage:2};
    }

    talk()
    {
        return "The sponge does not seem to be up for much conversation...";
    }

    html(root)
    {
        var h = $(
            `
            <div class="puddle"></div>
            <div class="sponge spongePose" src="` + Helper.imageURL("sponge") + `"></div>
            `
            );
        root.append(h);
        this.jobj = h;
    }

    inspect()
    {
        return [
        "It's a sponge.",
        "That's it."
        ]
        /*var _this = this;
        return [
        {text:"Hmmm...",aExpr:expr.emery.happy},
        ["Sponge:|Health is " + _this.h + "/30|Attack is 2"],
        ["...Interesting..."],
        ["Oh, Sorry! I have to consciously tell you."],
        ["Sponges are immune to magic."],
        ["Sponges cannot move."],
        ["at all."],
        ["They also can't speak."],
        ["Seems like a run-of-the-mill sponge."]
        ]*/
    }
}

class Troll extends Monster
{
    constructor()
    {
        super("Troll", 30, 0, 0.4);
        this.charge = 0;
        this.shiverAnim;
        this.breatheAnim;
        this.flavorer = new NonrepeatingGetter([
            "No, I have not considered a different vocation.",
            "Yes, I am a troll.",
            "No, I am not going to quit!",
            "Yes, I like my hammer.",
            "No, I am not in a relationship.",
            "Yes, my stone tunic is in style."
            ]);
    }

    attack()
    {
        this.charge++;
        switch(this.charge)
        {
            case 1:
            {
                this.setPicture(2);
                return {damage:0,text:"The Troll lifts his mallet."};
            }; break;

            case 2:
            {
                this.setPicture(3);
                this.breatheAnim.end();
                this.shiverAnim.start();
                return {damage:0,text:"The Troll holds his mallet high above his head!!!"};
            }; break;

            case 3:
            {
                this.shiverAnim.end();
                this.setPicture(4);
                CSSAnimation.trigger($("#gamewindow"),"shake");
                var _this = this;
                setTimeout(function(){_this.setPicture(1); _this.breatheAnim.start();},1000);
                this.charge = 0;
                return {damage:30,text:"The Troll crashes his mallet upon you, dealing " + player.checkDamage(30) +" damage."}
            }; break;
        }
    }

    html(root)
    {
        var h = $('<div class="troll"></div>');
        root.append(h);
        this.jobj = h;
        this.shiverAnim = new CSSAnimation(h,"shiver");
        this.breatheAnim = new CSSAnimation(h,"trollPose").start();
    }

    setPicture(image)
    {
        var width = -30;
        this.jobj.css("background-position","bottom left " + width * (image-1) + "vh");
    }

    magic()
    {
        if (Math.random() < 0.99)
        {
            if (this.charge == 3) stopAnimation(this.jobj,"shiver");
            this.setPicture(1);
            this.charge = 0;
            return "You confused the Troll with bright lights.";
        }
        return "The Troll ignored your distracting magics."
    }

    talk()
    {
        const _this = this;
        return new Doer([{action:function() {topWriter.show(_this.flavorer.get(),expr.troll.default);}}]);
    }

    inspect()
    {
        var _this = this;
        return [
        "It's a green troll.",
        "It deals a lot of damage every three turns.",
        "It has some health."
        ]
    }
}