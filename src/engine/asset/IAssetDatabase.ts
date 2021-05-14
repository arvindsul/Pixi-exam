import {AssetManifest} from "./AssetManifest";
import {AssetStageLoad} from "./AssetStageLoad";

export interface IAssetDatabase {
  /**
   * Sets the asset manifest
   */
  setManifest(manifest: AssetManifest): void;

  /**
   * Loads a stage defined in the manifest
   */
  loadStage(name: string): AssetStageLoad;

  /**
   * Finds a loaded texture
   */
  getTexture(key: string): PIXI.Texture;
}