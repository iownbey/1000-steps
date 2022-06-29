
class Monster {
    constructor(name, health, defense, runChance) {
        this.important = true;
        this.myName = name;
        this.h = health;
        this.d = defense;
        this.r = runChance;
        this.dieAtEndOfTurn = false;
        this.jobj = null;
    }

    attack() {
        return new Promise((resolve) => {
            resolve({ text: "Not Implemented.", damage: 0 });
        });
    }

    run() {
        return (Math.random() <= this.r);
    }

    runMessage() {
        return null;
    }

    hit(damage) {
        this.h -= damage;
        return this.h <= 0;
    }

    talk() {
        return "";
    }

    magic() {
        return "Magic has no effect on a " + this.myName + ".";
    }

    remove() {
        this.jobj.fadeOut(2000, function () { this.remove(); });
    }

    htmlPicture(root, picture) {
        var h = $('<img class="imageMonster" src="' + Helper.imageURL(picture) + '">');
        root.append(h);
        this.jobj = h;
    }

    html(root) {
        var h = $('<p>missing, no?</p>');
        root.append(h);
        this.jobj = h;
    }
}

class Aragore extends Monster {
    constructor() {
        super("Aragore", 100, 0, 0);
        this.maxH = this.h;
        this.index = 0;
    }

    async attack() {
        this.index++;
        switch (this.index) {
            case 1: return { text: "Aragore scalds you with his fiery breath, dealing {$d} damage.", damage: 10 };
            case 2: return { text: "Aragore hesitates." };
            case 3: return { text: "Aragore claws at you with immense fury. You take {$d} damage", damage: 12 };
            case 4: return { text: "Aragore prepares." };
            case 5: return { text: "Aragore whacks you with his tail. You take {$d} damage.", damage: 5 };
            case 6: return { text: "Aragore looks you straight in the eye, and his unholy glare pierces your soul. You take {$d} damage.", damage: 20 };
            case 7:
                {
                    this.h += 5;
                    if (this.h > this.maxH) this.h = this.maxH;
                    return { text: "Aragore uses healing magic." }
                }; break;

            case 8:
                {
                    this.index = 0;
                    return this.attack();
                }; break;
        }
    }

    talk() {
        return "Aragore replies, \"" + getRandomNonRepeating(["Your kind deserve death.", "I locked you in the dungeon for a reason.", "I will do what the monster's could not.", "I will make sure this is painful."]) + "\"";
    }

    magic() {
        player.changeHealth(-5);
        return "Aragore repels the magic back at you, and you take 5 damage.";
    }

    html(root) {
        var h = $(
            `<div id="aragore">
            <div class="head"></div>
            </div>`
        );
        root.append(h);
        this.jobj = h;
    }
}

class Amadeus extends Monster {
    constructor() {
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

    smack() {
        this.shiverAnim.end();
        this.setPicture(4);
        CSSAnimation.trigger($("#gamewindow"), "shake");
        var _this = this;
        setTimeout(function () { _this.setPicture(1); _this.breatheAnim.start(); }, 1000);
        this.charge = 0;
    }

    say(text) {
        var w = new Writer(bottomWriter, text);
        currentBattle.queueAction(function () {
            w.write();
            if (w.complete) currentBattle.finishAction();
        });
    }

    async attack() {
        this.charge++;
        switch (this.charge) {
            case 1:
                {
                    this.setPicture(2);
                    return { damage: 0, text: "Amadeus lifts his wicked-cool mallet." };
                }; break;

            case 2:
                {
                    this.setPicture(3);
                    this.breatheAnim.end();
                    this.shiverAnim.start();
                    return { damage: 0, text: "Amadeus holds his mallet high above his head like a boss." };
                }; break;

            case 3:
                {
                    if (player.defending) {
                        if (this.intelligence == 0) {
                            this.smack();
                            this.intelligence = 1;
                            this.say(text.amadeusFight.banter1);
                            return { damage: 0, text: "Amadeus crashes his mallet upon you, dealing absolutely no damage." }
                        }
                        else if (this.intelligence == 1) {
                            this.smack();
                            this.intelligence = 2;
                            this.say(text.amadeusFight.banter2);
                            return { damage: 0, text: "Amadeus crashes his mallet upon you, dealing absolutely no damage..." }
                        }
                        else if (this.intelligence > 1) {
                            if (this.waited) {
                                this.smack();
                                this.waited = false;
                                if (this.intelligence == 2) {
                                    this.intelligence = 3;
                                    this.say(text.amadeusFight.banter4);
                                }
                                return { damage: 0, text: "Amadeus finally crashes down the mallet, dealing nothing." };
                            }
                            else {
                                this.charge--;
                                this.say(text.amadeusFight.banter3);
                                this.waited = true;
                                return { damage: 0, text: "Amadeus hesitates." };
                            }
                        }
                    }

                    this.smack();

                    return { damage: 9999, text: "Amadeus crashes his mallet upon you, dealing a ludicrous {$d} damage." }
                }; break;
        }
        return { text: "You broke Amadeus! The server cries out in agony." }
    }

    html(root) {
        var h = $('<div id="amadeus"></div>');
        root.append(h);
        this.jobj = h;
        this.setPicture(1);
        this.shiverAnim = new CSSAnimation(h, "shiver");
        this.breatheAnim = new CSSAnimation(h, "trollPose").start();
    }

    setPicture(image) {
        Amadeus.sprites.setSprite(this.jobj, image, 1);
    }

    magic() {
        return "Amadeus' golden tunic reflected all the light, making it useless.";
    }

    talk() {
        var _this = this;
        if (this.flavorer.empty) {
            return "Amadeus is all out of things to say.";
        }
        else {
            var w = new Writer(topWriter, _this.flavorer.pull());
            return new Doer([w.getThing()]);
        }
    }

    inspect() {
        var _this = this;
        return [
            "It's a red troll.",
            "He says his name is Amadeus.",
            "He deals a lot of damage.",
            "He has a lot of health."
        ]
    }
}
Amadeus.sprites = new SpriteSheet("Images/troll2.png", 4, 1);

class Chain extends Monster {
    constructor() {
        super("Chain", 1000, 0, 0);
    }

