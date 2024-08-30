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

MainMenu.$objects = $(document);

MainMenu.removeEventListeners = () => {
  MainMenu.$objects.off(".mainmenu");
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
  document.addEventListener("keydown.mainmenu", () => {
    if (MainMenu.selected == 0) startNewGameButton.focus();
  });
});
