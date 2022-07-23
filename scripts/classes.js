class Animator {
  constructor($jobj, spriteSheet) {
    this.$jobj = $jobj;
    this.sprites = spriteSheet;
    this.animating = false;
  }

  animate(frames, defaultTime) {
    this.animating = true;
    var _this = this;
    var loop = function (i) {
      var frame = frames[i];
      _this.sprites.setSprite(_this.$jobj, frame.x, frame.y);
      var time = defaultTime;
      if (frame.time != undefined) time = frame.time;
      i++;
      if (i != frames.length) {
        setTimeout(loop, time, i);
      } else {
        setTimeout(function () {
          _this.animating = false;
        }, time);
      }
    };
    loop(0);
  }
}

class Queue {
  constructor() {
    this.events = [];
    this.empty = true;
  }

  push(element) {
    this.events.unshift(element);
    this.empty = false;
  }

  peek() {
    return this.events[this.events.length - 1];
  }

  replace(element) {
    this.events[this.events.length - 1] = element;
  }

  pop() {
    var e = this.events.pop();
    this.empty = this.events.length == 0;
    return e;
  }

  priorityPush(element) {
    this.events.push(element);
    this.empty = false;
  }
}

class Battle {
  constructor(music, monsters, dynamicIntro = true) {
    console.log("------------------------------------");
    console.log("BATTLE: Battle started.");
    SaveData.blockSaving = true;
    this.monsters = monsters;
    this.currentMonster = null;
    mode = ModeEnum.fighting;
    DialogueTypewriter.clearAll();
    var _this = this;
    cover.flash(
      "white",
      () => {
        contentManager.clear();

        monsters.forEach(function (element) {
          var box = $('<div class="monster"></div>');
          contentManager.add(box);
          element.html(box);
        });

        contentManager.approach(dynamicIntro);
        //start the music without crossfade
        sound.playMusic(music, false);
        backgroundCanvas.triggerBattle();
      },
      () => {
        if (_this.monsters.length == 1) {
          topWriter.show(_this.monsters[0].myName + " stands in the way!");
        } else {
          var index = _this.monsters.length == 2 ? 0 : 1;
          topWriter.show(
            this.monsters[index].myName + " and his friends block the path."
          );
        }

        _this.charAnim = new CSSAnimation(player.$jobj, "battlePose").start();
        _this.eventQueue = new Queue();
        _this.queueAction(() => _this.startPlayerTurn());
      },
      1250
    );
  }

  queueAction(action) {
    console.log("QUEUE : Queueing Action.");
    this.eventQueue.push(action);
  }

  changeAction(action) {
    console.log("QUEUE : Changing Action.");
    this.eventQueue.replace(action);
  }

  finishAction() {
    console.log("QUEUE : Finishing Action.");
    this.eventQueue.pop();
  }

  startPlayerTurn() {
    console.log("BATTLE: Player turn started.");
    this.finishAction();
    DialogueTypewriter.clearAll();
    this.menu = this.getMenu();
    player.defending = false;
    Player.sprites.setSprite(player.$jobj, 1, 1);
    this.menu.setDisplay(true);
  }

  finishPlayerTurn() {
    console.log("BATTLE: Finishing player's turn.");
    var _this = this;

    if (player.lastCalled != player.charge) {
      if (player.chargeAmount > 0) {
        player.chargeAmount = 0;
        cover.flash("white", null, null, 250);
      }
    }
    switch (player.chargeAmount) {
      case 0:
        sparkHandler.hideAll();
        break;
      case 1:
        sparkHandler.showSpark();
        break;
      case 2:
        sparkHandler.showFlame();
        break;
      case 3:
        sparkHandler.showAura();
        break;
    }

    this.menu.setDisplay(false);
    this.queueAction(function () {
      if (_this.checkFinished()) {
        _this.finishAction();
        _this.end();
      } else {
        if (player.wounded) {
          topWriter.show('The enemy team used "IMPRISON"');
          _this.changeAction(function () {
            player.die();
            topWriter.show("You were banished to an alternate world...");
            _this.changeAction(function () {
              mode = ModeEnum.dead;
              file.forceSet("Unlocked_Run", true);
              sound.playMusic("gameover");
              setCurrentScope($("#gameover"));
              _this.finishAction();
            });
          });
        } else {
          console.log("BATTLE: Starting Monster turns.");
          _this.monsterTurn(0);
        }
      }
    });
  }

  dealPlayerDamage(damage) {
    if (player.changeHealth(-damage)) {
      var _this = this;
      this.queueAction(function () {
        topWriter.show(
          _this.currentMonster.myName + " has mortally wounded you!"
        );
        _this.finishAction();
      });
    }
  }

  async monsterTurn(index) {
    console.log("BATTLE: Starting Monster " + index + " Turn");
    DialogueTypewriter.clearAll();
    var _this = Battle.current;
    _this.finishAction();
    var monster = (this.currentMonster = this.monsters[index]);
    var attack = await monster.attack();
    if (monster.dieAtEndOfTurn) {
      index--;
      this.monsters = this.monsters.remove(monster);
      monster.jobj.remove();
    } else {
      var damage = attack.damage || 0;
      if (player.defending) {
        damage = Math.round(damage * 0.5);
      }

      if (attack.text)
        topWriter.show(attack.text.replace(Battle.damagestr, damage));

      this.dealPlayerDamage(damage);
    }

    index++;
    if (!_this.checkFinished()) {
      if (index == _this.monsters.length) {
        console.log("BATTLE: Queuing player start.");
        _this.queueAction(() => _this.startPlayerTurn());
      } else {
        _this.queueAction(function () {
          _this.monsterTurn(index);
        });
      }
    } else {
      _this.end();
    }
  }

  checkFinished() {
    var _this = Battle.current;
    var finished = true;
    if (_this.monsters.length > 0) {
      _this.monsters.forEach(function (element) {
        if (element.important) finished = false;
      });
    }
    return finished;
  }

  handleInput(event) {
    console.log("------------------------------------");
    console.log(
      "QUEUE : queue " +
        (this.eventQueue.empty
          ? "is empty."
          : "has " + this.eventQueue.events.length + " elements.")
    );
    if (!this.eventQueue.empty) {
      console.log("BATTLE: sending input to queue.");
      this.handleQueue();
    } else {
      console.log("BATTLE: sending input to menu.");
      this.menu.handleInput(event);
    }
  }

  handleQueue() {
    console.log("QUEUE : Starting Action.");
    topWriter.clear();
    this.eventQueue.peek()();
  }