    async attack() {

        var points = [];
        var pointQuantity = 7;
        var delay = 0;
        for (let i = 0; i < pointQuantity; i++) {

            delay += 0.2 + (Math.random() * 0.2);
            points.push(getPoint(delay));
        }

        this.shiverAnim.start();
        cancelAnimationFrame(this.renderHandle);
        this.renderer.setSprite(1, 1);

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        this.shiverAnim.end();
        this.renderHandle = requestAnimationFrame(this.renderLoop);

        if (points.some((p) => { return (p.state === -1) })) {
            this.shakeAnim.trigger();
            return { damage: 10, text: "Chain remains unbroken.|He dealt {$d} damage." };
        }
        else {
            return { damage: 0, text: "You were stronger than Chain" };
        }

        function getPoint(delay) {
            var lifetime = 1.5;
            let p = new EaseInOutPoint(
                new Vector2D((Math.random() > 0.5) ? 300 : -300, 300),
                lifetime, delay);
            if (Math.random() < 0.3) p.lure();
            return p;
        }
    }

    html(root) {
        var $content = $('<canvas style="height:180%;width:180%;left:-40%;position=absolute;" id="chain"></canvas>');
        this.jobj = $content;
        this.canvas = $content[0];
        $content.appendTo(root);

        this.renderer = new SpriteRenderer($content[0], "./Images/chain.png", 64, 64);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(1, 0);
        };

        this.renderHandle = requestAnimationFrame(renderLoop);
        const frames = ([
            new Vector2D(1, 0),
            new Vector2D(2, 1),
            new Vector2D(3, 0),
            new Vector2D(2, 0)
        ]);
        this.renderLoop = renderLoop;
        function renderLoop(ml) {
            const fps = 3;
            const interval = 1000.0 / fps;
            const frame_i = Math.floor(ml / interval) % frames.length;
            const frame = frames[frame_i];

            _this.renderer.setSprite(frame.x, frame.y);

            _this.renderHandle = requestAnimationFrame(renderLoop);
        }

        this.shakeAnim = new CSSAnimation($content, "shake");
        this.shiverAnim = new CSSAnimation($content, "shiver");
        this.breatheAnim = new CSSAnimation($content, "trollPose").start();
    }

    talk() {
        return this.dialogue.get();
    }

    magic() {
        return "Idiot."
    }

    inspect() {
        return [
            "The DARKNESS, a near omnipotent pseudo-deity ruling over Earth with an iron fist."
        ]
    }
}

class Decoy extends Monster {
    constructor() {
        super("Decoy", 1000, 0, 0);
        this.important = false;
        this.flavorer = new NonrepeatingGetter(["Decoy taunts", "Decoy hangs out", "Decoy is content to be beat"]);
    }

    attack() {
        var text = this.flavorer.get() + " and deals {$d} damage.";
        return new Promise((resolve) => resolve({ text, damage: 1 }));
    }

    magic() {
        return "Magic has no effect on a block of stupidity.";
    }

    talk() {
        return "Decoy gives you the silent treatment.";
    }

    html(root) {
        this.htmlPicture(root, "decoy");
    }

    inspect() {
        return [
            "I have no clue what this is."
        ]
        var _this = this;
        return [
            { text: "That thing is weird.", aExpr: expr.emery.unsure },
            ["Decoy:|Health is " + _this.h + "/1000|Attack is 1"],
            ["There's one of those little sidebox things here in the book..."],
            ["\"Decoys are unimportant monsters, which means their death is not necessary to win the battle.\""],
            ["huh."],
        ]
    }
}

