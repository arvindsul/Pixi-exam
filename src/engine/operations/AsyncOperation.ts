import {IAsyncOperation} from "./IAsyncOperation";
import {inject} from "../core/InjectionDecorator";
import {IRuntime} from "../core/IRuntime";

/**
 * An operation that breaks once IsComplete is set
 */
export class AsyncOperation implements Iterable<any>, IAsyncOperation {
  public IsComplete: boolean = false;
  public Error: string = null;
  
  private promiseCall: () => void;

  @inject("IRuntime")
  private runtime: IRuntime;
  
  constructor() {
    this.runtime.attach(this);
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
    if (this.IsComplete && this.promiseCall) {
      this.promiseCall();
    }
  }
}