  recede() {
    contentManager.recede();
  }

  approach() {
    contentManager.approach();
  }

  getMonsterPicker(menu, callback) {
    if (this.monsters.length > 1) {
      var buttons = [];
      var names = [];
      this.monsters.forEach(function (element) {
        buttons.push([
          new MenuButton(element.jobj, function () {
            callback(element);
          }),
        ]);
        names.push(element.myName);
      });
      var m = menu.subMenu(new Menu(buttons, vcursor));
      m.onPosChanged(function (pos) {
        topWriter.show(names[pos.x]);
      });
      m.hideButtons = false;
      console.log(m);
    } else {
      callback(this.monsters[0]);
    }
  }

  getMenu() {
    var _this = this;
    var u_magic = true || file.get("Unlocked_Magic", false);
    var u_run = true || file.get("Unlocked_Run", false);
    var u_charge = true || file.get("Unlocked_Charge", false);

    var lCalls = [
      function () {
        _this.getMonsterPicker(_this.menu, (mon) => player.attack(mon));
      },
      () => player.defend(),
      () => player.heal(),
    ];

    var lNames = ["ATTACK", "DEFEND", "HEAL"];

    var rCalls = [];

    var rNames = [];

    var menu = this.menu;

    var f_cast = function () {
      _this.getMonsterPicker(menu, (mon) => player.magics(mon));
    };
    var f_talk = function () {
      _this.getMonsterPicker(menu, (mon) => player.talk(mon));
    };
    var f_run = function () {
      player.runAway(_this.monsters);
    };
    var f_inspect = function () {
      _this.getMonsterPicker(menu, (mon) => player.inspect(mon));
    };

    var otherActions = [];

    if (u_magic) otherActions.push({ callback: f_cast, name: "CAST" });
    otherActions.push({ callback: f_talk, name: "TALK" });
    otherActions.push({ callback: f_inspect, name: "INSPECT" });

    if (otherActions.length == 1) {
      rNames.push(otherActions[0].name);
      rCalls.push(otherActions[0].callback);
    } else if (otherActions.length > 1) {
      var others = otherActions.slice(0);
      var subcallbacks = [[], []];
      var subnames = [[], []];
      var i = 0;

      otherActions.forEach(function (element) {
        var x = Math.floor(i / 3);
        var o = others.shift();
        subcallbacks[x].push(o.callback);
        subnames[x].push(o.name);
        i++;
      });

      var f_other = function () {
        var otherMenu = getGameMenu(subcallbacks, subnames, hcursor);
        //console.log("Opened Other: " + otherMenu);
        menu = _this.menu.subMenu(otherMenu);
      };

      rNames.push("OTHER");
      rCalls.push(f_other);
    }

    if (u_charge && player.chargeAmount < 3) {
      rNames.push("CHARGE");
      rCalls.push(() => player.charge());
    }

    if (u_run) {
      rNames.push("RUN");
      rCalls.push(f_run);
    }

    var callbacks = [lCalls, rCalls];
    var names = [lNames, rNames];

    var returnMenu = getGameMenu(callbacks, names, hcursor);
    returnMenu.oninput(function () {
      _this.finishPlayerTurn(_this);
    });
    return returnMenu;
  }

  kill(monster) {
    this.monsters = this.monsters.remove(monster);
    monster.remove();
  }

  end() {
    var _this = this;
    var finishEnd = function () {
      _this.finishAction();
      SaveData.blockSaving = false;
      _this.charAnim.end();
      mode = ModeEnum.walking;
      Battle.current = null;
      player.defending = false;
      playBackgroundMusic();
      if (_this.onfinish) _this.onfinish();
      _this.finishAction();
      backgroundCanvas.triggerDefault();
    };

    if (Battle.current.monsters.length > 0) {
      this.eventQueue.priorityPush(finishEnd);
      this.eventQueue.priorityPush(function () {
        topWriter.show("Everyone else was unimportant.");
        _this.monsters.forEach(function (element) {
          element.remove();
        });
        _this.finishAction();
      });
    } else {
      finishEnd();
    }
  }

  endNow() {
    SaveData.blockSaving = false;
    this.charAnim.end();
    mode = ModeEnum.walking;
    Battle.current = null;
    player.defending = false;
    playBackgroundMusic();
    backgroundCanvas.triggerDefault();
  }

  getPromise() {
    var _this = this;
    return new Promise((r) => {
      _this.onfinish = r;
    });
  }
}
/** @type {Battle} */
Battle.current = null;
Battle.damagestr = "{$d}";

class SpriteRenderer {
  constructor(canvas, src, w, h) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    canvas.width = this.w = w;
    canvas.height = this.h = h;

    this.sprites = new Image(0, 0);
    this.sprites.src = src;
  }

  set onload(value) {
    this.sprites.onload = value;
  }

  get onload() {
    return this.sprites.onload;
  }

  waitForLoad() {
    return new Promise((resolve) => {
      this.sprites.onload = resolve;
    });
  }

  setSprite(x, y) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.sprites,
      x * this.w,
      y * this.h,
      this.w,
      this.h,
      0,
      0,
      this.w,
      this.h
    );
  }

  setRandomSprite(positions) {
    if (positions) {
      var pos = getRandom(positions);
      this.setSprite(pos.x, pos.y);
    } else {
      this.setSprite(
        Math.randomInt(1, this.wn + 1),
        Math.randomInt(1, this.hn + 1)
      );
    }
  }

  animate(frames, defaultTime, loopAnim = false) {
    var _this = this;
    var loop = function (i) {
      var frame = frames[i];
      _this.setSprite(frame.x, frame.y);

      var time = defaultTime;
      if (frame.time != undefined) time = frame.time;
      i++;
      if (i != frames.length) {
        setTimeout(loop, time, i);
      } else if (loopAnim) {
        setTimeout(loop, time, 0);
      }
    };
    loop(0);
  }
}

class ContentManager {
  constructor($jobj) {
    this.$jobj = $jobj;
  }

  add($new) {
    this.$jobj.append($new);
  }

  clear() {
    this.$jobj.empty();
  }

  resetContentAnim() {
    this.$jobj.removeClass(
      "there receding here approaching left fromLeft toLeft"
    );
    var j = this.$jobj[0].offsetHeight;
  }

  async approach(animate = true) {
    this.resetContentAnim();
    if (animate) this.$jobj.addClass("approaching");
    else this.$jobj.addClass("here");
    await Helper.delay(1);
  }

