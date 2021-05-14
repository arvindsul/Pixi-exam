/**
 * Defines an asset to be loaded by Pixi's resource loader.
 */
export interface IAssetDef {
  /**
   * Path to the asset.
   */
  path: string;

  /**
   * URL of the asset. Used by font loader.
   */
  url?: string;

  /**
   * Unique key used to access the image.
   */
  key?: string;

  /**
   * Flag specifying if asset should be cached with Pixi.
   */
  cached?: boolean;
}