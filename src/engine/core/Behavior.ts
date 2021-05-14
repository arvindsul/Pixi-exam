import {IDisposable} from "./IDisposable";
import {UUID} from "../util/UUID";

class BehaviorCoroutine {
  public uid: string;
  public context: string;
  public cancelled: boolean = false;
  public run: Function;
  public coroutine: (...args: any[]) => IterableIterator<any>;
  public cancel: () => void;
}

/**
 * Base class that enables asynchronous behavior via coroutines.
 * ***
 * ***ALL CLASSES THAT WANT TO RUN ASYNC FUNCTIONS MUST DERIVE FROM THIS CLASS***
 * ***
 */
export class Behavior implements IDisposable {
  public get IsDisposed() {return this.isDisposed;}
  private isDisposed: boolean = false;

  private readonly coroutines: any = {};
  
  public dispose(): void {
    if (this.isDisposed) return;

    this.stopAllCoroutines();
    
    this.isDisposed = true;
  }

  /**
   * Starts a new coroutine.
   */
  public startCoroutine(coroutine: (...args: any[]) => IterableIterator<any>, ...args: any[]): void {
    if (this.isDisposed) return;
    this.runCoroutine(coroutine, args);
  }
  
  /**
   * Stops all currently running coroutines.
   */
  public stopAllCoroutines(): void {
    if (this.isDisposed) return;

    const properties = Object.getOwnPropertyNames(this.coroutines);
    const propertiesCount = properties.length;

    for (let i = 0; i < propertiesCount; ++i) {
      const coroutine = (<BehaviorCoroutine>this.coroutines[properties[i]]);
      coroutine?.cancel();
    }
  }

  /**
   * Run a new coroutine
   */
  private runCoroutine(coroutine: (...args: any[]) => IterableIterator<any>, args: any[]): BehaviorCoroutine {
    const co = new BehaviorCoroutine();
    co.uid = UUID.get();
    co.context = `${this.constructor.name}::${coroutine.name}`;
    co.coroutine = coroutine;
    co.run = this.genAsyncChain(coroutine, co, args);

    this.coroutines[co.uid] = co;

    co.run();

    return co;
  }

  /**
   * Generate the function that wraps the coroutine chain to run.
   */
  private genAsyncChain(genCo: (...args: any[]) => IterableIterator<any>, co: BehaviorCoroutine, args: any[]): Function {
    return () => {
      try {
        const generator = genCo.apply(this, args);

        const handle = (result: IteratorResult<any>): Promise<any> => {
          try {
            if (result.done) {
              this.removeCoroutine(co.uid);

              if (result.value && result.value.exception) {
                console.error("Coroutine error", result.value.exception);
                // runtime.Game.handleException(Exception.fromError(result.value.exception, co.context));
                // TODO: Handle error
              }

              return Promise.resolve(result.value);
            }

            return Promise.resolve(result.value).then((res) => {
              try {
                return handle(generator.next(res));
              } catch (e4) {
                return handle(<IteratorResult<any>>{
                  done: true,
                  value: {exception: e4}
                });
              }
            }, (e3) => {
              return handle(<IteratorResult<any>>{
                done: true,
                value: {exception: e3}
              });
            });
          } catch (e2) {
            return handle(<IteratorResult<any>>{
              done: true,
              value: {exception: e2}
            });
          }
        }

        co.cancel = () => {
          co.cancelled = true;
          this.removeCoroutine(co.uid);
          generator.return({done:true});
        };

        return handle(generator.next());
      } catch (e1) {
        // TODO: Handle error
        // runtime.Game.handleException(Exception.fromError(e1, co.context));
        console.error("Coroutine error", e1);
        
        this.removeCoroutine(co.uid);
        return Promise.resolve();
      }
    }
  }

  /**
   * Removes a coroutine from the active list
   */
  private removeCoroutine(uid: string): void {
    const coroutine = this.coroutines[uid];

    if (!coroutine) return;

    coroutine.scope = null;
    coroutine.coroutine = null;
    coroutine.cancel = null;

    this.coroutines[uid] = null;

    delete this.coroutines[uid];
  }
}