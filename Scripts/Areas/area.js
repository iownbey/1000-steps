const allMonsters = Object.freeze(["Troll", "Sponge", "IntrovertedGhost", "Door", "Decoy", "Skeleton", "Reaper", "Troldier"]);

class Area {
    constructor(flavor, monsters, battleTheme = "fight") {
        this.stepsTaken = 0;
        this.flavor = new NonrepeatingGetter(flavor);
        this.battleTheme = battleTheme;
        this.events = this.getEvents();
        this.currentEvent = null;
        this.monsters = this.toInts(monsters);
        this.busy = false;
        console.log(this.monsters);
    }

    static addPossibleEvent(element) {
        return Area.possibleEvents.push(element) - 1;
    }

    getEvents() {
        return [];
    }

    getNextArea() {
        console.error("Area Engine has nowhere to go.");
        return {};
    }

    getBackgroundMusic() {
        return "back";
    }

    onEnd() {

    }

    onStart() {

    }

    toMonsters(ints) {
        var monsters = [];
        ints.forEach(function (element) {
            monsters.push(allMonsters[element]);
        });
        return monsters;
    }

    toInts(monsters) {
        var ints = [];
        monsters.forEach(function (element) {
            var i = allMonsters.indexOf(element);
            if (i != -1) ints.push(i);
        });
        return ints;
    }

    getRandomMonster() {
        var classes = this.toMonsters(this.monsters);
        var monster = null;
        eval("monster = new " + getRandom(classes) + "();");
        return monster;
    }

    async walk() {
        if (this.busy) return;
        this.busy = true;
        this.stepsTaken++;
        this.onWalk();
        var event = this.events.shift();
        var _this = this;
        var handleEvent = async function (event) {
            _this.currentEvent = event;
            var r = Area.possibleEvents[event].call(_this);
            if (!((r == undefined) || (r == null))) {
                await r;
            }
        }
        if (Array.isArray(event)) {
            for (var subEvent of event) await handleEvent(subEvent);
            event.foreach(handleEvent);
        }
        else {
            await handleEvent(event);
        }
        this.busy = false;
    }

    onWalk() {

    }
}
Area.possibleEvents = [];
Area.getBackgroundChangeEvent = function (flavor, back, fore = null) {
    return Area.addPossibleEvent(function () {
        topWriter.show(flavor);
        changeBackground(back);
        changeForeground(fore);
    });
}

Area.emptyStep = Area.addPossibleEvent(function () {
    // Do Nothing
});

Area.fightEvent = Area.addPossibleEvent(function () {
    currentBattle = new Battle(this.battleTheme, [this.getRandomMonster(), this.getRandomMonster(), this.getRandomMonster()]);
});
Area.flavorEvent = Area.addPossibleEvent(function () {
    topWriter.show(this.flavor.get());
});
Area.nextAreaEvent = Area.addPossibleEvent(function () {
    this.onEnd();
    area = this.getNextArea();
    sound.playMusic(area.getBackgroundMusic());
    area.onStart();
});

// Prototype Events

Area.fightChain = Area.addPossibleEvent(function () {
    var input = { oninput: () => { } };
    currentDoer = Doer.ofPromise(async function () {
        DialogueTypewriter.clearAll();
        contentManager.clear();
        var $wrapper = $('<div class="monster"></div>');
        var $virgil = $('<canvas style="height:180%;width:180%;left:-40%;" id="chain"></canvas>');
        $virgil.appendTo($wrapper);
        contentManager.add($wrapper);

        var renderer = new SpriteRenderer($virgil[0], "./Images/chain.png", 64, 64);
        renderer.onload = () => {
            renderer.setSprite(0, 0);
        }

        await contentManager.approach();

        await new Writer(bottomWriter, [
            "Hello, Harbinger.",
            "The name's Chain.",
            "Prepare to die."
        ]).writeAllAsync();

        currentBattle = new Battle("chain", [new Chain()], false);
    }(), input);
});

Area.meetOscar = Area.addPossibleEvent(function () {
    var input = { oninput: () => { } };
    currentDoer = Doer.ofPromise(async function () {
        DialogueTypewriter.clearAll();
        contentManager.clear();
        var $wrapper = $('<div class="monster"></div>');
        var $virgil = $('<canvas style="height:80%;width:80%;left:10%;" id="oscar"></canvas>');
        $virgil.appendTo($wrapper);
        contentManager.add($wrapper);


        var animHandle;
        var renderer = new SpriteRenderer($virgil[0], "./Images/oscar.png", 32, 32);
        await new Promise(resolve => {
            renderer.onload = () => {
                var fs = new SequenceGetter([{ x: 1, y: 0 }, { x: 2, y: 0 }], true);
                function animLoop() {
                    let f = fs.get();
                    renderer.setSprite(f.x, f.y);
                }
                animHandle = setInterval(animLoop, 480);
                setTimeout(resolve, 480);
            }
        })
        sound.playMusic("accordion", true);

        await contentManager.approach();
        clearInterval(animHandle);
        await Helper.delay(1);
        sound.pause();
        await Helper.delay(1);
        renderer.setSprite(0, 0);

        let textBlob = text.aorta.meetOscar;
        await new Writer(bottomWriter, textBlob.intro).writeAllAsync();
        bottomWriter.show(textBlob.choice.prompt);
        let chose = await getChoice([textBlob.choice.yes.button, textBlob.choice.no.button], hcursor);
        if (chose == textBlob.choice.yes.button) {
            await new Writer(bottomWriter, textBlob.choice.yes.result).writeAllAsync();
        }
        else {
            await new Writer(bottomWriter, textBlob.choice.no.result).writeAllAsync();
        }
        contentManager.clear();
    }(), input);
})

Area.fightAragore = Area.addPossibleEvent(function () {
    mode = ModeEnum.final;
    currentBattle = new Battle("aragore", [new Aragore()]);
    topWriter.show("Aragore the dragon blocks the exit.");
});