  async recede(animate = true) {
    this.resetContentAnim();
    if (animate) this.$jobj.addClass("receding");
    else this.$jobj.addClass("there");
    await Helper.delay(1);
  }

  async approachFromLeft(animate = true) {
    this.resetContentAnim();
    this.$jobj.addClass("here");
    if (animate) this.$jobj.addClass("fromLeft");
    await Helper.delay(1);
  }

  async recedeToLeft(animate = true) {
    this.resetContentAnim();
    this.$jobj.addClass("here");
    if (animate) this.$jobj.addClass("toLeft");
    else this.$jobj.addClass("left");
    await Helper.delay(1);
  }
}

class CSSAnimation {
  constructor(jobj, anim, otherAnims) {
    this.jobj = jobj;
    this.anim = anim;
    this.otherAnims = otherAnims;
    this.endListener = null;
  }

  start() {
    const _this = this;
    this.jobj.removeClass(this.anim);
    {
      let x = this.jobj[0].offsetHeight;
    }
    this.jobj.addClass(this.anim);
    this.removeListener();
    this.jobj.on(
      "animationend",
      (this.endListener = function () {
        _this.start(_this.jobj, _this.anim);
      })
    );
    return this;
  }

  removeListener() {
    if (this.endListener != null)
      this.jobj.off("animationend", this.endListener);
  }

  end(atLoop = false) {
    var _this = this;
    this.removeListener();
    var stop = function () {
      _this.jobj.removeClass(_this.anim);
    };
    if (!atLoop) stop();
    else this.jobj.on("animationend", (this.endListener = stop));
    return this;
  }

  static trigger(jobj, anim) {
    return new CSSAnimation(jobj, anim).trigger();
  }

  trigger() {
    const _this = this;
    this.jobj.removeClass(this.anim);
    {
      let x = this.jobj[0].offsetHeight;
    }
    this.jobj.addClass(this.anim);
    this.jobj.on("animationend", function () {
      _this.jobj.removeClass(_this.anim);
    });
    return this;
  }
}

class Cursor {
  constructor(jqueryobj, offset) {
    this.offX = offset.x;
    this.offY = offset.y;
    this.cursor = jqueryobj;
    var _this = this;
    $(window).resize(function () {
      _this.update(_this.lastAnchor);
    });
  }

  update(anchor) {
    this.lastAnchor = anchor;
    if (anchor != null) {
      var offset = anchor.offset();
      this.cursor.offset({
        top: offset.top + this.offY,
        left: offset.left + this.offX,
      });
    }
  }

  setDisplay(show) {
    this.cursor.css("display", show ? "initial" : "none");
  }
}

class DelayedFunction {
  constructor(callback, delay) {
    var _this = this;
    this.callback = callback;
    this.complete = false;
    this.delay = delay;
    this.timeoutID = setTimeout(function () {
      _this.complete = true;
      callback();
    }, delay);
  }

  happen() {
    this.callback();
    clearTimeout(this.timeoutID);
  }

  dontHappen() {
    clearTimeout(this.timeoutID);
  }
}

class DialogueTypewriter {
  constructor(typewriter, $root, face, speechSound = null, normalSound = null) {
    this.typewriter = typewriter;
    this.$root = $root;
    this.face = face;
    this.lastExpr;
    this.speechSound = speechSound;
    this.normalSound = normalSound;

    face.hide();
    DialogueTypewriter.instances.push(this);
  }

  show(text, expression) {
    //console.log("Showing: " + text);
    DialogueTypewriter.clearAll();
    this.$root.css("display", "flex");
    var t;
    if (typeof text == "string") {
      this.typewriter.setSound(this.normalSound);
      t = text;
      if (arguments.length > 1) {
        //console.log("static expression");
        this.typewriter.letterCallback = function () {};
        this.face.showExpression(expression);
      } else {
        //console.log("no expression");
      }
    } else if (Array.isArray(text)) {
      //console.log("animated expression");
      var _this = this;
      var expr = text[1];
      this.typewriter.letterCallback = function () {
        _this.face.showAnimatedExpression(_this.lastExpr);
      };

      t = text[0];

      if (text.length == 1) this.typewriter.setSound(this.speechSound);

      if (text.length > 1) {
        this.lastExpr = expr;
      }

      if (text.length == 2) {
        this.typewriter.letterCallback = function () {
          _this.face.showAnimatedExpression(_this.lastExpr);
        };
        this.typewriter.setSound(this.speechSound);
      }

      if (text.length > 2) {
        if (text[2] === true) {
          this.typewriter.letterCallback = function () {
            _this.face.showAnimatedExpression(_this.lastExpr);
          };
          this.typewriter.setSound(this.speechSound);
        } else {
          expr = null;
          this.typewriter.letterCallback = function () {};
          this.face.showExpression(text[1]);
        }
      }
    } else {
      var _this = this;

      t = text.text;

      if (text.sExpr) {
        _this.lastExpr = text.sExpr;
        this.face.showExpression(text.sExpr);
      } else {
        if (text.aExpr || text.aExpr === 0) {
          this.typewriter.setSound(this.speechSound);
          this.typewriter.letterCallback = function () {
            _this.face.showAnimatedExpression(_this.lastExpr);
          };
          if (text.aExpr !== true) {
            _this.lastExpr = text.aExpr;
          }
        }
      }

      if (text.sFX) {
        sound.playFX(text.sFX);
        this.typewriter.setSound(null);
      }
    }
    this.typewriter.show(t);
  }

  static clearAll() {
    DialogueTypewriter.instances.forEach(function (element) {
      element.clear();
    });
  }

  clear() {
    this.$root.css("display", "none");
    this.typewriter.letterCallback = function () {};
    this.typewriter.setSound(null);
    this.typewriter.clear();
    this.face.hide();
  }
}
DialogueTypewriter.instances = [];

class Doer {
  constructor(
    things //thing = {action: function (){},time: milliseconds,condition:if this evaluates to false then the action will be repeated,waitForInput: whether or not the next action requires a call to do()}
  ) {
    this.things = things.splice(0); //make shallow copy.
    this.happening = null;
    this.currentThing = null;
    this.complete = false;
  }

