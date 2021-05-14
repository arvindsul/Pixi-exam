/**
 * Useful math utilities
 */
export class Mathf {
  /**
   * Accurate rounding implementation.
   * 
   * @param v Value to round
   * @param decimals Number of places after decimal point
   * @returns Rounded v
   */
  public static round(v: number, decimals: number): number {
    return Number(Math.round(<any>(v + 'e' + decimals)) + 'e-' + decimals);
  }
}