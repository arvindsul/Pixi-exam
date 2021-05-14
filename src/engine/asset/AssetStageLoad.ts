import {AsyncOperation} from "../operations/AsyncOperation";
import {AssetStage} from "./AssetStage";

/**
 * An AssetStage loading operation
 */
export class AssetStageLoad extends AsyncOperation {
  /**
   * The stage that's being loaded
   */
  public readonly Stage: AssetStage;
  
  /**
   * Current loading progress from [0 - 100]%
   */
  public Progress: number = 0;

  /**
   * Total number of assets to be loaded
   */
  public AssetCount: number = 0;

  /**
   * Number of successfully loaded assets
   */
  public AssetsLoaded: number = 0;

  /**
   * Number of assets that failed to load
   */
  public AssetsFailed: number = 0;

  /**
   * Number of assets that are no longer loading (success or failure)
   */
  public AssetsCompleted: number = 0;
  
  constructor(stage: AssetStage) {
    super();
    this.Stage = stage;
  }

  /**
   * Called when an asset has completed loading
   */
  public OnProgress: (progress: number, asset: string) => void;
}