  do() {
    if (this.complete) return;

    if (this.happening != null) {
      if (this.happening.complete) {
        this.happening = null;
      } else return;
    }

    var thing;
    if (
      this.currentThing != null &&
      this.currentThing.condition != null &&
      !this.currentThing.condition()
    ) {
      thing = this.currentThing;
    } else {
      if (this.things.length == 0) {
        this.complete = true;
        return;
      } else {
        var thing = (this.currentThing = this.things.shift());
      }
    }

    if (thing.action != undefined) thing.action();

    if (thing.time != undefined) {
      let callback;
      if (thing.waitForInput == false) {
        let _this = this;
        callback = function () {
          _this.do();
        };
      } else {
        callback = function () {};
      }

      this.happening = new DelayedFunction(callback, thing.time);
    } else {
      if (thing.waitForInput == false) {
        this.do();
      }
    }
  }

  getThing() {
    var _this = this;
    return {
      action: function () {
        _this.do();
      },
      condition: function () {
        return _this.complete;
      },
    };
  }

  asPromise() {
    return new Promise((resolve) => {
      this.things.push({ action: () => resolve(), waitForInput: false });
    });
  }

  //first parameter is the promise to wrap. second parameter is an object with a property named oninput of type action
  static ofPromise(promise, input) {
    var done = false;
    promise.then(() => {
      done = true;
    });
    return new Doer([
      {
        action: function () {
          input.oninput();
        },
        condition: function () {
          return done;
        },
      },
    ]);
  }
}

class FaceHandler {
  constructor() {
    this.expressions = [];
    this.animator = null;
    this.$jobj = null;
  }

  init($jobj, faces) {
    this.faces = faces;
    this.$jobj = $jobj;
    this.animator = new Animator($jobj, faces);
  }

  registerExpression(x, y, cssClass = null) {
    return this.expressions.push({ x, y, cssClass }) - 1;
  }

  getExpression(index) {
    return this.expressions[index];
  }

  showExpression(index) {
    this.$jobj.css("display", "inline-block");
    var expr = this.getExpression(index);
    this.faces.setSprite(this.$jobj, expr.x, expr.y);
    this.$jobj.removeClass();
    if (expr.cssClass) this.$jobj.addClass(expr.cssClass);
  }

  showAnimatedExpression(expression) {
    this.$jobj.css("display", "inline-block");
    if (!this.animator.animating) {
      var expr = this.getExpression(expression);
      var x = expr.x;
      var y = expr.y;
      var frames = [
        { x: x + 1, y },
        { x, y },
      ];
      this.$jobj.removeClass();
      if (expr.cssClass) this.$jobj.addClass(expr.cssClass);
      this.animator.animate(frames, 75);
    }
  }

  hide() {
    this.$jobj.css("display", "none");
  }
}

class GrabBag {
  constructor(items) {
    this.empty = false;
    var itemsToMove = items.splice(0);
    this.itemsInBag = [];

    while (itemsToMove.length > 1) {
      var i = Math.floor(Math.random() * itemsToMove.length);
      var item = itemsToMove[i];
      itemsToMove.splice(i, 1); //splice changes type to object
      this.itemsInBag.push(item);
    }
    this.itemsInBag.push(itemsToMove[0]);
  }

  pull() {
    return this.itemsInBag.pop();
  }

  getThing(applicator) {
    var _this = this;
    return {
      action: function () {
        var t = _this.pull();
        applicator(t);
      },
      condition: function () {
        return _this.empty;
      },
    };
  }
}
GrabBag.shuffle = function (array) {
  var itemsToMove = array.splice(0);
  var shuffledItems = [];

  while (itemsToMove.length > 1) {
    var i = Math.floor(Math.random() * itemsToMove.length);
    var item = itemsToMove[i];
    itemsToMove.splice(i, 1);
    shuffledItems.push(item);
  }
  shuffledItems.push(itemsToMove[0]);
  return shuffledItems;
};

class HealthDisplay {
  constructor(popin) {
    this.popin = popin;
  }

  update(newValue, newMax) {
    this.popin.show(5000);
    this.popin.$jobj.html("HP<br/>" + newValue + "/" + newMax);
  }

  flashRed() {
    CSSAnimation.trigger(this.popin.$jobj, "flashRed");
  }
}

class Helper {
  static imageURL(name) {
    return "images/" + name + ".png";
  }

  static async delay(seconds) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000.0));
  }
}

class InputHandler {
  constructor(handler) {
    this.oninput = handler;

    var doc = $(document);
    var _this = this;
    doc.on(
      "keydown",
      (_this.kbind = (e) => {
        if (!e.shiftKey) _this.onkeydown(e);
      })
    );
    doc.on(
      "mouseup",
      (_this.mbind = (e) => {
        _this.onmouse(e);
      })
    );
  }

  onmouse(event) {
    switch (event.which) {
      case 1:
        {
          event.key = "Left Mouse Button";
          this.oninput(event);
        }
        break;
      case 2:
        {
          event.key = "Middle Mouse Button";
          this.oninput(event);
        }
        break;
      case 3:
        {
          event.key = "Right Mouse Button";
          this.oninput(event);
        }
        break;
    }
  }

  onkeydown(event) {
    //blacklist certain keys
    if (
      event.ctrlKey ||
      event.altKey ||
      event.key == "AudioVolumeUp" ||
      event.key == "AudioVolumeDown" ||
      event.key == "AudioVolumeMute"
    )
      return;
    this.oninput(event);
  }

  dispose() {
    var _this = this;
    doc.off("keydown", _this.kbind);
    doc.off("mouseup", _this.mbind);
  }

  static waitForInput() {
    return new Promise((resolve) => {
      var i = new InputHandler((e) => {
        resolve(e);
        i.dispose();
      });
    });
  }
}

class NonrepeatingGetter {
  constructor(array) {
    this.array = array;
    this.last = null;
  }

  get() {
    if (this.array.length <= 2) console.error("Incompatible array");
    var value = undefined;
    do {
      value = this.array[Math.floor(Math.random() * this.array.length)];
    } while (value === this.last);
    this.last = value;
    return value;
  }
}

class Notifier {
  constructor(jobj = $("#notifier")) {
    this.jobj = jobj;
    this.jobj.css("opacity", "0");
  }

  show(message, duration = 3000) {
    var _this = this;
    this.jobj.text(message);
    this.jobj.animate({ opacity: 1 }, 250, "linear", function () {
      setTimeout(function () {
        _this.jobj.animate({ opacity: 0 }, 250, "linear");
      }, duration);
    });
  }
}

class Player {
  constructor($jobj, health, attack) {
    this.$jobj = $jobj;
    this.health = this.maxHealth = health;
    this.wounded = false;
    this.attackPower = attack;
    this.defending = false;

    this.chargeAmount = 0;

    this.healOffset = 0;
  }

