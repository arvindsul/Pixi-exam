import {IRuntimeOptions} from "./IRuntime";
import {AssetManifest} from "../asset/AssetManifest";

/**
 * Defines a playable game that will be managed by the Runtime.
 */
export interface IGame {
  readonly Name: string;
  readonly RuntimeOptions: IRuntimeOptions;
  readonly Manifest: AssetManifest;
  
  load_co(): IterableIterator<any>;
  activate_co(): IterableIterator<any>;
}