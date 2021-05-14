import {IAsyncOperation} from "./IAsyncOperation";
import {inject} from "../core/InjectionDecorator";
import {IRuntime} from "../core/IRuntime";

export class Wait implements Iterable<any>, IAsyncOperation {
  public get IsComplete(): boolean {return this.isComplete;}
  private isComplete: boolean = false;

  public get Error(): string {return this.error;}
  private error: string = null;
  
  private timeout: number;

  private waitPollDuration: number = 0;
  private waitPollDurationAccum: number = 0;
  private waitTimeout: number;
  private waitTimeoutDurationAccum: number = 0;
  private waitFunc: () => boolean;

  private promiseCall: () => void;

  @inject("IRuntime")
  private runtime: IRuntime;
  
  constructor() {
    this.runtime.attach(this);
  }

  /**
   * Waits for some time in seconds
   */
  public static delay(duration: number): Wait {
    const wait = new Wait();
    wait.timeout = duration || 0;
    return wait;
  }

  /**
   * Waits until the end of the current frame
   */
  public static endOfFrame(): Wait {
    const wait = new Wait();
    wait.timeout = 0;
    return wait;
  }

  /**
   * Waits until waitFunc returns true for an optional time limit in seconds
   */
  public static until(waitFunc: () => boolean, waitTimeout?: number): Wait {
    const wait = new Wait();
    wait.waitFunc = waitFunc;
    wait.waitTimeout = waitTimeout;
    return wait;
  }

  public [Symbol.iterator](): IterableIterator<any> {
    return this.execute_co();
  }
  
  private *execute_co(): IterableIterator<any> {
    yield new Promise<void>((resolve, reject) => {
      this.promiseCall = () => resolve();
    });

    this.runtime.detach(this);

    return this;
  }
  
  private tick(delta: number): void {
    if (this.isComplete) return;
    
    if (this.waitFunc) {
      this.waitPollDurationAccum += delta;
      this.waitTimeoutDurationAccum += delta;

      if (this.waitPollDurationAccum >= this.waitPollDuration) {
        this.waitPollDurationAccum = 0;
        this.isComplete = this.waitFunc();
      }

      if (this.waitTimeout && this.waitTimeoutDurationAccum >= this.waitTimeout) {
        this.error = `Wait.until(${this.waitTimeout}) timed out`;
        this.isComplete = true;
      }
    } else {
      this.timeout -= delta;
      this.isComplete = this.timeout <= 0;
    }

    if (this.isComplete) {
      this.promiseCall();

      this.waitFunc = null;
    }
  }
}