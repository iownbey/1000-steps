class Battle {
  /** @type {Menu} */
  #menu;
  #ended = false;

  /** @type {Battle} */
  static #current;

  /** @type {Ground} */
  static #ground;

  constructor(music, monsters, dynamicIntro = true) {
    DialogueTypewriter.clearAll();
    SaveData.blockSaving = true;
    mode = ModeEnum.fighting;
    if (!(monsters instanceof Array)) monsters = [monsters];
    this.monsters = monsters;
    this.currentMonster = null;
    if (!Battle.#ground) {
      Battle.#ground = new Ground("#env-wrapper");
      Battle.#ground.setDisplay("images/floors/battle.png", "#0000");
      Battle.#ground.hide();
    }

    this.#battleStart(music, dynamicIntro);
  }

  static get current() {
    return Battle.#current;
  }

  static get damagestr() {
    return "{$d}";
  }

  /** @returns {Battle}*/
  static start(music, monsters, dynamicIntro = true) {
    return (Battle.#current = new Battle(music, monsters, dynamicIntro));
  }

  generateBattleMenu() {
    var _this = this;
    var u_stun = file.getFlag("unlocked-stun");
    var u_run = file.getFlag("unlocked-run");
    var u_charge = file.getFlag("unlocked-charge");
    var u_inspect = file.getFlag("unlocked-inspect");

    var f_attack = async () => {
      await _this.#getMonsterPicker(
        _this.#menu,
        async (mon) => await player.attack(mon)
      );
    };

    var f_defend = () => player.defend();

    var f_heal = async () => await player.heal();

    var f_charge = async () => await player.charge();

    var f_stun = async () => {
      await _this.#getMonsterPicker(
        _this.#menu,
        async (mon) => await player.stun(mon)
      );
    };
    var f_talk = async () => {
      await _this.#getMonsterPicker(
        _this.#menu,
        async (mon) => await player.talk(mon)
      );
    };
    var f_run = async () => {
      await player.runAway(_this.monsters);
    };
    var f_inspect = async () => {
      await _this.#getMonsterPicker(
        _this.#menu,
        async (mon) => await player.inspect(mon)
      );
    };

    var lCalls = [f_attack, f_defend, f_heal];

    var lNames = ["ATTACK", "DEFEND", "HEAL"];

    var rCalls = [];

    var rNames = [];

    var otherActions = [];

    if (u_stun) {
      otherActions.push({ callback: f_stun, name: "STUN" });
    }

    otherActions.push({ callback: f_talk, name: "TALK" });

    otherActions.push({
      callback: f_inspect,
      name: u_inspect ? "INSPECT" : "DESCRIBE",
    });

    if (otherActions.length > 0) {
      if (otherActions.length == 1) {
        rNames.push(otherActions[0].name);
        rCalls.push(otherActions[0].callback);
      } else {
        var others = otherActions.slice(0);
        var subcallbacks = [[], []];
        var subnames = [[], []];
        var i = 0;

        otherActions.forEach(() => {
          var x = Math.floor(i / 3);
          var o = others.shift();
          subcallbacks[x].push(o.callback);
          subnames[x].push(o.name);
          i++;
        });

        var f_other = function () {
          var otherMenu = getGameMenu(subcallbacks, subnames, hcursor);
          //console.log("Opened Other: " + otherMenu);
          _this.#menu.subMenu = otherMenu;
        };

        rNames.push("OTHER");
        rCalls.push(f_other);
      }
    }

    if (u_charge && player.chargeAmount < 3) {
      rNames.push("CHARGE");
      rCalls.push(f_charge);
    }

    if (u_run) {
      rNames.push("RUN");
      rCalls.push(f_run);
    }

    var callbacks = [lCalls, rCalls];
    var names = [lNames, rNames];

    this.#menu = getGameMenu(callbacks, names, hcursor);
    this.#menu.hideOnInput = true;
    this.#menu.oninput = () => {
      _this.#finishPlayerTurn();
    };
  }

  async #getMonsterPicker(menu, callback) {
    if (this.monsters.length > 1) {
      var buttons = [];
      var names = [];
      this.monsters.forEach(function (element) {
        buttons.push([
          new MenuButton(element.jobj, async () => await callback(element)),
        ]);
        names.push(element.myName);
      });
      var m = new Menu(buttons, vcursor);
      menu.subMenu = m;
      m.onPosChanged = function (pos) {
        topWriter.show(names[pos.x]);
      };
      m.hideButtons = false;
      console.log(m);
    } else {
      await callback(this.monsters[0]);
    }
  }

  async #battleStart(music, dynamicIntro) {
    cover.color = "white";
    await cover.fadeTo(1, 600);

    Battle.#ground.show();
    ground.hide();
    contentManager.clear();
    this.monsters.forEach(function (element) {
      var box = $('<div class="monster"></div>');
      contentManager.add(box);
      element.html(box);
    });
    contentManager.approach(dynamicIntro);
    sound.playMusic(music, false);
    triggerBattleBackground();

    await cover.fadeTo(0, 600);

    if (this.monsters.length == 1) {
      topWriter.show(this.monsters[0].myName + " stands in the way!");
    } else {
      var index = this.monsters.length == 2 ? 0 : 1;
      topWriter.show(
        this.monsters[index].myName + " and his friends block the path."
      );
    }

    this.charAnim = new CSSAnimationController(
      player.$jobj,
      "battlePose"
    ).start();

    await InputHandler.waitForInput();
    this.#startPlayerTurn();
  }

  #startPlayerTurn() {
    console.log("BATTLE: Player turn started.");
    DialogueTypewriter.clearAll();
    player.defending = false;
    Player.sprites.setSprite(player.$jobj, 1, 1);
    this.generateBattleMenu();
    this.#menu.setDisplay(true);
  }

  async #finishPlayerTurn() {
    console.log("BATTLE: Finishing player's turn.");

    if (this.#checkWin()) {
      this.#end();
    } else {
      if (player.wounded) {
        topWriter.show('The enemy team used "IMPRISON"');
        await InputHandler.waitForInput();
        await player.die();
        topWriter.show("You were banished to an alternate world...");
        await InputHandler.waitForInput();
        triggerDefaultBackground();
        mode = ModeEnum.dead;
        file.forceSet("unlocked-run", true);
        sound.playMusic("gameover");
        setCurrentScope($("#gameover"));
      } else {
        console.log("BATTLE: Starting Monster turns.");
        this.monsterTurns(0);
      }
    }
  }

  async monsterTurns() {
    var i = 0;
    while (i < this.monsters.length) {
      var monstersBefore = this.monsters;
      var thisMonster = this.monsters[i];
      this.currentMonster = thisMonster;

      await this.monsterTurn(thisMonster);

      if (this.#checkWin()) {
        this.#end();
      } else {
        var newIndex = this.monsters.indexOf(thisMonster);
        if (newIndex === -1) {
          var found = false;
          for (var mi = 0; mi < this.monsters.length; mi++) {
            if (this.monsters[mi] != monstersBefore[mi]) {
              i = mi;
              found = true;
              break;
            }
          }

          if (!found) break;
        } else {
          i = newIndex + 1;
        }
      }
    }

    if (!this.#ended) this.#startPlayerTurn();
  }

  async monsterTurn(monster) {
    console.log("BATTLE: Starting Monster Turn");
    DialogueTypewriter.clearAll();

    var attack = await monster.attack();
    if (monster.dieAtEndOfTurn) {
      this.killMonster(monster);
    } else {
      var damage = attack.damage || 0;
      if (player.defending) {
        damage = Math.round(damage * 0.5);
      }

      if (attack.text)
        topWriter.show(attack.text.replace(Battle.damagestr, damage));

      await this.dealPlayerDamage(damage);
    }

    await InputHandler.waitForInput();
  }

  async dealPlayerDamage(damage) {
    if (player.changeHealth(-damage)) {
      topWriter.show(this.currentMonster.myName + " has mortally wounded you!");
      await InputHandler.waitForInput();
    }
  }

  #checkWin() {
    var finished = true;
    if (this.monsters.length > 0) {
      this.monsters.forEach(function (element) {
        if (element.important) finished = false;
      });
    }
    return finished;
  }

  handleInput(event) {
    this.#menu?.handleInput(event);
  }

  killMonster(monster) {
    this.monsters = this.monsters.remove(monster);
    monster.remove();
  }

  async #end() {
    if (Battle.current.monsters.length > 0) {
      topWriter.show("Everyone else was unimportant.");
      this.monsters.forEach((element) => element.remove());
      await InputHandler.waitForInput();
    }

    this.onfinish?.();
    this.endNow();
  }

  endNow() {
    SaveData.blockSaving = false;
    this.charAnim.end();
    this.#ended = true;
    mode = ModeEnum.walking;
    Battle.#ground.hide();
    ground.show();
    Battle.#current = null;
    player.defending = false;
    playBackgroundMusic();
    triggerDefaultBackground();
  }

  then(res) {
    this.onfinish = res;
  }
}
