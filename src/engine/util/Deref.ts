/**
 * Utility for handling object reference checks
 * ***
 * ***Consider using null conditional (?.) or null coalescing (??) operators***
 * ***
 */
export class Deref {
  /**
   * Checks to see if value is a valid JavaScript value, and returns value if it is. If value
   * is invalid it will throw an error.
   */
  public static deref<T>(value: T, msg?: string): T {
    if (value === undefined || value === null) {
      throw new Error(msg ? `Invalid Deref Value: ${msg}` : "Invalid Deref Value");
    } else {
      return value;
    }
  }

  /**
   * Checks to see if value is a valid JavaScript value, and returns true if it is. If value
   * is invalid it will return false.
   */
  public static valid(value: any): boolean {
    return !(value === undefined || value === null);
  }

  /**
   * Checks to see if value is a valid JavaScript value. If the value is not valid sets the value
   * to the specified default value.
   */
  public static init<T>(value: T, defaultValue: T): T {
    return (value === undefined || value === null) ? defaultValue : value;
  }

  /**
   * Returns the given function if valid otherwise returns a noop function.
   * This is ideal for blindly calling an optional function of an event listener object.
   */
  public static func<T extends Function>(value: T): T {
    const noop: Function = () => {};
    return value || (<T>noop);
  }
}