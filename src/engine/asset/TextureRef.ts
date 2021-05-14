import * as PIXI from "pixi.js-legacy";

import {IDisposable} from "../core/IDisposable";

export class TextureRef implements IDisposable {
  public get IsDisposed() {return this.isDisposed;}
  private isDisposed: boolean = false;
  
  public readonly Key: string;
  
  public get Texture() {return this.texture;} 
  private texture: PIXI.Texture;
  
  constructor(key: string, texture: PIXI.Texture) {
    this.Key = key;
    this.texture = texture;
  }
  
  public dispose() {
    this.texture.destroy(true);
    this.texture = null;
    this.isDisposed = true;
  }
}