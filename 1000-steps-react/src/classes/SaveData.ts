import { PopInProps } from "../components/general/PopIn/PopIn";

export type LocalStorageSaveData = {
  saveData: SaveData;
  time?: number;
};

export type SaveData = Partial<{
  bool: boolean;
  quickLoad: boolean;
}>;

type BooleanKeys<T> = keyof {
  [t in keyof T as T[t] extends boolean ? t : never]: T[t];
};

class SaveDataHandler {
  popin?: PopInProps;
  saveData: SaveData;
  beforeSave?: () => {};

  constructor() {
    this.saveData = this.#getFromLocalStorage().saveData;
  }

  static blockSaving = false;

  #showNotification(message: string) {
    if (this.popin) {
      this.popin.text = message;
    }
  }

  get<T extends keyof SaveData>(key: T, defaultValue?: SaveData[T]) {
    const value = this.saveData[key];
    if (value !== undefined) return value;
    else {
      this.set(key, defaultValue);
      return defaultValue;
    }
  }

  getFlag<T extends BooleanKeys<SaveData>>(key: T) {
    return this.get(key, false);
  }

  set<T extends keyof SaveData>(key: T, value: SaveData[T]) {
    this.saveData[key] = value;
  }

  setFlag<T extends BooleanKeys<SaveData>>(key: T) {
    this.set(key, true);
  }

  #getFromLocalStorage() {
    return (JSON.parse(localStorage.saveData || null) || {
      saveData: {},
    }) as LocalStorageSaveData;
  }

  forceSet<T extends keyof SaveData>(key: T, value: SaveData[T]) {
    var save = this.#getFromLocalStorage();
    save.saveData[key] = value;
    localStorage.saveData = JSON.stringify(save);
  }

  quickLoad() {
    console.log("Quick Load Activated.");
    this.forceSet("quickLoad", true);
    location.reload();
  }

  checkQuickLoad() {
    const isQuickLoad = this.get("quickLoad", false);
    this.forceSet("quickLoad", false);
    if (isQuickLoad) this.#showNotification("Game Loaded.");
    return isQuickLoad;
  }

  save() {
    if (SaveDataHandler.blockSaving) {
      this.#showNotification("You are not allowed to save right now, sorry.");
      return;
    }
    this.beforeSave();
    this.forceSave();
    this.#showNotification("Game Saved.");
  }

  forceSave() {
    const saveData = {
      saveData: this.saveData,
      time: new Date().getTime(),
    } as LocalStorageSaveData;
    localStorage.saveData = JSON.stringify(saveData);
    console.log("Saved.");
  }
}

export const saveHandler = new SaveDataHandler();