class Door extends Monster {
    constructor() {
        super("Iron Door", 100, 0, 0);
        this.flavorer = new NonrepeatingGetter(["The door exasperates you with its lack of movement.", "The door does not budge.", "The door would laugh at you if it had a mouth."]);
    }

    async attack() {
        var text = this.flavorer.get();
        return { text };
    }

    magic() {
        this.dieAtEndOfTurn = true;
        return "The door opened with ease.";
    }

    talk() {
        return "Silly Goose! It does not respond because it is a door.";
    }

    html(root) {
        this.htmlPicture(root, "door");
    }

    inspect() {
        return [
            "It's a door.",
            "That's it."
        ]
        var _this = this;
        return [
            { text: "Let me see here...", aExpr: expr.emery.happy },
            { text: "waitaminute. Is that a door?", aExpr: expr.emery.unsure }
            ["I guess I'll have to use a different book..."],
            ["Uhhhhh..."],
            ["\"ARCANE ARCHITECTURE\" 2nd Edition; Here we go."]
            ["Iron Door:|Health is " + _this.h + "/100|Attack is 0|Annoyance is 173"],
            ["The lock is impenetrable to all forms of science."],
            ["Have fun with that."]
        ]
    }
}

class IntrovertedGhost extends Monster {
    constructor() {
        super("Introverted Ghost", 20, 0, 0.2);
        this.powerup = 0;
    }

    async attack() {
        var points = [];
        var pointQuantity = 14;
        var delay = 0;
        for (let i = 0; i < pointQuantity; i++) {
            delay += 0.3;
            points.push(new SinePoint(new Vector2D(300, 0), getRandom([0, 1, 0.5, -0.5, 0.5, -0.5]), 100, 2, 2, delay));
        }

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        if (points.some((p) => { return (p.state === -1) })) {
            var damage = 5 + this.powerup;
            return { text: "Introverted Ghost hit you, dealing {$d} damage.", damage };
        }
        else return { text: "Introverted ghost felt shy." };

    }

    magic() {
        this.powerup += 5;
        return "The Introverted Ghost absorbed your magics, increasing his power.";
    }

    talk() {
        this.dieAtEndOfTurn = true;
        return "You scared the Introverted Ghost away."
    }

    html(root) {
        var h = $(
            '<div class="ghost ghostPose"></div>'
        );
        root.append(h);
        this.jobj = h;
        var endBlink = function () {
            h.css("background-position", "bottom");
            setTimeout(startBlink, Math.randomInt(500, 3000));
        }
        var startBlink = function () {
            h.css("background-position", "top");
            setTimeout(endBlink, 150);
        }
        setTimeout(startBlink, Math.randomInt(500, 3000));
    }

    inspect() {
        var _this = this;
        return [
            { text: "Let me see here...", aExpr: expr.emery.happy },
            ["Introverted Ghost:|Health is " + _this.h + "/20|Attack is 5"],
            ["It says here that \"They are capable of absorbing magic\" so I probably wouldn't use\"CAST\""],
            ["I would imagine they don't like \"TALK\"ing due to their introverted-ness"],
            ["Otherwise they seem to be pretty cookie-cutter."],
            ["Hope that helps."]
        ]
    }
}

class ManglerFish extends Monster {
    constructor() {
        super("Mangler Fish", 50, 0, 0.3);
        this.angry = false;
    }

    async attack() {

        if (Math.random() < 0.1)
        {
            this.toggleAnger();
            await new Writer(topWriter,["The Mangler fish's temper has changed."]).writeAllAsync();
        }

        // Add "Taunt", a move that makes the player only attack this monster.

        var xSign = Math.round(Math.random()) * 2 - 1;
        var point = new ParametricPoint(
            x => xSign * TimingFunctions.convertToFlip(x) * 200,
            y => {
                const a = 400;
                return -((4 * a * (y ** 2)) - (4 * a * y) + a);
            },
            4
        );

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = [point];
        await interaction.getPromise();

        if (point.state === -1) {
            this.shakeAnim.trigger();
            return { damage: 20, text: "The Mangler fish dealt {$d} damage." };
        }
        else {
            return { text: "The Mangler fish couldn't deceive you." };
        }
    }

    toggleAnger() {
        this.angry = !this.angry;
        this.renderer.setSprite((this.angry ? 1 : 0), 0);
    }

    async hit(damage) {
        this.h -= damage;
        if (this.h <= 0) return true;
        else {
            if (this.angry) {
                await new Writer(topWriter,["The Mangler Fish lashes out.|It dealt 30 damage."]).writeAllAsync();
                currentBattle.dealPlayerDamage(30);
            }
            else {
                this.toggleAnger();
            }
            return false;
        }
    }

