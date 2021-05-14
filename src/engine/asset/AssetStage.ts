import {IAssetDef} from "./IAssetDef";

/**
 * A collection of assets
 */
export class AssetStage {
  public readonly Name: string;
  
  public get IsLoaded() : boolean {return this.isLoaded;}
  private isLoaded: boolean = false;
  
  public get Images(): IAssetDef[] {return this.images;}
  private images: IAssetDef[] = [];
  
  public get Count(): number {
    return this.images.length;
  }
  
  constructor(name: string) {
    this.Name = name;
  }

  public addImage(image: IAssetDef): void {
    this.images.push(AssetStage.finalize(image));
  }

  public addImages(image: Array<IAssetDef>): void {
    image.forEach(image => this.addImage(image));
  }
  
  public load(): void {
    this.isLoaded = true;
  }

  public unload(): void {
    this.isLoaded = false;
  }
  
  private static finalize(assetDef: IAssetDef): IAssetDef {
    if (!assetDef.key) {
      const idx = assetDef.path.lastIndexOf("/");
      assetDef.key =  assetDef.path.substring(idx + 1,  assetDef.path.length - 4);

      if (assetDef.key[assetDef.key.length - 1] === ".") {
        assetDef.key = assetDef.key.substr(0, assetDef.key.length - 1);
      }
    }

    return assetDef;
  }
}