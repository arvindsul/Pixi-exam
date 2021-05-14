/**
 * Wraps time retrieval functionality. Handles browser specific time calls.
 */
export class Time {
  /**
   * Maintains the performance time object
   */
  private timeFunc: {now: () => number};
  
  constructor() {
    this.timeFunc = window.performance || {now: () => {return 0;}};

    if (this.timeFunc.now == null && window.performance) {
      this.timeFunc.now =
        window.performance.now ||
        (<any>window.performance).mozNow ||
        (<any>window.performance).msNow ||
        (<any>window.performance).oNow ||
        (<any>window.performance).webkitNow ||
        (() => {return Date.now();});
    } else {
      this.timeFunc.now = () => {return Date.now();}
    }
  }

  /**
   * Gets the current time in milliseconds
   */
  public get now(): number {return this.timeFunc.now();}
}