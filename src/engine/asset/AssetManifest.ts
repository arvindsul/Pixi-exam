import {AssetStage} from "./AssetStage";

export const enum AssetStages {
  Preload = "PRELOAD",
  Main = "MAIN"
}

/**
 * Stores the defintion of assets that will be used in an application.
 * Each stage represents a group of assets that should be loaded together
 */
export class AssetManifest {
  public stages: Map<string, AssetStage> = new Map<string, AssetStage>();
  
  public add(stage: AssetStage): this {
    this.stages.set(stage.Name, stage);
    return this;
  }
  
  public get(stageName: string): AssetStage {
    return this.stages.get(stageName);
  }
}