  checkDamage(damage, alternative = "no") {
    return this.defending ? alternative : damage;
  }

  changeHealth(change) {
    this.health += change;
    var wounded = this.health <= 1;
    if (wounded) this.health = 1;
    else if (this.health > this.maxHealth) this.health = this.maxHealth;
    healthDisplay.update(this.health, this.maxHealth);
    if (change < 0) {
      healthDisplay.flashRed();
      CSSAnimation.trigger(player.$jobj, "shake");
    }
    this.wounded = wounded;
    return wounded;
  }

  charge() {
    var onFlash;
    var onFinish;
    switch (this.chargeAmount) {
      case 0:
        {
          onFinish = function () {
            topWriter.show("You focus your light into a spark.");
          };
          onFlash = function () {
            sparkHandler.showSpark();
          };
        }
        break;
      case 1:
        {
          onFinish = function () {
            topWriter.show("You strengthen your spark into a flame.");
          };
          onFlash = function () {
            sparkHandler.showFlame();
          };
        }
        break;
      case 2:
        {
          onFinish = function () {
            topWriter.show("You fan the flame into a glorious light!");
          };
          onFlash = function () {
            sparkHandler.showAura();
          };
        }
        break;
    }
    console.log(this.chargeAmount);
    sound.playFX("charge" + (this.chargeAmount + 1));
    cover.flash("white", onFlash, onFinish, 250);
    this.chargeAmount++;
    this.lastCalled = this.charge;
  }

  async attack(monster) {
    var _this = this;
    this.lastCalled = this.attack;
    Player.sprites.animate(this.$jobj, Player.attackAnim, 25);
    CSSAnimation.trigger(monster.jobj, "shake");

    var damage = this.attackPower * 3 ** this.chargeAmount;
    const basephrase =
      "You hit " + monster.myName + " and deal " + damage + " damage.";

    if (await monster.hit(damage)) {
      sound.playFX("deathfx");
      var add = nl + "You killed " + monster.myName + ".";
      Battle.current.kill(monster);
      topWriter.show(basephrase + add);
    } else {
      sound.playFX("attack");
      topWriter.show(basephrase);
    }
  }

  runAway(monsters) {
    this.lastCalled = this.runAway;
    topWriter.show("You run...");
    Battle.current.recede();
    Battle.current.queueAction(function () {
      Battle.current.approach();

      var total = monsters.length;
      var ranfrom = 0;
      var ranfromName = monsters[0].myName;
      monsters.forEach(function (monster) {
        if (monster.run()) {
          ranfrom++;
          Battle.current.kill(monster);
          ranfromName = monster.myName;
        }
      });

      if (total == 1) {
        if (ranfrom == 1) {
          topWriter.show("You escape the clutches of " + ranfromName + ".");
        } else {
          topWriter.show("You couldn't get away from " + ranfromName + "!");
        }
      } else {
        if (ranfrom == 1) {
          topWriter.show("You only escaped " + ranfromName + "...");
        } else if (ranfrom == total) {
          topWriter.show("You escaped everybody!");
        } else if (ranfrom > 1) {
          topWriter.show("You escaped some of the monsters...");
        } else {
          topWriter.show("You couldn't get away from anybody!");
        }
      }

      Battle.current.finishAction();
    });
  }

  talk(monster) {
    this.lastCalled = this.talk;
    var response = monster.talk();
    topWriter.show("You attempt to communicate with " + monster.myName + ".");
    if (typeof response == "string") {
      Battle.current.queueAction(function () {
        topWriter.show(response);
        Battle.current.finishAction();
      });
    } else if (Array.isArray(response)) {
      var w = new Writer(topWriter, response);
      Battle.current.queueAction(function () {
        w.write();
        if (w.complete) Battle.current.finishAction();
      });
    } else {
      Battle.current.queueAction(function () {
        console.log("Doer doing");
        response.do();
        if (response.complete) Battle.current.finishAction();
      });
    }
  }

  inspect(monster) {
    this.lastCalled = this.inspect;
    level = file.get("Inspect-Level", 0);

    var w2 = new Writer(bottomWriter, monster.inspect());
    var doit2 = function () {
      w2.write();
      if (w2.complete) Battle.current.finishAction();
    };

    switch (level) {
      case 2:
      case 0:
        {
          Battle.current.queueAction(doit2);
        }
        break;

      case 1:
        {
          var w = new Writer(bottomWriter, text.other.aboutInspect);
          var doit = function () {
            w.write();
            if (w.complete) {
              file.set("Inspect-Level", 2);
              Battle.current.changeAction(doit2);
            }
          };
          Battle.current.queueAction(doit);
        }
        break;
    }
  }

  heal() {
    if (this.lastCalled == this.heal) {
      this.healOffset--;
    } else {
      this.healOffset = 0;
    }
    this.lastCalled = this.heal;

    var amount =
      (this.healOffset * Player.healStaleTurnBias +
        Player.healStartValue +
        Math.randomInt(0, randomBias)) *
      (this.chargeAmount + 1);
    if (amount < 0) amount = 0;
    this.changeHealth(amount);

    if (amount == 0) {
      topWriter.show(
        "You have exhausted your healing power. Do something else!"
      );
      return;
    } else {
      topWriter.show("You healed for " + amount + " health.");
      return;
    }
  }

  magics(monster) {
    this.lastCalled = this.magics;
    sound.playFX("magic");
    topWriter.show(monster.magic());
  }

  defend() {
    if (this.lastCalled == this.defend) {
      topWriter.show("You could not defend again.");
      return;
    }
    this.lastCalled = this.chargeAmount ? this.charge : this.defend;
    if (this.chargeAmount > 0) {
      this.chargeAmount--;
      topWriter.show("You brace for the next attack.|You can brace again!");
    } else {
      topWriter.show("You brace for the next attack.");
    }

    this.defending = true;
    Player.sprites.setSprite(this.$jobj, 2, 2);
  }

  die() {
    sound.stop(false);
    Player.sprites.setSprite(player.$jobj, 3, 2);
    sound.playFX("die");
    var _this = this;
    setTimeout(function () {
      sound.playFX("deathFX");
      _this.$jobj.fadeOut(500);
    }, 600);
  }
}
Player.healStaleTurnBias = 3; //the amount the move is reduced per turn if stale.
Player.healStartValue = 10; //the amount before turn bias is applied.
Player.healRandomDrift = 5; //the amount of "extra" health you can randomly get.