    talk() {
        return ["The fish makes indeterminate gurgles in response."];
    }

    magic() {
        if (Math.random() > 0.5) {
            this.toggleAnger();
            return (this.angry ? "The Mangler fish was enraged by your magics." : "The Mangler fish was calmed by your magics.");
        }
        else "The fish was too resolute to be affected.";
    }

    inspect() {
        var _this = this;
        return [
            { text: "Let's see...", aExpr: expr.emery.happy },
            ["Mangler Fish:|Health is " + _this.h + "/50|Attack is 7"],
            ["Occasionally, Mangler fish have been known to lash out when attacked."],
            ["Choose your timing wisely."]
        ]
    }

    html(root) {
        var $mangler = $('<canvas style="height:120%;width:120%;left:-10%;" class="mangler"></canvas>');
        this.jobj = $mangler;
        this.canvas = $mangler[0];
        $mangler.appendTo(root);

        this.renderer = new SpriteRenderer($mangler[0], "./Images/Ocean/angler.png", 96, 96);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(0, 0);
        };

        var perlinOrigin = new Vector2D(Math.random() * 10000, Math.random() * 10000);

        function animation(timestamp) {
            var offset = timestamp / 1000;
            if (_this.angry) offset *= 2;
            var p1 = perlinOrigin.add(new Vector2D(0, offset));
            var p2 = perlinOrigin.add(new Vector2D(offset, 0));

            _this.jobj.css("left", `${perlin.get(p1.x, p1.y) * 20}%`);
            _this.jobj.css("bottom", `${perlin.get(p2.x, p2.y) * 20}%`);

            _this.animHandle = requestAnimationFrame(animation)
        }

        this.animHandle = requestAnimationFrame(animation)
    }


}

class Martimer extends Monster {
    constructor() {
        super("Martimer", 1000, 0, 0);
        this.dialogue = new SequenceGetter([
            "Stop looking at me like that. It's nothing personal.",
            "Besides, YOU did this.",
            "I'm not sure why I'm fighting you. I should be thanking you.",
            "YOU killed the shark king."
        ]);
    }

    async attack() {

        var points = [];
        var pointQuantity = 20;
        var delay = 0;
        for (let i = 0; i < pointQuantity; i++) {

            delay += 0.2 + ((Math.random() > 0.5) ? 0 : 0.2);
            points.push(getPoint(delay));
        }

        this.breatheAnim.end();
        this.shiverAnim.start();
        this.renderer.setSprite(1, 0);

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        this.renderer.setSprite(0, 0);
        this.shiverAnim.end();
        this.breatheAnim.start();

        if (points.some((p) => { return (p.state === -1) })) {
            this.shakeAnim.trigger();
            return { damage: 20, text: "Virgil only needed a single blow to deal {$d} damage." };
        }
        else {
            return { text: "Virgil is impressed" };
        }

        function getPoint(delay) {
            function randomSign() {
                return Math.sign(Math.random() - 0.5);
            }
            function randomRange(min, max) {
                return min + (Math.random() * (max - min));
            }

            var pos = new Vector2D(randomRange(200, 300) * randomSign(), randomRange(150, 200) * randomSign());
            var lifetime = 1.5;
            return new EaseInOutPoint(pos, lifetime, delay);
        }
    }

    html(root) {
        var $marty = $('<canvas style="height:150%;width:150%;left:-25%;" id="marty"></canvas>');
        this.jobj = $marty;
        this.canvas = $marty[0];
        $marty.appendTo(root);

        this.renderer = new SpriteRenderer($marty[0], "./Images/Ocean/dolphin.png", 64, 64);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(1, 0);
        };

        this.breatheAnim = new CSSAnimation($marty, "dolphinPose").start();
        this.shakeAnim = new CSSAnimation($marty, "shake");
        this.shiverAnim = new CSSAnimation($marty, "shiver");
    }

    talk() {
        return this.dialogue.get();
    }

    magic() {
        return ["OoOoOh.", "I don't feel so swell."]
        //Don't call friends into battle for so many turns
    }

    inspect() {
        return "That's one blowhole of a dolphin.";
    }
}

class MasterSponge extends Monster {
    constructor() {
        super("Master Sponge", 1000, 0, 0);
        this.dialogue = new SequenceGetter([
            "\"F\" is for fighting, harm the harbinger",
            "\"U\" is for unparralleled hurt",
            "\"N\" is for never getting outside of Earth's Core, your destined to die in the dirt.",
            "Sponge makes some unsettling noises."
        ]);
    }

