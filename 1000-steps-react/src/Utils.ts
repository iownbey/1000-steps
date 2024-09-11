export const randomInt = function (min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

export const getPercentage = function (numerator: number, dividend: number) {
  return ((numerator - 1) / (dividend - 1) || 0) * 100;
};

export function getRandom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export function imageURL(name: string) {
  return "images/" + name + ".png";
}

export async function delaySeconds(seconds: number) {
  await this.delayMillis(seconds * 1000.0);
}

export async function delayMillis(millis: number) {
  await new Promise((resolve) => setTimeout(resolve, millis));
}

export function shuffle<T>(array: T[]) {
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
}

export function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
      );
    });
  }
}
