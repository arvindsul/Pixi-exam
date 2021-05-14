export interface IAsyncOperation {
  /**
   * True if the operation is complete
   */
  IsComplete: boolean;

  /**
   * The error string
   */
  Error?: string;
}