    async attack() {

        var points = [];
        var pointQuantity = 20;
        var delay = 0;
        for (let i = 0; i < pointQuantity; i++) {

            delay += 0.2 + ((Math.random() > 0.5) ? 0 : 0.2);
            points.push(getPoint(delay));
        }

        this.breatheAnim.end();
        this.shiverAnim.start();
        this.renderer.setSprite(1, 0);

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        this.renderer.setSprite(0, 0);
        this.shiverAnim.end();
        this.breatheAnim.start();

        if (points.some((p) => { return (p.state === -1) })) {
            this.shakeAnim.trigger();
            return { damage: 20, text: "Virgil only needed a single blow to deal {$d} damage." };
        }
        else {
            return { damage: 0, text: "Virgil is impressed" };
        }

        function getPoint(delay) {
            function randomSign() {
                return Math.sign(Math.random() - 0.5);
            }
            function randomRange(min, max) {
                return min + (Math.random() * (max - min));
            }

            var pos = new Vector2D(randomRange(200, 300) * randomSign(), randomRange(150, 200) * randomSign());
            var lifetime = 1.5;
            return new EaseInOutPoint(pos, lifetime, delay);
        }
    }

    html(root) {
        var $virgil = $('<canvas style="height:180%;width:180%;left:-40%;" id="virgil"></canvas>');
        this.jobj = $virgil;
        this.canvas = $virgil[0];
        $virgil.appendTo(root);

        this.renderer = new SpriteRenderer($virgil[0], "./Images/master-sponge.png", 1024, 1024);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(0, 0);
        };

        this.breatheAnim = new CSSAnimation($virgil, "trollPose").start();
        this.shakeAnim = new CSSAnimation($virgil, "shake");
        this.shiverAnim = new CSSAnimation($virgil, "shiver");
    }

    talk() {
        return this.dialogue.get();
    }

    inspect() {
        return [
            "The unholy endowment of a barely living being with the DARKNESS, himself.",
        ]
    }
}

class PreMasterSponge extends Monster {
    constructor() {
        super("Sponge?", 100, 0, 0);
        this.turnsAlive = 0;
    }

    async attack() {
        let writerContents;
        switch (++this.turnsAlive) {
            case 1: writerContents = ["The sponge is making some very strange noises.", "It's ebb and flow seem unnatural."]; break;
            case 2: writerContents = ["The sponge is...", "Mumbling?"]; break;
            case 3: writerContents = ["...", "Something bad is about to happen."]; break;
        }

        await new Writer(bottomWriter, writerContents).writeAllAsync();

        if (this.turnsAlive === 3) {
            this.shakeAnim.start();
            sound.stop();
            sound.playFX("pre-master-sponge");
            await cover.fadeTo(1, 5000);
            currentBattle.endNow();
            currentBattle = new Battle("master-sponge", [new MasterSponge()], false);
        }

        return { damage: 0, text: "Nothing happened." }
    }

    // This sponge is a scripted monster. He can't die.
    hit() {
        return false;
    }

    inspect() {
        return "Something is VERY wrong."
    }

    html(root) {
        var h = $(
            `
                <div class="puddle"></div>
                <div class="sponge spongePose" src="` + Helper.imageURL("sponge") + `"></div>
                `
        );
        root.append(h);
        this.jobj = h;

        this.shakeAnim = new CSSAnimation(h, "shake");
    }

}

class Reaper extends Monster {
    constructor() {
        super("Reaper", 15, 2, 1);
        this.sycthe = null;
    }

    async attack() {
        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        var point = new SpinPoint(new Vector2D(0, 150), 3);
        interaction.renderers.push(point);
        await interaction.getPromise();

        if (point.state == -1) {
            if (player.health >= 14) {
                var damage = Math.randomInt(1, 5);
                CSSAnimation.trigger(this.sycthe, "spin360");
                return { text: ("Reaper dealt " + player.checkDamage(damage) + " damage."), damage };
            }
            else {
                var damage = player.health;
                CSSAnimation.trigger(this.sycthe, "spin360");
                await new Promise(resolve => cover.flash("black", null, resolve, 100));
                return { text: "Reaper used \"SPECTRAL SLICE\".", damage };
            }
        }
        else return { damage: 0, text: "You dodged contact with the reaper's scythe." };

    }

    talk() {
        return "Reaper cannot speak, for he has no mouth.";
    }

    html(root) {
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

    inspect() {
        var _this = this;
        return [
            { text: "Huh, I can't seem to find this one...", aExpr: expr.emery.unsure },
            ["Give me a sec..."],
            ["..."],
            ["Aha! I had to look in the \"OBSCURIS ALMANAC\" for this one.", expr.emery.happy],
            ["Reaper:|Health is " + _this.h + "/15|Attack is 1-5 randomly"],
            ["They are capable of a move called \"SPECTRAL SLICE\""],
            ["It will mortally wound you instantly if your health is less than 14."],
            ["Spooky."]
        ]
    }
}

class Shark extends Monster {
    constructor() {
        super("Shark", 50, 0, 0.3);
    }

