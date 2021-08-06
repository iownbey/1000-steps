class TimingFunctions {
    static easeInOut(t) {
        return t * t * (3.0 - (2.0 * t));
    }

    static convertToFlip(t) {
        return 2 * t - 1;
    }

    static semicircle(t) {
        t = TimingFunctions.convertToFlip(t);
        return Math.sqrt(t * t);
    }

    static linear(t) {
        return t;
    }

    static inverseLinear(t) {
        return 1 - t;
    }
}

class TimingIndicator {
    #canvas;
    #ctx;
    #renderFlag;
    #d;
    #timestamp;
    #onstop;

    static current;

    constructor(canvas) {
        console.log("Init timing");
        TimingIndicator.current = this;
        this.radius = 30;
        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");
        this.renderers = [];
        this.#renderFlag = true;
        this.#d = $(document);
        this.#onstop = () => { };
        this.origin = new Vector2D(this.#canvas.width / 2, this.#canvas.height / 2);

        this.start();
    }

    getPromise() {
        var _this = this;
        return new Promise((resolve) => {
            _this.#onstop = resolve;
        });
    }

    start() {
        this.#renderFlag = true;
        var _this = this;
        this.#timestamp = performance.now();
        requestAnimationFrame((t) => { _this.#renderLoop(t); });

        this.#d.on("keydown.timingIndicator", (e) => { _this.press(e); });
        this.#d.on("mouseup.timingIndicator", (e) => { _this.press(e); });
    }

    stop() {
        console.log("stopping");
        this.#renderFlag = false;
        this.#d.off(".timingIndicator");
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#onstop();
    }

    #render(context) {
        var center = this.getOrigin();
        context.beginPath();
        context.arc(center.x, center.y, this.radius, 0, 2 * Math.PI, false);
        context.lineWidth = 2;
        context.strokeStyle = '#ffffff';
        context.stroke();
    }

    #renderLoop(timestamp) {
        var delta = (timestamp - this.#timestamp) / 1000;
        this.#timestamp = timestamp;
        //Update
        if (this.renderers.length > 0) {
            //check and update canvas size
            var width = window.innerWidth;
            var height = window.innerHeight;
            if (this.#canvas.width != width || this.#canvas.height != height) {
                this.#canvas.width = width;
                this.#canvas.height = height;
                //recalculate center
                this.origin = new Vector2D(width / 2, height / 2);
            }
            //clear for drawing
            this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            //Darken background
            this.#ctx.fillStyle = "#00000055";
            this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height)

            //update points
            for (let renderer of this.renderers) {
                var center = this.origin;
                var distSqr = ((renderer.x - center.x) ** 2) + ((renderer.y - center.y) ** 2);
                //update collisions
                if ((((this.radius) + renderer.radius) ** 2) < distSqr) {
                    //too far away
                    if (renderer.contacting === true) {
                        renderer.contacting = false;
                        renderer.onexit();
                    }
                }
                else {
                    if (renderer.contacting === false) {
                        renderer.contacting = true;
                        renderer.onenter();
                    }
                }
                this.#ctx.globalAlpha = 1;
                renderer.update(delta, this.#ctx);
            }
            this.#ctx.globalAlpha = 1;
            this.#render(this.#ctx);
        }
        else {
            //stop automatically when the canvas is empty
            this.stop();
        }

        if (this.#renderFlag) {
            var _this = this;
            requestAnimationFrame((t) => { _this.#renderLoop(t); });
        }
    }

    press(e) {
        //abort if there are no timing points
        if (this.renderers.length == 0) return;

        //validate input
        if (!(e.key === " " || e.type === "mouseup")) return;

        //Check for collisions

        //the closest TimingPoint
        var closest = null;
        //It's distance, squared
        var closestSqrDist = (this.radius ** 4);
        var center = this.getOrigin();
        for (let renderer of this.renderers) {
            //Only block hits that are strong if the player is defending
            if ((renderer.timeAlive > renderer.delayTime) && renderer.state === 0 && (!renderer.isStrong || player.defending)) {
                var distSqr = ((renderer.x - center.x) ** 2) + ((renderer.y - center.y) ** 2);
                if (distSqr < closestSqrDist) {
                    closest = renderer;
                    closestSqrDist = distSqr;
                }
            }
        }

        if (closest) {
            if (closest.contacting === false) {
                if (!closest.isLure)
                {
                //too far away
                closest.state = -1;
                closest.onfail();
                sound.playPersistant(errorBlip);
                }
            }
            else {
                //in range!
                if (closest.isLure)
                {
                closest.state = -1;
                closest.onfail();
                sound.playPersistant(errorBlip);
                }
                else
                {
                closest.state = 1;
                closest.onsuccess();
                sound.playPersistant(attackBlip);
                }
            }
        }
    }

    getOrigin() {
        return this.origin;
    }

    static MarkDone(point) {
        var i = TimingIndicator.current.renderers.indexOf(point);
        if (i > -1) {
            TimingIndicator.current.renderers.splice(i, 1);
        }
    }
}

class TimingPoint {
    constructor(x, y) {
        this.radius = 20;
        this.x = x;
        this.y = y;
        this.contacting = false;
        this.state = 0;
        this.isStrong = false;
        this.isLure = false;
        this.onsuccess = () => { };
        this.onfail = () => { };
    }

    update(timeDelta, ctx) {

    }

    strong() {
        this.isStrong = true;
        return this;
    }

    lure() {
        this.isLure = true;
        return this;
    }

    standardDraw(context, blend) {
        context.globalAlpha = 1 - TimingFunctions.semicircle(blend);

        if (this.isStrong && !player.defending)
            context.fillStyle = 'yellow';
        else switch (this.state) {
            case -1: context.fillStyle = '#FF000033'; break;
            case 0:
                {
                    context.fillStyle = (this.contacting) ? 'blue' : 'white';
                } break;
            case 1: context.fillStyle = '#00000000'; break;
            default: context.fillStyle = 'orange'; break;
        }

        
        if (this.isLure) {
            var cross = new Path2D(`M ${this.x} ${this.y} m 0 -6 l 12 -12 l 6 6 l -12 12 l 12 12 l -6 6 l -12 -12 l -12 12 l -6 -6 l 12 -12 l -12 -12 l 6 -6 z`);
            context.fill(cross);
        }
        else {
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            context.fill();
        }
    }

    onenter() {

    }

    onexit() {
        if (!this.isLure && this.state === 0) {
            sound.playPersistant(errorBlip);
            this.state = -1;
        }
    }
}

class EaseInOutPoint extends TimingPoint {
    constructor(offset, activeTime, delayTime = 0) {
        super(offset.x, offset.y);
        this.offset = offset;
        this.timeAlive = 0;
        this.lifetime = activeTime + delayTime;
        this.delayTime = delayTime;
    }

    update(timeDelta, context) {
        this.timeAlive += timeDelta;

        if (this.timeAlive > this.delayTime) {
            if (this.timeAlive < this.lifetime) {
                var blend = (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
                var pos = TimingIndicator.current.getOrigin().add(
                    this.offset.scale(
                        TimingFunctions.convertToFlip(blend)));
                this.x = pos.x;
                this.y = pos.y;
                this.standardDraw(context, blend);
            }
            else TimingIndicator.MarkDone(this);
        }
    }
}

class SpinPoint extends TimingPoint {
    constructor(offset, activeTime, delayTime = 0) {
        super(offset.x, offset.y);
        this.offset = offset;
        this.timeAlive = 0;
        this.lifetime = activeTime + delayTime;
        this.delayTime = delayTime;
    }

    update(timeDelta, context) {
        this.timeAlive += timeDelta;

        if (this.timeAlive > this.delayTime) {
            if (this.timeAlive < this.lifetime) {
                var blend = (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
                var spun = this.offset.rotate(blend * 2 * Math.PI);
                var pos = TimingIndicator.current.getOrigin().add(this.offset).add(spun);
                this.x = pos.x;
                this.y = pos.y;
                this.standardDraw(context, blend);
            }
            else TimingIndicator.MarkDone(this);
        }
    }
}

class ParametricPoint extends TimingPoint {
    /**
     * @typedef {(time: number) => number} easingFunction
     * @param {easingFunction} xfunc - Easing for x
     * @param {easingFunction} yfunc - Easing for y
     * @param {number} activeTime - Length of time the point will be active after the delay
     * @param {delayTime} delayTime - Length of time the point will be inactive after the TimingIndicator is activated
    */
    constructor(xfunc, yfunc, activeTime, delayTime = 0) {
        super(xfunc(0), yfunc(0));
        this.xfunc = xfunc;
        this.yfunc = yfunc;

        this.offset = offset;
        this.timeAlive = 0;
        this.lifetime = activeTime + delayTime;
        this.delayTime = delayTime;
    }

    update(timeDelta, context) {
        this.timeAlive += timeDelta;

        if (this.timeAlive > this.delayTime) {
            if (this.timeAlive < this.lifetime) {
                var blend = (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
                var pos = TimingIndicator.current.getOrigin().add(
                    new Vector2D(
                        this.xfunc(blend),
                        this.yfunc(blend)
                    ));
                this.x = pos.x;
                this.y = pos.y;
                this.standardDraw(context, blend);
            }
            else TimingIndicator.MarkDone(this);
        }
    }
}

class SinePoint extends TimingPoint {
    /**
     * @param {Vector2D} offset - offset from the center that the point will start at
     * @param {number} phase - sinusoidal wave offset
     * @param {number} amplitude - sinusoidal wave amplitude
     * @param {number} period - sinusoidal wave period
     * @param {number} activeTime - Length of time the point will be active after the delay
     * @param {delayTime} delayTime - Length of time the point will be inactive after the TimingIndicator is activated
    */
    constructor(offset,phase,amplitude,period,activeTime,delayTime = 0)
    {
        super(offset.x,offset.y);
        this.period = period;
        this.amplitude = amplitude;
        this.phase = phase;
        this.offset = offset;
        this.offsetN = offset.normalize().getNormal();
        this.timeAlive = 0;
        this.lifetime = activeTime + delayTime;
        this.delayTime = delayTime;
    }

    update(timeDelta, context) {
        this.timeAlive += timeDelta;

        if (this.timeAlive > this.delayTime) {
            if (this.timeAlive < this.lifetime) {
                var blend = (this.timeAlive - this.delayTime) / (this.lifetime - this.delayTime);
                var movement = TimingFunctions.convertToFlip(TimingFunctions.easeInOut(blend));
                var pos = TimingIndicator.current.getOrigin().add(
                    this.offset.scale(
                        movement
                    )).add(
                        this.offsetN.scale(this.amplitude * Math.sin((movement + this.phase) * ((2 * Math.PI) / this.period)))
                    );
                this.x = pos.x;
                this.y = pos.y;
                this.standardDraw(context, blend);
            }
            else TimingIndicator.MarkDone(this);
        }
    }
}