class PopIn {
  constructor($jobj) {
    this.$jobj = $jobj;
    this.$jobj.addClass("transition-position");
    this.$jobj.css("position", "absolute");
    this.activeAnchors = [];
  }

  // left, right, top, and bottom are accepted values
  addActiveAnchor(anchorDimension) {
    this.activeAnchors.push(anchorDimension);
    this.$jobj.css(anchorDimension, "-100%");
  }

  setAnchor(anchorDim, value) {
    this.$jobj.css(anchorDim, value);
  }

  show(time) {
    this.activeAnchors.forEach((a) => this.$jobj.css(a, "0"));
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.hide(), time);
  }

  hide() {
    this.activeAnchors.forEach((a) => this.$jobj.css(a, "-100%"));
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
  }
}

class SaveData {
  constructor(notifier = null) {
    this.notifier = notifier;
    this.obj = {};
    this.beforeSave = function () {};
    var oldSave = this.#getFromLocalStorage();
    this.obj = oldSave.obj;
  }

  #showNotification(message) {
    if (this.notifier != null) this.notifier.show(message);
  }

  get(key, defaultValue = undefined) {
    var something = this.obj[key];
    if (something !== undefined) return something;
    else {
      this.set(key, defaultValue);
      return defaultValue;
    }
  }

  set(key, value) {
    this.obj[key] = value;
  }

  #getFromLocalStorage() {
    return JSON.parse(localStorage.saveData || null) || { obj: {} };
  }

  forceSet(key, value) {
    var save = this.#getFromLocalStorage();
    save.obj[key] = value;
    localStorage.saveData = JSON.stringify(save);
  }

  quickLoad() {
    console.log("Quick Load Activated.");
    this.forceSet("quick-load", true);
    location.reload(false);
  }

  checkQuickLoad() {
    var isQuickLoad = this.get("quick-load", false);
    this.forceSet("quick-load", false);
    if (isQuickLoad) this.#showNotification("Game Loaded.");
    return isQuickLoad;
  }

  save() {
    if (SaveData.blockSaving) {
      this.#showNotification("You are not allowed to save right now, sorry.");
      return;
    }
    this.beforeSave();
    this.forceSave();
    this.#showNotification("Game Saved.");
  }

  forceSave() {
    var saveData = {};
    console.log("Saved.");
    saveData.obj = this.obj;
    var time = new Date().getTime();
    saveData.obj.time = time;
    localStorage.saveData = JSON.stringify(saveData);
  }
}
SaveData.blockSaving = false;

class ScreenCover {
  constructor(jqueryobj) {
    this.jqueryobj = jqueryobj;
  }

  /**
   * @param {string} value
   */
  set color(value) {
    this.jqueryobj.css("background-color", value);
  }

  flash(color, flashcallback = null, finishcallback = null, time = 500) {
    var _this = this;
    this.jqueryobj.css("background-color", color);
    this.jqueryobj.animate({ opacity: 1 }, time / 2, "linear", function () {
      if (flashcallback !== null) flashcallback();
      _this.jqueryobj.animate({ opacity: 0 }, time / 2, "linear", function () {
        if (finishcallback !== null) finishcallback();
      });
    });
  }

  async fadeTo(opacity, time) {
    var _this = this;
    return new Promise((resolve) => {
      _this.jqueryobj.animate(
        { opacity: opacity },
        time,
        "linear",
        function () {
          resolve();
        }
      );
    });
  }
}

class SequenceGetter {
  constructor(array, loop = false) {
    this.array = array;
    this.i = 0;
    this.loop = loop;
  }

  get() {
    var r = this.array[this.i];
    if (this.loop) {
      this.i = (this.i + 1) % this.array.length;
    } else if (this.i !== this.array.length - 1) this.i++;
    return r;
  }
}

class SoundManager {
  constructor() {
    this.persistants = [{}];
  }

  getFileName(song) {
    return "sounds/" + song;
  }

  playMusic(song, crossFade = true) {
    console.log("SOUND: Playing " + song);
    song = this.getFileName(song);

    var _this = this;
    var startSong = () => {
      //this.job = new buzz.sound(song).loop().play().fadeIn(500);
      _this.job = new Howl({
        src: [song + ".wav", song + ".mp3"],
        loop: true,
        volume: 0,
      });
      _this.job.play();
      if (crossFade) _this.job.fade(0, 1, 500);
      else _this.job.volume(1);
    };

    if (this.job != null) {
      if (crossFade) {
        var _job = this.job;
        //this.job.unloop().fadeWith(this.job = new buzz.sound(song).loop(), 500);
        this.job.fade(1, 0, 500);
        this.job.onfade = () => {
          _job.stop();
        };
        startSong();
      } else {
        this.job.stop();
        startSong();
      }
    } else startSong();
  }

  loadPersistant(song) {
    song = this.getFileName(song);
    var i =
      this.persistants.push(new Howl({ src: [song + ".wav", song + ".mp3"] })) -
      1;
    return i;
  }

  playPersistant(persistant, force = true) {
    var b = this.persistants[persistant];
    if (force || !b.playing()) b.stop().play();
  }

  stop(fade = true) {
    if (this.job) {
      this.job.loop = false;

      if (fade) {
        var j = this.job;
        j.fade(1, 0, 500);
        j.onfade = () => {
          j.stop();
        };
      } else this.job.stop();
      this.job = null;
    }
  }

  pause() {
    if (this.job) this.job.pause();
  }

  unpause() {
    if (this.job && !this.job.playing()) {
      let sk = this.job.seek();
      this.job.play();
      this.job.seek(sk);
    }
  }

  playFX(effect) {
    effect = this.getFileName(effect);
    new Howl({
      src: [effect + ".wav", effect + ".mp3"],
    }).play();
  }
}

class SparkHandler {
  constructor($spark, $flame, $aura) {
    this.$spark = $spark;
    this.$flame = $flame;
    SparkHandler.flameSprites.animate(
      $flame,
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
      500,
      true
    );
    this.$aura = $aura;
    this.sparkJob = null;
  }

  hideAll() {
    if (this.sparkJob) {
      clearTimeout(this.sparkJob);
      this.sparkJob = null;
    }
    this.$spark.css("display", "none");
    this.$flame.css("display", "none");
    this.$aura.css("display", "none");
  }

