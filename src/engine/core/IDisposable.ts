/**
 * Defines objects that can be disposed.
 */
export interface IDisposable {
  /**
   * Cleans up internal state of an object.
   */
  dispose(): void;

  /**
   * Disposed state of an object.
   */
  readonly IsDisposed: boolean;
}