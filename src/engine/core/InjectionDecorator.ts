import {Internal} from "./Internal";

/**
 * Implements dependency injection via property [decorator notation](https://www.typescriptlang.org/docs/handbook/decorators.html).
 * 
 * Example:
 * ```
 * @inject("IRuntime")
 * IRuntime runtime;
 * ```
 */
export function inject(type: any): any {
  return (target: any, key: string): any => {
    Object.defineProperty(target, key, {
      get: () => Internal.Runtime.getInjection(type),
      set: () => {}
    });
  }
}