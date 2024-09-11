export class CSSAnimationController {
  constructor(jobj, anim) {
    this.jobj = jobj;
    this.anim = anim;
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
    return new CSSAnimationController(jobj, anim).trigger();
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
