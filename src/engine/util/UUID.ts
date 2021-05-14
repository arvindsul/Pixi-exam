/**
 * Internal utility class for Byte to Hex mappings for UUID v4
 */
class ByteHexMappings {
  byteToHex: string[] = [];
  hexToByte: { [hex: string]: number; } = {};
  
  constructor() {
    for (let i = 0; i < 256; ++i) {
      this.byteToHex[i] = (i + 0x100).toString(16).substr(1);
      this.hexToByte[this.byteToHex[i]] = i;
    }
  }
}

/**
 * Utility for creating v4 UUIDs
 */
export class UUID {
  /**
   * Hex mappings
   */
  private static byteHexMappings = new ByteHexMappings();

  /**
   * Get a new v4 UUID
   */
  public static get(): string {
    return UUID.uuidToString(UUID.getRandom());
  }

  /**
   * Create the random numbers from the standard math library.
   */
  private static getRandomFromMathRandom(): ArrayLike<number> {
    let result = new Array(16);

    let r = 0;
    for (let i = 0; i < 16; ++i) {
      if ((i & 0x03) === 0) {
        r = Math.random() * 0x100000000;
      }
      result[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    result[6] = (result[6] & 0x0f) | 0x40;
    result[8] = (result[8] & 0x3f) | 0x80;

    return result as ArrayLike<number>;
  }

  /**
   * Create the random numbers from the browser crypto library.
   */
  private static getRandom(): ArrayLike<number> {
    const browserCrypto = window.crypto || (<any>window).msCrypto;
    if (browserCrypto && browserCrypto.getRandomValues) {
      try {
        const result = new Uint8Array(16);
        browserCrypto.getRandomValues(result);

        result[6] = (result[6] & 0x0f) | 0x40;
        result[8] = (result[8] & 0x3f) | 0x80;

        return result as ArrayLike<number>;
      } catch (e) { /*fallback*/ }
    }

    return UUID.getRandomFromMathRandom();
  }

  /**
   * Create the UUID string format
   */
  private static uuidToString(buf: ArrayLike<number>, offset: number = 0) {
    let i = offset;
    const bth = UUID.byteHexMappings.byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
      bth[buf[i++]] + bth[buf[i++]] + "-" +
      bth[buf[i++]] + bth[buf[i++]] + "-" +
      bth[buf[i++]] + bth[buf[i++]] + "-" +
      bth[buf[i++]] + bth[buf[i++]] + "-" +
      bth[buf[i++]] + bth[buf[i++]] +
      bth[buf[i++]] + bth[buf[i++]] +
      bth[buf[i++]] + bth[buf[i++]];
  }
}