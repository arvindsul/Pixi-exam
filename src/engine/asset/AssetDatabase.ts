import * as PIXI from "pixi.js-legacy";

import {Behavior} from "../core/Behavior";
import {Deref} from "../util/Deref";
import {IAssetDatabase} from "./IAssetDatabase";
import {AssetManifest} from "./AssetManifest";
import {TextureRef} from "./TextureRef";
import {AssetStageLoad} from "./AssetStageLoad";
import {Mathf} from "../util/Mathf";
import {Wait} from "../operations/Wait";

export class AssetDatabase extends Behavior implements IAssetDatabase {
  private manifest: AssetManifest;
  private readonly textures: TextureRef[] = [];

  public setManifest(manifest: AssetManifest): void {
    this.manifest = manifest;
  }

  public getTexture(key: string): PIXI.Texture {
    return this.textures.find(tex => tex.Key == key)?.Texture;
  }

  public loadStage(name: string): AssetStageLoad {
    const stage = this.manifest.get(name);
    const op = new AssetStageLoad(stage);
    
    if (!stage || (stage?.IsLoaded)) {
      console.warn("Load stage fail");
      op.IsComplete = true;
      return op;
    }
    
    op.AssetCount = stage.Count;
    
    this.startCoroutine(this.loadStage_co, op);

    return op;
  }
  
  private *loadStage_co(op: AssetStageLoad): IterableIterator<any> {
    yield* this.loadImages_co(op);

    op.Stage.load();
    PIXI.utils.clearTextureCache();
    op.IsComplete = true;
  }
  
  private *loadImages_co(op: AssetStageLoad): IterableIterator<any> {
    const loader = new PIXI.Loader();

    op.Stage.Images.forEach(image => loader.add(image.key, image.path));
    
    loader.onProgress.add((loader: PIXI.Loader, res: PIXI.LoaderResource) => {
      console.log(`Asset "${res.url}" stopped loading`);
      op.AssetsCompleted++;
      op.Progress = Mathf.round(loader.progress, 2);
    });

    loader.onError.add((error: Error, loader: PIXI.Loader, res: PIXI.LoaderResource) => {
      op.AssetsFailed++;
      op.Error = `Asset "${res.url}" failed to load because "${error.message}"`;
      console.error(op.Error);
    });

    loader.onLoad.add((loader: PIXI.Loader, res: PIXI.LoaderResource) => {
     console.log(`Asset "${res.url}" loaded`);
      
      op.OnProgress?.call(op, op.Progress, res.name);
      
      op.AssetsLoaded++;
    });

    let isComplete = false;

    loader.load((loader, resources) => {
      isComplete = true;

      for (const key in resources) {
        const res = resources[key];
        if (!Deref.valid(res))
          continue;
        
        if (res.loadType === PIXI.LoaderResource.LOAD_TYPE.IMAGE) {
          console.log(`Texture: ${res.name}`);
          this.textures.push(new TextureRef(res.name, res.texture));
        }
      }
    });

    yield* Wait.until(() => isComplete);
  }
}