class DialogueTypewriter {
  static instances = [];

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

  async showAsync(text) {
    this.show({ text });
    await InputHandler.waitForInput();
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
    await Helper.delaySeconds(1);
  }

  async recede(animate = true) {
    this.resetContentAnim();
    if (animate) this.$jobj.addClass("receding");
    else this.$jobj.addClass("there");
    await Helper.delaySeconds(1);
  }

  async approachFromLeft(animate = true) {
    this.resetContentAnim();
    this.$jobj.addClass("here");
    if (animate) this.$jobj.addClass("fromLeft");
    await Helper.delaySeconds(1);
  }

  async recedeToLeft(animate = true) {
    this.resetContentAnim();
    this.$jobj.addClass("here");
    if (animate) this.$jobj.addClass("toLeft");
    else this.$jobj.addClass("left");
    await Helper.delaySeconds(1);
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

class Ground {
  static advancePercent = 3;

  constructor(anchor) {
    this.ground = $("<div class='area-ground'></div>");

    this.path = $("<div class='area-path'></div>");

    this.path.appendTo(this.ground);
    this.ground.appendTo(anchor);
    this.pathOffset = 0;

    this.props = [];
  }

  resetWalk() {
    this.path.css("background-position-y", "0%");
  }

  walk() {
    this.pathOffset += Ground.advancePercent;
    this.path.css("background-position-y", this.pathOffset + "%");
    for (const p of this.props) {
      p.y += this.pathOffset;
    }
  }

  dispose() {
    this.path.remove();
  }

  setDisplay(imageUrl, backColor) {
    this.ground.css("background-color", backColor);
    this.path.css("background-image", `url('${imageUrl}')`);
  }

  hide() {
    this.ground.css("display", "none");
  }

  show() {
    this.ground.css("display", "");
  }

  addPropOnHorizon(imageUrl, width, height) {
    let x = Math.random();
    let isRight = x > 0.5;
    x *= 70;
    if (isRight) x += 30;
    this.addProp(imageUrl, x, 0, width, height);
  }

  addProp(imageUrl, x, y, width, height) {
    this.props.push(new Prop(this.ground, imageUrl, x, y, width, height));
  }

  emptyProps() {
    for (let p in this.props) {
      p.jobj.remove();
    }
    this.props = [];
  }
}

class HealthDisplay {
  constructor(popin) {
    this.popin = popin;
  }

  update(newValue, newMax) {
    this.popin.show(5000);
    this.popin.$jobj.html("HP<br/>" + newValue + "/" + newMax);
  }

  flashRed() {
    CSSAnimationController.trigger(this.popin.$jobj, "flashRed");
  }
}

class InfoWindow {
  constructor($inner) {
    this.$jobj = $inner;
  }

  setToItemContent(item, name, description) {
    this.$jobj
      .children()
      .html(
        `<canvas style="height:20%; aspect-ratio: 1;"></canvas><h2>${name}</h2><hr style="width: 100%"><p style="line-height:1.5;text-align: justify;">${description}</p>`
      );

    var c = this.$jobj.find("canvas");
    var itemRenderer = new CanvasSpriteRenderer(
      c[0],
      "images/props/item-column-items.png",
      32,
      32
    );
    itemRenderer.onload = () => {
      itemRenderer.setSprite(item, 0);
    };
  }

  async show() {
    this.$jobj.css("width", "100%");
    await Helper.delaySeconds(2);
  }

  async hide() {
    this.$jobj.css("width", "0%");
    await Helper.delaySeconds(2);
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
      _this.cursor.update(buttons[0][0].jobj);
    });
    this.blockInput = false;
    this.hideOnInput = false;
    this.inputHandler = null;
    this.posChangedHandler = null;
    this.onactivated = null;
    this.subMenued = false;
    this.updateClickListeners();
  }

  /** @arg {function} value */
  set oninput(value) {
    this.inputHandler = value;
  }

  /** @arg {function} value */
  set onPosChanged(value) {
    this.posChangedHandler = value;
  }

  async pressButton(button) {
    if (this.hideOnInput) this.setDisplay(false);
    await button.activate();
    await this.afterButton();
  }

  async afterButton() {
    console.log("afterbutton");
    if (!this.subMenued) {
      this.removeClickListeners();
      await this.onMenuTreeComplete();
    } else {
      this.subMenued = false;
    }
  }

