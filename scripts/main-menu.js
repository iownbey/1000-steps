var MainMenu = {};

MainMenu.startNewGame = async function () {
  console.log("starting game.");
  cover.color = "black";
  sound.playFX("game-start-effect");
  await cover.fadeTo(1, 6000);
  startIntro();
  await cover.fadeTo(0, 1000);
};

MainMenu.continueGame = async function () {
  console.log("loading game.");
  cover.color = "black";
  await cover.fadeTo(1, 2000);
  await loadGame();
  await cover.fadeTo(0, 2000);
};

MainMenu.settings = function () {
  //settings menu
};

MainMenu.setUpButton = function ($button, $up = null, $down = null) {
  $button.attr("tabindex", 0);

  var onkey = (e) => {
    switch (e.key) {
      case "Enter":
        {
          $button.click();
          $button.addClass("activated");
        }
        break;
      case "w":
      case "ArrowUp":
        {
          if ($up != null) $up.focus();
        }
        break;
      case "s":
      case "ArrowDown":
        {
          if ($down != null) $down.focus();
        }
        break;
    }
  };

  $button.focus(() => {
    MainMenu.selected++;
    $button.keydown(onkey);
  });

  $button.focusout(() => {
    MainMenu.selected--;
    $button.off("keydown", onkey);
  });
};

var startNewGameButton = $("#main-new-game");
var continueGameButton = $("#main-continue");
var settingsButton = $("#main-settings");

startNewGameButton.click(MainMenu.startNewGame);
continueGameButton.click(MainMenu.continueGame);
settingsButton.click(MainMenu.settings);

MainMenu.setUpButton(continueGameButton, null, startNewGameButton);
MainMenu.setUpButton(startNewGameButton, continueGameButton, settingsButton);
MainMenu.setUpButton(settingsButton, startNewGameButton, continueGameButton);

MainMenu.selected = 0;

$(document).ready(() => {
  document.addEventListener("keydown", () => {
    if (MainMenu.selected == 0) startNewGameButton.focus();
  });
});