    async attack() {

        // Has a normal attack
        // Sometimes goes into a rage
        return {text:"shorky shork"};
    }

    async hit(damage) {
        this.h -= damage;
        if (this.h <= 0) return true;
        else {
            // Sometimes gets angry
            return false;
        }
    }

    talk() {
        // Add shark flavor text
        return ["The fish makes indeterminate gurgles in response."];
    }

    magic() {
        return "Sharks are too stupid to be affected by magic.";
    }

    inspect() {
        // TODO: Shark inspect
        var _this = this;
        return [
            { text: "Let's see...", aExpr: expr.emery.happy },
            ["Shark:|Health is " + _this.h + "/50|Attack is 7"],
            ["Sharks are known for their tempers.|When they get angry they deal double damage and use STRONG attacks."],
            ["Maybe try to keep them calm???"]
        ]
    }

    html(root) {
        var $shark = $('<canvas style="height:150%;width:150%;left:-25%;" id="marty"></canvas>');
        this.jobj = $shark;
        this.canvas = $shark[0];
        $shark.appendTo(root);

        this.renderer = new SpriteRenderer($shark[0], "./Images/Ocean/shark.png", 64, 64);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(0, 1);
        };

        this.breatheAnim = new CSSAnimation($shark, "trollPose").start();
    }


}

class Skeleton extends Monster {
    constructor() {
        super("Generic Skeleton", 30, 2, 1);
    }

    async attack() {
        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        var point = (new EaseInOutPoint(new Vector2D(0, 150), 1.5));
        interaction.renderers.push(point);
        await interaction.getPromise();

        if (point.state === -1) {
            Skeleton.sprites.animate(this.jobj, Skeleton.attackAnim, 100);
            return { text: ("Skeleton dealt {$d} damage."), damage: 4 };
        }
        else return { text: "The Skeleton's hit glanced." };
    }

    talk() {
        return "...ehehehehehehehehehe...";
    }

    html(root) {
        var h = $(
            `
            <div class="skeleton"></div>
            `
        );
        root.append(h);
        Skeleton.sprites.setSprite(h, 1, 1);
        this.jobj = h;
    }

    inspect() {
        var _this = this;
        return [
            { text: "Heh...", aExpr: expr.emery.happy },
            ["It's a \"Spooky, Scary Skeleton\""],
            ["Generic Skeleton:|Health is " + _this.h + "/30|Attack is 4"],
            ["That's it."],
            ["Pretty Generic..."]
        ]
    }
}
Skeleton.attackAnim = [{ x: 4, y: 1 }, { x: 4, y: 2, time: 500 }, { x: 1, y: 1 }];
Skeleton.sprites = new SpriteSheet("Images/skeleton.png", 4, 2);

class Thaddeus extends Monster {
    constructor() {
        super("Thaddeus", 200, NaN, 0);
        this.sycthe = null;
    }

    async attack() {
        var points = [];
        const circleQuantity = 3;
        const pointsPerCircle = 5;
        var delay = 0;
        const radius = 200;
        for (let circlei = 0; circlei < circleQuantity; circlei++) {
            var offset = Vector2D.getNormalVector().scale(radius).rotate(Math.random() * 2 * Math.PI);
            for (let i = 0; i < pointsPerCircle; i++) {
                delay += 0.3 + ((Math.random() > 0.5) ? 0 : 0.3);
                points.push(new SpinPoint(offset, 3, delay));
            }
        }

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();
        if (points.some(a => a.state === -1)) {
            if (player.health >= 25) {
                var damage = Math.randomInt(6, 13);
                CSSAnimation.trigger(this.sycthe, "spin360");
                return { text: ("Thaddeus dealt " + player.checkDamage(damage) + " damage."), damage };
            }
            else {
                var damage = player.health;
                cover.flash("black", null, null, 100);
                CSSAnimation.trigger(this.sycthe, "spin360");
                return { text: "Thaddeus used \"SPECTRAL SLICE++\".", damage };
            }
        }
        else {
            return { text: "You guarded well against his sycthe.", damage: 0 };
        }
    }

    talk() {
        return "...";
    }

    html(root) {
        this.sycthe = $('<div style="width:100%;height:100%;"></div>');
        var innerSycthe = $('<div id="thaddeusSycthe" class="scytheSpin"></div>');
        this.sycthe.append(innerSycthe);
        var h = $(
            `
            <div id="thaddeus" class="trollPose"></div>
            `
        );
        root.append(h);
        h.append(this.sycthe);
        this.jobj = h;
        Thaddeus.sprites.setSprite(h, 2, 1);
    }

