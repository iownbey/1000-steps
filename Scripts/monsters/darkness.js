class Darkness extends Monster {
    constructor() {
        super("THE DARKNESS", 1000, 0, 0);
    }

    async attack() {

        var points = [];
        var pointQuantity = 5;
        var delay = 0;
        for (let i = 0; i < pointQuantity; i++) {

            delay += 0.4 + (Math.random() * 0.4);
            points.push(getPoint(delay));
        }

        this.shiverAnim.start();
        //this.renderer.setSprite(1, 0);

        var interaction = new TimingIndicator(document.getElementById("content-canvas"));
        interaction.renderers = points.slice(0);
        await interaction.getPromise();

        //this.renderer.setSprite(0, 0);
        this.shiverAnim.end();

        if (points.some((p) => { return (p.state === -1) })) {
            this.shakeAnim.trigger();
            return { damage: 20, text: "The DARKNESS hurts you deep inside.|You took {$d} damage." };
        }
        else {
            return { damage: 0, text: "Virtue protected your heart" };
        }

        function getPoint(delay) {
            var lifetime = 3;
            const xmag = 400 * Math.sign(Math.random() - 0.5);
            return new ParametricPoint(
                t => //x
                {
                    t = TimingFunctions.convertToFlip(t);
                    return ((-4 * (t ** 2)) + (4 * Math.abs(t))) * xmag
                },
                t => //y
                {
                    t = TimingFunctions.convertToFlip(t);
                    return (t < 0) ? TimingFunctions.linear(t) * 200 : 0
                },
                lifetime, delay);
        }
    }

    html(root) {
        var $content = $('<canvas style="height:150%;width:150%;left:-25%;position=absolute;" id="darkness"></canvas>');
        this.jobj = $content;
        this.canvas = $content[0];
        $content.appendTo(root);

        this.renderer = new SpriteRenderer($content[0], "./Images/darkness.png", 64, 64);

        var _this = this;
        this.renderer.onload = () => {
            _this.renderer.setSprite(0, 0);
        };

        this.renderHandle = requestAnimationFrame(renderLoop);
        function renderLoop(ml) {
            const seconds = ml / 1000;
            const rate = 1 / 3;
            const amplitude = 5;
            var x = seconds * (2 * Math.PI * rate);
            var y = Math.sin(x);
            var yprime = Math.cos(x);

            //animate Y position
            $content.css("bottom", (y * amplitude) + "%");

            if (y > 0.9 || y < -0.9) {
                _this.renderer.setSprite(0, 0);
            }
            else {
                if (yprime < 0) {
                    _this.renderer.setSprite(1, 0);
                }
                else {
                    _this.renderer.setSprite(1, 1);
                }
            }
            _this.renderHandle = requestAnimationFrame(renderLoop);
        }

        this.shakeAnim = new CSSAnimation($content, "shake");
        this.shiverAnim = new CSSAnimation($content, "shiver");
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