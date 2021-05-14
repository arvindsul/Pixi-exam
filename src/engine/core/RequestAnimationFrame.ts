import {Deref} from "../util/Deref";

/**
 * Defines a window in the browser
 */
export interface IHTML5Window extends Window {
  /**
   * Animation frame request for webkit
   * 
   * @param callback The frame request callback to use
   * @returns time since last frame
   */
  webkitRequestAnimationFrame(callback: FrameRequestCallback): number;

  /**
   * Animation frame request for mozilla
   *
   * @param callback The frame request callback to use
   * @returns time since last frame
   */
  mozRequestAnimationFrame(callback: FrameRequestCallback): number;

  /**
   * Animation frame request for opera
   *
   * @param callback The frame request callback to use
   * @returns time since last frame
   */
  oRequestAnimationFrame(callback: FrameRequestCallback): number;
}

/**
 * Defines an object that can handle RAF calls
 */
export interface IRAFHandler {
  /**
   * Handles the RAF call from the RequestAnimationFrame class
   */
  handleRAF(): void;
}

export class RequestAnimationFrame {
  /**
   * The object that handles RAF calls.
   */
  private handler: IRAFHandler;

  /**
   * Holds the browser specific RAF function to be called.
   */
  private readonly rafFunction: (func: FrameRequestCallback) => number;

  /**
   * Holds the callback that is called by the browser func.
   */
  private readonly rafCallback: () => void;

  /**
   * Create a RequestAnimationFrame object
   */
  constructor(win: IHTML5Window, handler: IRAFHandler | any) {
    if (win.requestAnimationFrame ||
      (<any>win).msRequestAnimationFrame ||
      win.webkitRequestAnimationFrame ||
      win.mozRequestAnimationFrame ||
      win.oRequestAnimationFrame) {
      this.rafFunction = (frc: FrameRequestCallback) =>
        (win.requestAnimationFrame ||
          (<any>win).msRequestAnimationFrame ||
          win.webkitRequestAnimationFrame ||
          win.mozRequestAnimationFrame ||
          win.oRequestAnimationFrame)(frc);
    }

    if (!('handleRAF' in handler)) {
      throw new ReferenceError("Invalid RAFHandler");
    }

    this.handler = handler;
    this.rafCallback = () => {this.handler.handleRAF()};
  }

  /**
   * Check to see if RAF is being used or the default setTimeout
   */
  public get hasRAF(): boolean {return Deref.valid(this.rafFunction);}

  /**
   * Call to retrieve an animation frame from the browser
   */
  public request(interval?: number): void {
    if (this.hasRAF) {
      this.rafFunction(this.rafCallback);
    } else {
      setTimeout(this.rafCallback, interval);
    }
  }
}