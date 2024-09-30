//SplitMix32 PRNG

export class SeededRandom {
  seed: number;
  state: number;

  constructor(seed?: number) {
    this.seed = seed ?? SeededRandom.generateRandomSeed();
    this.state = this.seed;
  }

  get() {
    var a = (this.state |= 0);
    this.state = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  }

  static generateRandomSeed() {
    return (Math.random() * 2 ** 32) >>> 0;
  }
}