  showSpark() {
    var _this = this;
    var s = this.$spark;
    this.hideAll();
    s.css("display", "block");

    var lit = false;
    var flicker = function () {
      if (lit) {
        lit = false;
        SparkHandler.sparkSprites.setRandomSprite(s);
        _this.sparkJob = setTimeout(flicker, 50);
      } else {
        lit = true;
        SpriteSheet.setSprite(s, "images/sparkBase.png");
        _this.sparkJob = setTimeout(flicker, Math.randomInt(100, 500));
      }
    };
    flicker();
  }

  showFlame() {
    this.hideAll();
    this.$flame.css("display", "block");
  }

  showAura() {
    this.hideAll();
    this.$aura.css("display", "block");
  }
}

class SpriteSheet {
  constructor(image, wn, hn) {
    this.image = image;
    this.wn = wn;
    this.hn = hn;
  }

  getPercentage(numerator, dividend) {
    return ((numerator - 1) / (dividend - 1) || 0) * 100;
  }

  setSprite(jobj, x, y) {
    jobj.css("background-image", "url(" + this.image + ")");
    jobj.css("background-size", this.wn * 100 + "%");
    jobj.css(
      "background-position",
      "bottom " +
        Math.getPercentage(y, this.hn) +
        "% left " +
        Math.getPercentage(x, this.wn) +
        "%"
    );
  }

  setRandomSprite(jobj, positions) {
    if (positions) {
      var pos = getRandom(positions);
      this.setSprite(jobj, pos.x, pos.y);
    } else {
      this.setSprite(
        jobj,
        Math.randomInt(1, this.wn + 1),
        Math.randomInt(1, this.hn + 1)
      );
    }
  }

  animate(jobj, frames, defaultTime, loopAnim = false) {
    var _this = this;
    jobj.css("background-image", "url(" + this.image + ")");
    jobj.css("background-size", this.wn * 100 + "%");
    var loop = function (i) {
      var frame = frames[i];
      jobj.css(
        "background-position",
        "bottom " +
          Math.getPercentage(frame.y, _this.hn) +
          "% left " +
          Math.getPercentage(frame.x, _this.wn) +
          "%"
      );
      var time = defaultTime;
      if (frame.time != undefined) time = frame.time;
      i++;
      if (i != frames.length) {
        setTimeout(loop, time, i);
      } else if (loopAnim) {
        setTimeout(loop, time, 0);
      }
    };
    loop(0);
  }

  static setSprite(jobj, image, wn = 1, hn = 1, x = 1, y = 1) {
    jobj.css("background-image", "url(" + image + ")");
    jobj.css("background-size", wn * 100 + "%");
    jobj.css(
      "background-position",
      "bottom " +
        Math.getPercentage(y, hn) +
        "% left " +
        Math.getPercentage(x, wn) +
        "%"
    );
  }
}

class Typewriter {
  constructor(jqueryobj, speed, periodSpeed, timeout = false) {
    this.p = jqueryobj;
    this.speed = speed;
    this.job = null;
    this.targetText = "";
    this.timeout = timeout;
    this.textClass = "";
    this.letterSound = null;
    this.letterCallback = function () {};
  }

  setTextClass(cssClass) {
    this.textClass = cssClass;
    return this;
  }

  setSound(sound) {
    this.letterSound = sound;
    return this;
  }

  show(text) {
    this.targetText = text;
    if (this.job != null) {
      clearTimeout(this.job);
    }
    var _this = this;
    _this.p.css("visibility", "visible");
    let i = 0;
    var elements = "";

    // Create all elements first
    for (let i = 0; i < text.length; i++) {
      var nextChar = text.charAt(i);
      if (nextChar == nl) {
        elements += "<br>";
      } else {
        elements += "<span> </span>";
      }
    }
    _this.p.html(elements);

    var children = _this.p.children();

    var loop = function (text, i, length) {
      if (i < length) {
        var nextChar = text.charAt(i);
        if (nextChar == nl) {
          length += 3;
        } else {
          var child = children.eq(i);
          if (_this.textClass != "") {
            child.addClass(_this.textClass);
          }
          child.text(nextChar);

          if (_this.letterSound && nextChar.match(/[a-z]/i)) {
            sound.playPersistant(_this.letterSound);
          }
          _this.letterCallback(nextChar);
        }
        i++;
        _this.job = setTimeout(
          function () {
            loop(text, i, length);
          },
          nextChar == "." ? _this.speed : _this.periodSpeed
        );
      } else {
        if (_this.timeout === false) {
          _this.job = null;
        } else {
          _this.job = setTimeout(function () {
            _this.p.css("visibility", "hidden");
          }, _this.timeout);
        }
      }
    };
    loop(text, i, text.length);
    return this;
  }

  append(text) {
    var _this = this;
    this.p.html("");
    if (this.job != null) {
      clearTimeout(this.job);
      this.p.html(this.targetText);
      this.p.append("<br>");
    }
    this.p.css("display", "initial");
    var i = 0;

    var loop = function (text, i, length) {
      if (i < length) {
        var nextChar = text.charAt(i);
        if (nextChar == nl) {
          _this.p.append("<br>");
          length += 3;
        } else {
          _this.p.append(nextChar);
        }
        i++;
        _this.job = setTimeout(function () {
          loop(text, i, length);
        }, _this.speed);
      } else {
        _this.job = setTimeout(function () {
          _this.p.css("display", "none");
          _this.targetText = "";
        }, _this.timeout);
      }
    };
    loop(text, i, text.length);
  }

  clear() {
    if (this.job != null) {
      clearTimeout(this.job);
    }
    this.p.css("visibility", "hidden");
    this.targetText = "";
  }
}

class Menu {
  constructor(buttons, cursor, parent = null) {
    this.cursor = cursor;
    this.buttons = buttons;
    this.maxX = buttons.length - 1;
    this.pos = { x: 0, y: 0 };
    this.parent = parent;
    this.child = null;
    this.hideButtons = true;
    var _this = this;
    setTimeout(function () {
      _this.cursor.update(buttons[0][0].jobj());
    });
    this.blockInput = false;
    this.inputHandler = null;
    this.posChangedHandler = null;
    this.onactivated = null;
    this.subMenued = false;
    this.updateClickListeners();
  }

  oninput(event) {
    this.inputHandler = event;
  }

  onPosChanged(event) {
    this.posChangedHandler = event;
  }

  updateClickListeners() {
    var _this = this;
    this.buttons.forEach(function (column) {
      column.forEach(function (element) {
        element.jobj().off("mouseup");
        element.jobj().on("mouseup", function () {
          element.activate();
          _this.afterButton();
        });
        element.jobj().off("mouseenter");
        element.jobj().on("mouseenter", function () {
          _this.cursor.update(element.jobj());
        });
      });
    });
  }