    inspect() {
        var _this = this;
        return [
            { text: "I don't need a book to tell you about this guy.", aExpr: expr.emery.annoyed },
            ["Emery's Uncle Thaddeus:|Health is " + _this.h + "/200|Attack is 6-13 randomly|Past History is a whopping 25!"],
            ["Uncle Thaddeus seems to have mastered the \"SPECTRAL SLICE\"; He can mortally wound you if your health drops below 25."],
            ["He's scrappy.|Don't underestimate him."]
        ]
    }
}
Thaddeus.sprites = new SpriteSheet("Images/thaddeus.png", 2, 2);

class Sponge extends Monster {
    constructor() {
        super("Sponge", 30, 2, 1);
        this.flavorText = new NonrepeatingGetter(["Sponge douses you with water.", "Sponge attacks you with his magical Spongey powers.", "Sponge bobs.", "A crab jumps out of Sponge at you."]);
    }

    attack() {
        var ft = this.flavorText.get();
        return new Promise(resolve => resolve({ text: (ft + nl + "Sponge dealt {$d} damage."), damage: 2 }));
    }

    talk() {
        return "The sponge does not seem to be up for much conversation...";
    }

    html(root) {
        var h = $(
            `
            <div class="puddle"></div>
            <div class="sponge spongePose" src="` + Helper.imageURL("sponge") + `"></div>
            `
        );
        root.append(h);
        this.jobj = h;
    }