  updateClickListeners() {
    var _this = this;
    this.buttons.forEach((column) => {
      column.forEach((element) => {
        element.jobj.off(".menu-click");
        element.jobj.on(
          "mouseup.menu-click",
          async () => await _this.pressButton(element)
        );
        element.jobj.on("mouseenter.menu-click", () =>
          _this.cursor.update(element.jobj)
        );
      });
    });
  }

  removeClickListeners() {
    this.buttons.forEach((column) =>
      column.forEach((button) => button.jobj.off(".menu-click"))
    );
  }

  reset() {
    this.pos = { x: 0, y: 0 };
    this.cursor.update(this.buttons[0][0].jobj);
  }

  async onMenuTreeComplete() {
    await this.inputHandler?.(this.pos);

    if (this.parent != null) {
      this.setDisplay(false);
      this.parent.child = null;
      this.parent.subMenued = false;
      await this.parent.onMenuTreeComplete();
    }
  }

  returnControl() {
    this.subMenued = false;
    this.updateClickListeners();
    this.child.setDisplay(false);
    this.child = null;
    this.setDisplay(true);
    this?.onactivated(this);
  }

  async handleInput(event) {
    if (this.child == null) {
      if (!this.blockInput) {
        if (event.key == " ") {
          await this.pressButton(this.buttons[this.pos.x][this.pos.y]);
        } else if (event.key == "Backspace") {
          this.parent?.returnControl();
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
          this.posChangedHandler?.(this.pos);
          var b = this.buttons[this.pos.x][this.pos.y].jobj;
          this.cursor.update(b);
        }
      }
    } else await this.child.handleInput(event);
  }

  setDisplay(show) {
    this.blockInput = !show;
    var v = show ? "initial" : "none";
    if (this.hideButtons) {
      this.buttons.forEach(function (element) {
        element.forEach(function (element) {
          element.jobj.css("display", v);
        });
      });
    }
    if (this.subMenued) this.child.setDisplay(show);
    this.cursor.setDisplay(show);
  }

  /** @arg {Menu} value */
  set subMenu(value) {
    this.child = value;
    value.parent = this;
    value.hideOnInput = this.hideOnInput;
    value.updateClickListeners();
    this.setDisplay(false);
    value.setDisplay(true);
    this.subMenued = true;
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

  async writeOnceAsync() {
    this.write();
    await InputHandler.waitForInput();
  }

  async writeAllAsync() {
    this.break = false;
    while (!(this.complete || this.break)) {
      await this.writeOnceAsync();
    }
  }
}

// These classes have static dependencies on other classes, so they are last.

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

  /**The amount heal is reduced per turn if stale.*/
  static get healStaleTurnBias() {
    return 3;
  }
  /**The amount of a unstale, uncharged heal */
  static get healStartValue() {
    return 10;
  }
  /**The amount heal value can drift to make values less predictable*/
  static get healRandomDrift() {
    return 5;
  }