  removeClickListeners() {
    this.buttons.forEach(function (column) {
      column.forEach(function (element) {
        element.jobj().off("mouseup");
        element.jobj().off("mouseenter");
      });
    });
  }

  reset() {
    this.pos = { x: 0, y: 0 };
    this.cursor.update(this.buttons[0][0].jobj());
  }

  onMenuTreeComplete() {
    if (this.inputHandler != null) {
      this.inputHandler(this.pos);
    }

    if (this.parent != null) {
      this.setDisplay(false);
      this.parent.child = null;
      this.parent.onMenuTreeComplete();
    }
  }

  returnControl() {
    this.subMenued = false;
    this.updateClickListeners();
    this.child.setDisplay(false);
    this.child = null;
    this.setDisplay(true);
    if (this.onactivated != null) this.onactivated(this);
  }

  afterButton() {
    if (!this.subMenued) {
      //console.log("MenuTree finished");
      this.removeClickListeners();
      this.onMenuTreeComplete();
    } else {
      //console.log("submenu opened");
      this.subMenued = false;
    }
  }

  async handleInput(event) {
    if (this.child == null) {
      if (!this.blockInput) {
        if (event.key == " ") {
          await this.buttons[this.pos.x][this.pos.y].activate();
          this.afterButton();
        } else if (event.key == "Backspace") {
          if (this.parent != null) {
            this.parent.returnControl();
          }
        } else {
          switch (event.key) {
            case "ArrowDown":
            case "s":
              {
                this.pos.y++;
                var maxY = this.buttons[this.pos.x].length - 1;
                if (this.pos.y > maxY) this.pos.y = maxY;
              }
              break;

            case "ArrowRight":
            case "d":
              {
                this.pos.x++;
                if (this.pos.x > this.maxX) this.pos.x = this.maxX;
                else if (this.pos.y > this.buttons[this.pos.x].length - 1)
                  this.pos.x--;
              }
              break;

            case "ArrowUp":
            case "w":
              {
                this.pos.y--;
                if (this.pos.y < 0) this.pos.y = 0;
              }
              break;

            case "ArrowLeft":
            case "a":
              {
                this.pos.x--;
                if (this.pos.x < 0) this.pos.x = 0;
              }
              break;
          }
          if (this.posChangedHandler) this.posChangedHandler(this.pos);
          var b = this.buttons[this.pos.x][this.pos.y].jobj();
          this.cursor.update(b);
        }
      }
    } else this.child.handleInput(event);
  }

  setDisplay(show) {
    this.blockInput = !show;
    var v = show ? "initial" : "none";
    if (this.hideButtons) {
      this.buttons.forEach(function (element) {
        element.forEach(function (element) {
          element.jobj().css("display", v);
        });
      });
    }
    this.cursor.setDisplay(show);
  }

  subMenu(sub) {
    this.child = sub;
    sub.parent = this;
    sub.updateClickListeners();
    this.setDisplay(false);
    sub.setDisplay(true);
    this.subMenued = true;
    return this.child;
  }
}

class MenuButton {
  constructor(jobj, callback) {
    this.$jobj = jobj;
    this.call = callback;
  }

  async activate() {
    var w = this.call();
    if (w != null) await w;
  }

  jobj() {
    return this.$jobj;
  }
}

class Vector2D {
  /**
   * Utility object for representing 2-Dimensional Vectors
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    /**
     * @type {number}
     * @public
     */
    this.x = x;
    /**
     * @type {number}
     * @public
     */
    this.y = y;
  }

  /** @param {Vector2D} addend*/
  add(addend) {
    return new Vector2D(this.x + addend.x, this.y + addend.y);
  }

  /** @param {number} scale*/
  scale(scale) {
    return new Vector2D(this.x * scale, this.y * scale);
  }

  /** @description return a vector with the opposite magnitude*/
  invert() {
    return new Vector2D(-this.x, -this.y);
  }

  /** @description comparing square magnitudes is faster*/
  sqrMagnitude() {
    return this.x ** 2 + this.y ** 2;
  }

  magnitude() {
    return Math.sqrt(this.sqrMagnitude());
  }

  /** @param {number} rot - A rotation in degrees*/
  rotate(rot) {
    var cos = Math.cos(rot),
      sin = Math.sin(rot);
    return new Vector2D(
      cos * this.x - sin * this.y,
      sin * this.x + cos * this.y
    );
  }

  /** @description return a vector with the same direction and a magnitude of one */
  normalize() {
    return this.scale(1 / this.magnitude());
  }

  /** @description return this vector's normal of the same magnitude */
  getNormal() {
    return new Vector2D(-this.y, this.x);
  }

  /** @description Shorthand for new Vector2D(0, 1) */
  static getNormalVector() {
    return new Vector2D(0, 1);
  }
}

class Writer {
  constructor(typewriter, messages) {
    this.typewriter = typewriter;
    this.messages = messages.splice(0); //make shallow copy.
    this.complete = this.messages.length == 0;
    this.break = this.complete;
  }

  /**
   * @param {function} value
   */
  set letterCallback(value) {
    this.typewriter.letterCallback = value;
  }

  write() {
    if (this.complete) return;
    this.break = false;

    let next = this.messages.shift();
    if (next === text.break) {
      this.break = true;
    } else if (typeof next === "function") {
      next();
    } else {
      this.typewriter.show(next);
      if (this.messages.length == 0) {
        this.complete = true;
      }
    }
  }

  clear() {
    this.typewriter.clear();
  }

  getThing() {
    var _this = this;
    return {
      action: function () {
        _this.write();
      },
      condition: function () {
        return _this.complete || _this.break;
      },
    };
  }

  getOnceThing() {
    var _this = this;
    return {
      action: function () {
        _this.write();
      },
    };
  }

  async writeAllAsync() {
    this.break = false;
    while (!(this.complete || this.break)) {
      this.write();
      //wait for input.
      await InputHandler.waitForInput();
    }
  }
}

//Static Variables:

SaveData.blockSaving = false;
SparkHandler.sparkSprites = new SpriteSheet("images/sparks.png", 2, 2);
SparkHandler.flameSprites = new SpriteSheet("images/flames.png", 2, 2);
Player.sprites = new SpriteSheet("images/character.png", 4, 8);
Player.attackAnim = [
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 3, time: 500 },
  { x: 1, y: 1 },
];
Player.idleBattleAnim = [
  { x: 1, y: 1 },
  { x: 1, y: 2 },
];