    inspect() {
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

class Troldier extends Monster {
    constructor() {
        super("Troldier", 10, 0, 0.4);
        this.stamina = 3;
        this.shielding = false;
        this.charge = 0;
        this.shiverAnim;
        this.breatheAnim;
        this.flavorer = new NonrepeatingGetter([
            "For the king!",
            "Yes, I am a member of the troll militia.",
            "No, I will never surrender!",
            "Yes, I like my sword.",
            "No, I have not a faire maiden.",
            "Yes, my stone tunic is very protective."
        ]);
    }

    hit(d) {
        if (!this.shielding) return super.hit(d);
    }

    async attack() {
        this.shielding = false;

        //if exhausted
        if (this.stamina == 0) {
            this.breatheAnim.start();
            //Be exhausted
            this.setPicture(1);

            //recover
            this.stamina = 3;
            return { text: "The Troldier is exhausted!" };
        }
        else //otherwise
        {
            //if the player is charged...
            if (chargeAmount > 0) {
                //shield
                this.charge = 0;
                this.stamina--;
                this.shielding = true;

                this.setPicture(4);
                this.breatheAnim.end();
                this.shiverAnim.end();
                return { text: "The Troldier shields against an imminent blow." };
            }
            else {
                this.stamina = 3;
                //attack if charged, otherwise charge.
                if (this.charge == 1) {
                    this.charge = 0;

                    var interaction = new TimingIndicator(document.getElementById("content-canvas"));
                    var point = (new EaseInOutPoint(new Vector2D(75, 75), 2));
                    point.strong();
                    interaction.renderers.push(point);
                    await interaction.getPromise();

                    this.shiverAnim.end();
                    this.setPicture(3);
                    var _this = this;
                    setTimeout(function () { _this.setPicture(1); _this.breatheAnim.start(); }, 300);

                    if (point.state === -1) {
                        return { damage: 10, text: "The Troldier brings down his sword, dealing {$d} damage." }
                    }
                    else {
                        return { text: "You blocked the Troldiers attack." }
                    }



                }
                else {
                    this.charge = 1;

                    this.setPicture(2);
                    this.breatheAnim.end();
                    this.shiverAnim.start();
                    return { damage: 0, text: "The Troldier holds his sword in a position to strike!!!" };
                }
            }
        }
    }

    html(root) {
        var h = $('<div class="troll-soldier"></div>');
        root.append(h);
        this.jobj = h;
        this.shiverAnim = new CSSAnimation(h, "shiver");
        this.breatheAnim = new CSSAnimation(h, "trollPose").start();
    }

    setPicture(image) {
        var width = -30;
        this.jobj.css("background-position", "bottom left " + width * (image - 1) + "vh");
    }

    magic() {
        if (Math.random() < 0.99) {
            if (this.charge == 3) stopAnimation(this.jobj, "shiver");
            this.setPicture(1);
            this.charge = 0;
            return "You confused the Troll with bright lights.";
        }
        return "The Troll ignored your distracting magics."
    }

    talk() {
        const _this = this;
        return new Doer([{ action: function () { topWriter.show(_this.flavorer.get(), expr.troll.default); } }]);
    }

    inspect() {
        var _this = this;
        return [
            "It's a green troll soldier.",
            "It has a shield.",
            "It has some health."
        ]
    }
}

class Troll extends Monster {
    constructor() {
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

    async attack() {
        this.charge++;
        switch (this.charge) {
            case 1:
                {
                    this.setPicture(2);
                    return { text: "The Troll lifts his mallet." };
                }; break;

            case 2:
                {
                    this.setPicture(3);
                    this.breatheAnim.end();
                    this.shiverAnim.start();
                    return { text: "The Troll holds his mallet high above his head!!!" };
                }; break;

            case 3:
                {
                    var interaction = new TimingIndicator(document.getElementById("content-canvas"));
                    var point = (new EaseInOutPoint(new Vector2D(0, 150), 2));
                    point.strong();
                    interaction.renderers.push(point);
                    await interaction.getPromise();

                    this.shiverAnim.end();
                    this.setPicture(4);
                    CSSAnimation.trigger($("#gamewindow"), "shake");
                    var _this = this;
                    setTimeout(function () { _this.setPicture(1); _this.breatheAnim.start(); }, 1000);
                    this.charge = 0;
                    var damage = 30;
                    if (point.state === 1) damage = 0;
                    return { damage, text: "The Troll crashes his mallet upon you, dealing {$d} damage." }
                }; break;
        }
    }

    html(root) {
        var $html = $('<div class="troll"></div>');
        root.append($html);
        this.jobj = $html;
        this.shiverAnim = new CSSAnimation($html, "shiver");
        this.breatheAnim = new CSSAnimation($html, "trollPose").start();
    }

    setPicture(image) {
        var width = -30;
        this.jobj.css("background-position", "bottom left " + width * (image - 1) + "vh");
    }

    magic() {
        if (Math.random() < 0.99) {
            if (this.charge == 3) stopAnimation(this.jobj, "shiver");
            this.setPicture(1);
            this.charge = 0;
            return "You confused the Troll with bright lights.";
        }
        return "The Troll ignored your distracting magics."
    }

    talk() {
        const _this = this;
        return new Doer([{ action: function () { topWriter.show(_this.flavorer.get(), expr.troll.default); } }]);
    }

    inspect() {
        var _this = this;
        return [
            "It's a green troll.",
            "It deals a lot of damage every three turns.",
            "It has some health."
        ]
    }
}

class Virgil extends Monster {
    constructor() {
        super("Virgil", 1000, 0, 0);
        this.dialogue = new SequenceGetter([
            "Harbinger. This is no time to speak.",
            "Why are you trying to speak to me?",
            "You want to know your past?",
            "You know more about it than I do, my friend.",
            "I'm sure you must share my inability to recall what happened BEFORE the crossing.",
            "Well, if either of us want to find out where we came from, we can't die.",
            "You must prove to me you can survive.",
            "Prove your ability"
        ]);
    }

    async attack() {

        var points = [];
        var pointQuantity = 20;
        var delay = 0;
        for (let i = 0; i < pointQuantity; i++) {

            delay += 0.2 + ((Math.random() > 0.5) ? 0 : 0.2);
            points.push(getPoint(delay));
        }

        this.breatheAnim.end();
        this.shiverAnim.start();
        this.renderer.setSprite(1, 0);

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        this.renderer.setSprite(0, 0);
        this.shiverAnim.end();
        this.breatheAnim.start();

        if (points.some((p) => { return (p.state === -1) })) {
            this.shakeAnim.trigger();
            return { damage: 20, text: "Virgil only needed a single blow to deal {$d} damage." };
        }
        else {
            return { text: "Virgil is impressed" };
        }

        function getPoint(delay) {
            function randomSign() {
                return Math.sign(Math.random() - 0.5);
            }
            function randomRange(min, max) {
                return min + (Math.random() * (max - min));
            }

            var pos = new Vector2D(randomRange(200, 300) * randomSign(), randomRange(150, 200) * randomSign());
            var lifetime = 1.5;
            return new EaseInOutPoint(pos, lifetime, delay);
        }
    }

    html(root) {
        var $virgil = $('<canvas style="height:180%;width:180%;left:-40%;" id="virgil"></canvas>');
        this.jobj = $virgil;
        this.canvas = $virgil[0];
        $virgil.appendTo(root);

        this.renderer = new SpriteRenderer($virgil[0], "./Images/virgil.png", 64, 64);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(0, 0);
        };

        this.breatheAnim = new CSSAnimation($virgil, "trollPose").start();
        this.shakeAnim = new CSSAnimation($virgil, "shake");
        this.shiverAnim = new CSSAnimation($virgil, "shiver");
    }

    talk() {
        return this.dialogue.get();
    }

    magic() {
        return "Cute. I know how to deflect magic from OUR realm, Harbinger."
    }

    inspect() {
        if (this.inspected) {
            return ["It's still Virgil"]
        }
        else {
            return [
                "This is Virgil, the master of blade and sorrow.",
                "You don't remember much, but part of you recalls knowing him BEFORE you existed.",
                "Is he friend? foe? family?",
            ]
        }
    }
}