  static #sprites = new SpriteSheet("images/character.png", 4, 8);
  static get sprites() {
    return Player.#sprites;
  }
  static get attackAnim() {
    return [
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3, time: 100 },
      { x: 1, y: 2 },
    ];
  }

  static get rallyAnim() {
    return [
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
    ];
  }

  static unlockEverything() {
    file.setFlag("unlocked-stun");
    file.setFlag("unlocked-run");
    file.setFlag("unlocked-charge");
    file.setFlag("unlocked-inspect");
    file.setFlag("unlocked-moving-block");
  }

  static get idleBattleAnim() {
    return [
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ];
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
      CSSAnimationController.trigger(player.$jobj, "shake");
    }
    this.wounded = wounded;
    return wounded;
  }

  async charge() {
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
    this.chargeAmount++;
    sound.playFX("charge" + this.chargeAmount);

    cover.color = "white";
    await cover.fadeTo(1, 125);
    onFlash();
    await cover.fadeTo(0, 125);
    onFinish();
    await InputHandler.waitForInput();

    this.lastCalled = this.charge;
  }

  async costCharge(cost = 3) {
    if (this.chargeAmount > 0) {
      this.chargeAmount -= cost;
      if (this.chargeAmount < 0) this.chargeAmount = 0;
      await cover.fadeTo(1, 25);
      switch (this.chargeAmount) {
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
      await cover.fadeTo(0, 125);
    }
  }

  async attack(monster) {
    this.lastCalled = this.attack;

    const damage = this.attackPower * 3 ** this.chargeAmount;
    var phrase = `You hit ${monster.myName} and deal ${damage} damage.`;

    Player.sprites.animate(this.$jobj, Player.attackAnim, 25);
    await Helper.delayMillis(175);

    if (await monster.hit(damage)) {
      sound.playFX("deathfx");
      phrase += nl + `You killed ${monster.myName}.`;
      Battle.current.killMonster(monster);
    } else {
      sound.playFX("attack");
    }

    this.costCharge();

    CSSAnimationController.trigger(monster.jobj, "shake");
    await Helper.delayMillis(500);
    topWriter.show(phrase);
    await InputHandler.waitForInput();

    Player.sprites.setSprite(this.$jobj, 1, 1);
  }

  async runAway(monsters) {
    this.lastCalled = this.runAway;
    topWriter.show("You run...");
    contentManager.recede();
    await InputHandler.waitForInput();
    contentManager.approach();

    var total = monsters.length;
    var ranfrom = 0;
    var ranfromName = monsters[0].myName;
    monsters.forEach(function (monster) {
      if (monster.run()) {
        ranfrom++;
        Battle.current.killMonster(monster);
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
    await InputHandler.waitForInput();
  }

  async handleMonsterActionResult(actionResult) {
    if (typeof actionResult == "string") {
      await topWriter.showAsync(actionResult);
    } else if (Array.isArray(actionResult))
      await new Writer(topWriter, actionResult).writeAllAsync();
    else await actionResult;
  }

  async talk(monster) {
    this.lastCalled = this.talk;
    await topWriter.showAsync(
      `You attempt to communicate with ${monster.myName}.`
    );
    await this.handleMonsterActionResult(monster.talk());
  }

  async inspect(monster) {
    this.lastCalled = this.inspect;
    var unlockedInspect = file.getFlag("unlocked-inspect");
    var inspectIntro = file.getFlag("inspect-intro-displayed");

    if (unlockedInspect && !inspectIntro) {
      await new Writer(bottomWriter, text.other.aboutInspect).writeAllAsync();
      file.setFlag("inspect-intro-displayed");
    }

    this.handleMonsterActionResult(monster.inspect(unlockedInspect));
  }

  async heal() {
    if (this.lastCalled == this.heal) {
      this.healOffset--;
    } else {
      this.healOffset = 0;
    }
    this.lastCalled = this.heal;

    var amount =
      (this.healOffset * Player.healStaleTurnBias +
        Player.healStartValue +
        Math.randomInt(0, Player.healRandomDrift)) *
      (this.chargeAmount + 1);
    if (amount < 0) amount = 0;

    await this.costCharge();

    if (amount == 0) {
      topWriter.show(
        "You have exhausted your healing power. Do something else!"
      );
    } else {
      cover.color = "green";
      Player.sprites.animate(this.$jobj, Player.attackAnim, 100);
      await cover.fadeTo(1, 500);
      this.changeHealth(amount);
      await cover.fadeTo(0, 500);
      topWriter.show(`You healed for ${amount} health.`);
    }

    await InputHandler.waitForInput();
  }

  async stun(monster) {
    this.lastCalled = this.stun;
    cover.color = "white";
    sound.playFX("magic");
    await cover.fadeTo(1, 250);
    await cover.fadeTo(0, 250);
    await this.handleMonsterActionResult(monster.magic());
  }

  async defend() {
    if (this.lastCalled == this.defend) {
      topWriter.show("You could not brace again.");
      return;
    }
    this.lastCalled = this.chargeAmount ? this.charge : this.defend;
    if (this.chargeAmount > 0) {
      topWriter.show("You brace for the next attack.|You can brace again!");
    } else {
      topWriter.show("You brace for the next attack.");
    }

    this.defending = true;
    Player.sprites.setSprite(this.$jobj, 4, 2);

    await this.costCharge(1);
  }

  async die() {
    sound.stop(false);
    Player.sprites.setSprite(player.$jobj, 3, 2);
    sound.playFX("die");
    await Helper.delayMillis(600);
    sound.playFX("deathFX");
    this.$jobj.fadeOut(500);
  }
}
