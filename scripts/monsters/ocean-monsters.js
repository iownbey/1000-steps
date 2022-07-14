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
                Battle.current.dealPlayerDamage(30);
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

        this.renderer = new SpriteRenderer($mangler[0], "./images/Ocean/angler.png", 96, 96);

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

class Shark extends Monster {
    constructor() {
        super("Shark", 50, 0, 0.3);
        this.raged = false;
        this.talkFlavor = new NonrepeatingGetter([
            "You can't trust a dolphin",
            "I wish we could go back to the old regime",
            "Wow, you're brighter than a manglerfish!",
            "The Shark King will be pleased when we capture you.",
            "Darkness? The only darkness I know about is the trench.",
            "Why are you helping a dolphin?"
        ]);
    }

    async attack() {

        var offset = Vector2D.getNormalVector().rotate(Math.random() * 360).scale(300);
        var points;

        if (this.raged) {
            var offset2 = offset.rotate(20);
            var offset3 = offset.rotate(40);
            var point = new EaseInOutPoint(offset,1,0);
            var point2 = new EaseInOutPoint(offset2,1,0.5);
            var point3 = new EaseInOutPoint(offset3,1,1);
            points = [point,point2,point3];
        }
        else {
            var point = new EaseInOutPoint(offset,2,0);
            points = [point];
        }

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        var failed = points.filter(r => r.state === -1).length;
        if (this.raged) failed *= 2;
        if (failed === 0)
        {
            if (Math.random() < 0.2)
            {
                this.rage()
                return {text:"Shark was frustrated that he missed!"};
            }
            else
            {
                return {text:"The shark's bark was worse than it's bite."};
            }
        }
        else
        {
            return {text:`Shark munched and dealt ${5*failed} damage!`,damage: 5*failed};
        }
    }

    rage() {
        this.raged = true;
        this.renderer.setSprite(2,0);
    }

    unrage() {
        this.raged = false;
        this.renderer.setSprite(0,1);
    }

    async hit(damage) {
        this.h -= damage;
        if (this.h <= 0) return true;
        else {
            if (Math.random() < 0.8)
            {
                if (this.raged)
                {
                    this.unrage();
                    await new Writer(topWriter,["You knocked some sense into shark."]).writeAllAsync();
                }
                else
                {
                    this.rage();
                    await new Writer(topWriter,["Shark is getting mad!"]).writeAllAsync();
                }
            }
            return false;
        }
    }

    talk() {
        return [this.talkFlavor.get()];
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
            ["Sharks are known for their tempers.|When they get angry they deal double damage and attack more"],
            ["Maybe try to keep them calm???"]
        ]
    }

    html(root) {
        var $shark = $('<canvas style="height:150%;width:150%;left:-25%;" id="marty"></canvas>');
        this.jobj = $shark;
        this.canvas = $shark[0];
        $shark.appendTo(root);

        this.renderer = new SpriteRenderer($shark[0], "./images/Ocean/shark.png", 64, 64);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(0, 1);
        };

        this.breatheAnim = new CSSAnimation($shark, "trollPose").start();
    }


}

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

// Boss
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

        this.renderer = new SpriteRenderer($marty[0], "./images/Ocean/dolphin.png", 64, 64);

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