/**
 * A whitelist for the code that allows generics in monster creation.
 * This list should contain every monster involved in random encounters
 */
const allMonsters = Object.freeze(["Troll", "Sponge", "IntrovertedGhost", "Door", "Decoy", "Skeleton", "Reaper", "Troldier"]);

/**
 * The base class for areas.
 */
class Area {
    constructor(flavor, monsters, battleTheme = "fight") {
        this.stepsTaken = 0;
        this.flavor = new SequenceGetter(flavor);
        this.battleTheme = battleTheme;
        this.events = this.getEvents();
        this.currentEvent = null;
        this.monsters = this.toInts(monsters);
        this.busy = false;
        console.log(this.monsters);
    }

    /**
     * A map from an area constructor to its events
     * @type {Map<function,function[]>}
     */
    static possibleEvents = new Map();
    /**
     * The constructor of the currently building event list
     */
    static boundArea;

    static registerArea(type) {
        //Area.possibleEvents.set(Area.boundArea = type,[]);
    }

    static registerEvent(element) {
        //return Area.possibleEvents.get(Area.boundArea).push(element) - 1;
        return element;
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
        // Generic instantiation via eval
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
            //var r = Area.possibleEvents.get(_this.constructor)[event]();
            var r = event();
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

// Switches the static event handler so that it is binding events to the correct Area.
Area.registerArea(Area);

Area.getBackgroundChangeEvent = function (flavor, back, fore = null) {
    return Area.registerEvent(function () {
        topWriter.show(flavor);
        changeBackground(back);
        changeForeground(fore);
    });
}

Area.emptyStep = Area.registerEvent(function () {
    // Do Nothing
});

Area.fightEvent = Area.registerEvent(function () {
    currentBattle = new Battle(area.battleTheme, [area.getRandomMonster(), area.getRandomMonster(), area.getRandomMonster()]);
});

Area.flavorEvent = Area.registerEvent(function () {
    topWriter.show(area.flavor.get());
});
Area.nextAreaEvent = Area.registerEvent(function () {
    this.onEnd();
    area = this.getNextArea();
    sound.playMusic(area.getBackgroundMusic());
    area.onStart();
});

// Prototype Events

Area.fightChain = Area.registerEvent(function () {
    var input = { oninput: () => { } };
    currentDoer = Doer.ofPromise(async function () {
        DialogueTypewriter.clearAll();
        contentManager.clear();
        var $wrapper = $('<div class="monster"></div>');
        var $virgil = $('<canvas style="height:180%;width:180%;left:-40%;" id="chain"></canvas>');
        $virgil.appendTo($wrapper);
        contentManager.add($wrapper);

        var renderer = new SpriteRenderer($virgil[0], "./images/chain.png", 64, 64);
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

Area.fightAragore = Area.registerEvent(function () {
    mode = ModeEnum.final;
    currentBattle = new Battle("aragore", [new Aragore()]);
    topWriter.show("Aragore the dragon blocks the exit.");
});