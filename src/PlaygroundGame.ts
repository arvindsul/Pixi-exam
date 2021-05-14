import * as PIXI from "pixi.js-legacy";
import {gsap,TweenMax, TimelineLite} from "gsap";

import {
  AssetManifest,
  AssetStage,
  AssetStages,
  Behavior,
  IAssetDatabase,
  IGame,
  inject,
  IRuntime,
  IRuntimeOptions,
  Runtime, Wait
} from "./engine/webengine";

import {Constants} from "./Constants";

export class PlaygroundGame extends Behavior implements IGame {
  public get Name() {return Constants.GAME_NAME;}

  public get RuntimeOptions(): IRuntimeOptions {return this.runtimeOptions;}
  private readonly runtimeOptions: IRuntimeOptions = {
    BackgroundColor: 0x404040,
    BaseWidth: Constants.BASE_WIDTH,
    BaseHeight: Constants.BASE_HEIGHT,
    MaxScale: 1,
    RunInBackground: true,
    CanZoom: true
  }; 

  public get Manifest(): AssetManifest {return this.manifest;}
  private readonly manifest: AssetManifest = new AssetManifest();

  @inject("IRuntime")
  private runtime: IRuntime;

  @inject("IAssetDatabase")
  private assets: IAssetDatabase;
  
  constructor() {
    super();
  }

  /**
   * Load assets here
   */
  public *load_co(): IterableIterator<any> {
    console.log("Loading game assets");

    const stage: AssetStage = new AssetStage(AssetStages.Main);
    const root = "assets/images";
    
    // Load images here
    stage.addImages([
      {path: `${root}/symbol.png`},
    ]);

    this.manifest.add(stage);
    yield* this.assets.loadStage(AssetStages.Main);
    
    console.log("Game assets loaded");
  }

  /**
   * Setup scene and do work here
   */
  public *activate_co(): IterableIterator<any> {
    console.log("Activating game");
    
    yield* this.doTest_co();
  }
  
  /**
   *  create layout and image gallery function
   */

  private *doTest_co(): IterableIterator<any> {
     
    const root: PIXI.Container = this.runtime.GameRoot;
  
    //Find the texture that was loaded earlier and create a sprite
    const texture: PIXI.Texture = this.assets.getTexture("symbol");
    const sprite: PIXI.Sprite = new PIXI.Sprite(texture);
    sprite.setParent(root);

    const texture1: PIXI.Texture = this.assets.getTexture("symbol1");
    const sprite1: PIXI.Sprite = new PIXI.Sprite(texture);
    sprite1.setParent(root);

    const texture2: PIXI.Texture = this.assets.getTexture("symbol2");
    const sprite2: PIXI.Sprite = new PIXI.Sprite(texture);
    sprite2.setParent(root);

    const texture3: PIXI.Texture = this.assets.getTexture("symbol3");
    const sprite3: PIXI.Sprite = new PIXI.Sprite(texture);
    sprite3.setParent(root);

    const texture4: PIXI.Texture = this.assets.getTexture("symbol4");
    const sprite4: PIXI.Sprite = new PIXI.Sprite(texture);
    sprite4.setParent(root);
    
    let x_Offset = localStorage.getItem("x_offset");
    
    // put images into a row

    yield* Wait.delay(1);
    yield gsap.to(sprite, {x:0});
    yield gsap.to(sprite1, {x:x_Offset});
    yield gsap.to(sprite2, {x:x_Offset*2});
    yield gsap.to(sprite3, {x:x_Offset*3});
   
    // Animate the sprite
    
    //yield gsap.to(sprite, {x: "+=700", y:"+=700", transformOrigin: 'center', duration: 3});
    yield* Wait.delay(0.5);
     gsap.to(sprite, {alpha: "0"});
     gsap.to(sprite1, {alpha: "0"});
     gsap.to(sprite2, {alpha: "0"});
     gsap.to(sprite3, {alpha: "0"});
    yield* this.doScaleFromCenter_co();
    //yield gsap.to(sprite, {alpha: "0", duration: 2});
  }

  /**
   *  Scale of image from both axis
   */

  private *doScaleFromCenter_co(): IterableIterator<any> {

    const root: PIXI.Container = this.runtime.GameRoot;
    // Find the texture that was loaded earlier and create a sprite
    const texture: PIXI.Texture = this.assets.getTexture("symbol");
    const sprite: PIXI.Sprite = new PIXI.Sprite(texture);
    sprite.setParent(root);
    
    yield* Wait.delay(1);
    
    yield gsap.to(sprite, 30, { height:sprite.height*1.2, width:sprite.width*1.2});
  }

}