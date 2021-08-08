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
