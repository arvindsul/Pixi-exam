import * as PIXI from "pixi.js-legacy";
import {gsap} from "gsap";

import {Behavior} from "./core/Behavior";
import {IRuntime, IRuntimeOptions} from "./core/IRuntime";
import {IGame} from "./core/IGame";
import {Time} from "./util/Time";
import {Mathf} from "./util/Mathf";
import {IHTML5Window, RequestAnimationFrame} from "./core/RequestAnimationFrame";
import {Detect} from "./core/Detect";
import {Vector2} from "./util/Vector2";
import {IAssetDatabase} from "./asset/IAssetDatabase";
import {AssetDatabase} from "./asset/AssetDatabase";
import {Internal} from "./core/Internal";

/**
 * Core engine object responsible for managing the application.
 * Controls the renderer, frame update loop, and the game's execution.
 */
export class Runtime extends Behavior implements IRuntime {
  private root: PIXI.Container;

  public get GameRoot(): PIXI.Container {return this.gameRoot;}
  private gameRoot: PIXI.Container;

  public get IsPaused(): boolean {return this.isPaused};
  private isPaused: boolean = false;
  
  private readonly container: HTMLElement;
  private readonly game: IGame;
  private readonly options: IRuntimeOptions;
  private readonly detect: Detect;
  
  private readonly rendererStage: PIXI.Container;
  private renderer: PIXI.Renderer;

  private readonly time: Time = new Time();
  private readonly raf: RequestAnimationFrame;
  private readonly interval: number;
  private lastTime: number;
  private smoothFrameDelta: number = 0;
  
  private started: boolean = false;
  private shouldTick: boolean = false;
  
  // List of objects that receive frame ticks
  private attachedFTO: any[] = [];

  private readonly pixelRatioBase: number;
  
  public get SceneSize(): Vector2 {return this.sceneSize;}
  private sceneSize: Vector2;
  
  private sceneScale: Vector2 = new Vector2(1,1);
  
  // Browser events
  private evtListenerResize: EventListener;
  private evtListenerOrientation: EventListener;
  private evtListenerError: EventListener;

  private readonly injectionMap: Map<string, any> = new Map<string, any>();
  
  private readonly assets: IAssetDatabase;
  
  constructor(container: HTMLElement, game: IGame) {
    super();

    Internal.Runtime = this;
    this.setInjection("IRuntime", this);
    
    this.detect = new Detect();
    this.setInjection("Detect", this.detect);
    
    this.assets = new AssetDatabase();
    this.setInjection("IAssetDatabase", this.assets);
    
    this.container = container;
    this.game = game;
    this.pixelRatioBase = window.devicePixelRatio;
    this.options = this.processOptions(game.RuntimeOptions);
    document.title = game.Name;

    gsap.defaults({
      ease: "none"
    });
    
    this.rendererStage = new PIXI.Container();
    this.rendererStage.name = "Renderer Stage";
    
    this.root = new PIXI.Container();
    this.root.setParent(this.rendererStage);

    const frame = new PIXI.Graphics()
      .lineStyle(3, 0xFFFFFF, 1, 1)
      .beginFill()
      .drawRect(0,0,this.options.BaseWidth, this.options.BaseHeight)
      .endFill();
    frame.setParent(this.root);
    
    this.gameRoot = new PIXI.Container();
    this.gameRoot.setParent(this.root);
    
    this.interval = Mathf.round(1000 / this.options.Framerate, 2);
    this.lastTime = this.time.now;

    this.raf = new RequestAnimationFrame(<IHTML5Window><any>window, this);
  }

  /**
   * Starts rendering and frame ticking
   */
  public start(): void {
    if (this.started) return;

    this.startCoroutine(this.start_co);
  }

  /**
   * Retreive an instance for the given injection key
   */
  public getInjection(type: string): any {
    if (!this.injectionMap.has(type)) {
      console.warn(`Injection for "${type}" not defined`);
    }
    return this.injectionMap.get(type);
  }
  
  /**
   * Add a tickable to the frame tick
   */
  public attach(tickable: any): void {
    if (!("tick" in tickable)) return;

    const index = this.attachedFTO.indexOf(tickable);

    if (index > 0) return;

    this.attachedFTO.push(tickable);
  }

  /**
   * Remove a tickable from the frame tick
   */
  public detach(tickable: any): void {
    const attachedIndex = this.attachedFTO.indexOf(tickable);

    if (attachedIndex < 0) return;

    this.attachedFTO.splice(attachedIndex, 1);
  }
  
  /**
   * Attaches browser-related event handlers
   */
  private attachBrowserEvents(): void {
    this.evtListenerResize       = () => this.handleScaleToWindow();
    this.evtListenerOrientation  = () => this.handleScaleToWindow();
    // this.evtListenerFocus        = () => this.handleWindowFocus(true);
    // this.evtListenerBlur         = () => this.handleWindowFocus(false);
    // this.evtListenerBeforeUnload = () => this.handleUnload();
    this.evtListenerError        = (evt: Event) => this.handleError(<ErrorEvent>evt);

    window.addEventListener("resize", this.evtListenerResize);
    window.addEventListener("orientationchange", this.evtListenerOrientation);
    // window.addEventListener("beforeunload", this.evtListenerBeforeUnload);
    window.addEventListener("error", this.evtListenerError, true);

    // if (this.detect.isDesktop) {
    //   window.addEventListener("focus", this.evtListenerFocus);
    //   window.addEventListener("blur", this.evtListenerBlur);
    // } else {
    //   document.addEventListener("pause", this.evtListenerBlur, false);
    //   document.addEventListener("resume", this.evtListenerFocus, false);
    // }
  }

  /**
   * Detaches browser-related event handlers
   */
  // private detachBrowserEvents(): void {
  //   window.removeEventListener("resize", this.evtListenerResize);
  //   window.removeEventListener("orientationchange", this.evtListenerOrientation);
  //   window.removeEventListener("beforeunload", this.evtListenerBeforeUnload);
  //   window.removeEventListener("error", this.evtListenerError);
  //
  //   if (this.detect.isDesktop) {
  //     window.removeEventListener("focus", this.evtListenerFocus);
  //     window.removeEventListener("blur", this.evtListenerBlur);
  //   } else {
  //     document.removeEventListener("pause", this.evtListenerBlur);
  //     document.removeEventListener("resume", this.evtListenerFocus);
  //   }
  // }
  
  /**
   * Initializes default options
   */
  private processOptions(options: IRuntimeOptions): IRuntimeOptions {
    const viewport = Detect.getElementSize(this.container);
    const width = options.BaseWidth ?? viewport.x;
    const height = options.BaseHeight ?? viewport.y;
    
    const defaults: IRuntimeOptions = {
      BaseWidth: width,
      BaseHeight: height,
      MaxScale: 1,
      ResponsiveWidth: width,
      ResponsiveHeight: height,
      ContainerFitWidth: 1,
      ContainerFitHeight: 1,
      SceneCenterX: 0.5,
      SceneCenterY: 0.5,
      WebGL: true,
      AntiAlias: false,
      HalfSize: false,
      RunInBackground: false,
      CanZoom: false,
      ContainerFit: false,
      ContainerConstrain: false,
      PreventDefaultInteraction: false,
      Framerate: 60
    };
    
    return {...defaults, ...options};
  }

  /**
   * Request animation frame callback
   */
  private handleRAF() {
    if (!this.started) return;

    const now= this.time.now;
    const elapsed = now - this.lastTime;

    this.raf.request(this.interval);

    this.lastTime = now;

    this.tick(now, elapsed);
  }

  /**
   * Internal method to tick the runtime to the next frame.
   *
   * @param now Current clock time in milliseconds
   * @param elapsed Time elapsed since last frame in milliseconds
   */
  private tick(now: number, elapsed: number): void {
    const deltaSec = elapsed * 0.001;

    // Apply Generalized DEMA algorithm to smooth frame delta in an attempt to filter out
    // minor spikes. Using Low-Pass-Filter at ~8fps to avoid huge spikes.
    this.smoothFrameDelta = this.calculateSmoothFrameDelta(
      Math.min(deltaSec, 0.1333333));

    if (!this.shouldTick) return;
    
    const tickObjects = this.attachedFTO.slice(0);
    const tickCalls   = tickObjects.length;
    for (let i = 0; i < tickCalls; ++i) {
      tickObjects[i].tick(this.smoothFrameDelta);
    }
    
    this.renderer.render(this.rendererStage);
  }

  /**
   * Internal method to calculate the smooth frame delta
   *
   * @param deltaSec Current frame delta in seconds
   * @returns Smooth frame delta in seconds
   */
  private calculateSmoothFrameDelta(deltaSec: number): number {
    return this.gd(this.gd(this.gd(deltaSec, 0.7), 0.7), 0.7);
  }

  /**
   * Internal method to calculate the generalized DEMA (double EMA) that is used to smooth the
   * frame delta
   *
   * @param deltaSec Frame delta to average with the existing (running) value in seconds
   * @param weight Number between 0 and 1 which determines the moving average's
   *               response to linear trends. If 0, result is pure EMA. if 1, result
   *               is pure DEMA. Defaults to 0.7 per source whitepaper.
   * @returns Generalized DEMA
   */
  private gd(deltaSec: number, weight: number): number {
    return this.ema(deltaSec) * (1 + weight) - this.ema(this.ema(deltaSec)) * weight;
  }

  /**
   * Internal method to calculate the exponential moving average (that we use to smooth the frame delta).
   *
   * @param deltaSec Frame delta to average with the existing (running) value
   * @returns Exponential moving average
   */
  private ema(deltaSec: number): number {
    const n = 5; // how many frames to apply the EMA over
    return 2 / (1 + n) * (deltaSec - this.smoothFrameDelta) + this.smoothFrameDelta;
  }

  /**
   * Window scale event handler
   */
  private handleScaleToWindow(force: boolean = false): void {
    // console.log(`Runtime.handleScaleToWindow(force: ${force})`);
    const viewport = Detect.getElementSize(this.container);
    const scaleFactor = this.options.HalfSize ? 2 : 1;
    let width = viewport.x / scaleFactor;
    let height = viewport.y / scaleFactor;
    let canvasWidth = width;
    let canvasHeight = height;

    let zoom = Math.round(((window.outerWidth) / window.innerWidth) * 100) / 100;

    if (!this.options.CanZoom) {
      zoom = 1;
    } else {
      if (this.detect.isFirefox) {
        zoom = window.devicePixelRatio / this.pixelRatioBase;
      } else if (this.detect.isIE) {
        zoom = Math.round(((<any>screen).deviceXDPI / (<any>screen).logicalXDPI) * 100) / 100;
      } else if (this.detect.isMobile) {
        zoom = 1;
      }
    }
    
    if (this.options.ContainerFit && (!this.detect.isMobile || force || zoom !== 1)) {
      let windowHeight;

      if (this.detect.isMobile) {
        windowHeight = window.screen.height * this.options.ContainerFitHeight * zoom;
      } else {
        windowHeight = window.innerHeight * this.options.ContainerFitHeight * zoom;
      }

      this.container.style.height = `${windowHeight}px`;

      if (windowHeight > height) {
        height       = windowHeight;
        canvasHeight = windowHeight;
      } else {
        const viewport = Detect.getElementSize(this.container);
        width        = viewport.x;
        height       = viewport.y;
        canvasWidth  = viewport.x;
        canvasHeight = viewport.y;
      }
    }

    const sceneRoot = this.root;
    sceneRoot.scale.x = sceneRoot.scale.y = 1;

    // Scale the scene horizontally and vertically. This keeps the relative game dimensions in place.
    if (height / this.options.ResponsiveHeight < width / this.options.ResponsiveWidth) {
      sceneRoot.scale.x = sceneRoot.scale.y = height / this.options.ResponsiveHeight;
    } else {
      sceneRoot.scale.x = sceneRoot.scale.y = width / this.options.ResponsiveWidth;
    }

    sceneRoot.scale.x = Math.min(sceneRoot.scale.x, this.options.MaxScale);
    sceneRoot.scale.y = Math.min(sceneRoot.scale.y, this.options.MaxScale);
    
    if (zoom > 1) {
      sceneRoot.scale.x = sceneRoot.scale.y = height / this.options.ResponsiveHeight;
    }

    if (!this.options.ContainerConstrain && this.options.SceneCenterX) {
      const scrollPadding = Detect.hasScrollbar() ? 10 : 0;
      sceneRoot.x = (width - this.options.ResponsiveWidth * sceneRoot.scale.x) *
        this.options.SceneCenterX - scrollPadding;
    }

    if (this.options.SceneCenterY) {
      sceneRoot.y = (height - this.options.ResponsiveHeight * sceneRoot.scale.y) * this.options.SceneCenterY;
    }

    if (this.options.ContainerConstrain) {
      canvasWidth = Math.max(Math.min(this.options.BaseWidth, window.innerWidth), this.options.MinWidth);

      const scrollPadding = Detect.hasScrollbar() ? 10 : 0;
      const left = Math.max(0, (canvasWidth - this.options.ResponsiveWidth * sceneRoot.scale.x) *
        this.options.SceneCenterX - scrollPadding);

      this.container.style.width = `${canvasWidth}px`;
      this.container.style.left  = `${Math.max(0,left + (window.innerWidth/2 - canvasWidth/2))}px`;
    }

    // Set the canvas size and display size based on pixel density.
    this.renderer.view.width  = canvasWidth;
    this.renderer.view.height = canvasHeight;

    // Resize the Pixi Renderer
    this.renderer.resize(canvasWidth, canvasHeight);

    const pivX = -(width * (1 / sceneRoot.scale.x) / 2);

    this.sceneScale = new Vector2(sceneRoot.scale.x, sceneRoot.scale.y);
    this.sceneSize  = new Vector2(width / sceneRoot.scale.x + pivX * 0.5, height / sceneRoot.scale.y);

    this.renderer.render(this.rendererStage);
  }

  // private handleWindowFocus(focused: boolean): void {
  //   console.log(`Runtime.handleWindowFocus(focused: ${focused})`);
  //   if (focused) {
  //     this.startCoroutine(this.resume_co);
  //   } else {
  //     this.startCoroutine(this.pause_co);
  //   }
  // }
  
  private handleError(evt: ErrorEvent): void {
    // TODO: Implement me
    console.error("Runtime error", evt);
    evt.preventDefault();
  }
  
  // private handleUnload(): void {
  //   console.log("Runtime.handleUnload()");
  //   this.startCoroutine(this.shutdown_co, true);
  // }
  
  private createPixiRenderer(): void {
    const viewport = Detect.getElementSize(this.container);
    const scaleFactor = this.options.HalfSize ? 2 : 1;
    const width = Math.max(100, viewport.x / scaleFactor);
    const height = Math.max(100, viewport.y / scaleFactor);

    const renderOptions = {
      width: width,
      height: height,
      antialias: this.options.AntiAlias,
      autoResize: false,
      transparent: false,
      backgroundColor: this.options.BackgroundColor,
      resolution: window.devicePixelRatio
    };
    
    // We'll do our own ticking, thank you
    PIXI.Ticker.shared.stop();
    PIXI.Ticker.shared.destroy();

    if (this.options.ContainerFit) {
      if (this.detect.isMobile) {
        this.container.style.height = `${window.screen.height * this.options.ContainerFitHeight}px`;
      } else {
        this.container.style.height = `${window.innerHeight * this.options.ContainerFitHeight}px`;
      }
    } else {
      this.container.style.width = "100vw";
      this.container.style.height = "100vh";
    }

    if (!this.detect.isMobile && this.options.MinWidth) {
      this.container.style.minWidth = `${this.options.MinWidth}px`;
    }

    this.renderer = new PIXI.Renderer(renderOptions);

    this.renderer.view.width = width;
    this.renderer.view.height = height;
    this.renderer.view.style.width = "100%";
    this.renderer.view.style.height = "100%";
    this.renderer.view.style.position = "center";
    this.renderer.view.style.display = "block";
    this.renderer.view.style.margin = "0px";
    this.renderer.view.style.padding = "0px";
    this.renderer.view.style.touchAction = "auto";

    this.renderer.plugins.interaction.autoPreventDefault = this.options.PreventDefaultInteraction;
    
    this.container.appendChild(this.renderer.view);
  }

  private *start_co(): IterableIterator<any> {
    console.log(`Runtime.start_co()`);
    
    this.attachBrowserEvents();
    this.createPixiRenderer();
    // this.registerPixiInspector();
    this.handleScaleToWindow(true);

    this.renderer.clear();

    this.started = true;
    this.shouldTick = true;
    this.handleRAF();

    this.assets.setManifest(this.game.Manifest);
    
    yield* this.game.load_co();
    yield* this.game.activate_co();
  }

  // private *restart_co(): IterableIterator<any> {
  //   console.log(`Runtime.restart_co()`);
  //   if (!this.started) return;
  //
  //   yield* this.shutdown_co();
  //
  //   window.location.reload();
  // }

  // private *shutdown_co(): IterableIterator<any> {
  //   console.log(`Runtime.shutdown_co()`);
  //   if (!this.started) return;
  //
  //   this.detachBrowserEvents();
  //
  //   yield* this.game.deactivate_co();
  //
  //   this.root.dispose();
  //   this.root     = null;
  //   this.gameRoot = null;
  //
  //   this.game.dispose();
  //
  //   yield* this.game.unload_co();
  //   yield* this.game.destruct_co();
  //
  //   this.renderer.destroy(true);
  //
  //   this.started    = false;
  //   this.shouldTick = false;
  // }

  // private *pause_co(): IterableIterator<any> {
  //   console.log(`Runtime.pause_co()`);
  //   if (this.isPaused) return;
  //
  //   this.isPaused = true;
  //
  //   if (!this.options.RunInBackground) {
  //     this.shouldTick = false;
  //   }
  //
  //   yield* this.game.pause_co();
  // }

  // private *resume_co(): IterableIterator<any> {
  //   console.log(`Runtime.resume_co()`);
  //   if (!this.isPaused) return;
  //
  //   this.isPaused = false;
  //   this.shouldTick = true;
  //
  //   yield* this.game.resume_co();
  // }

  private setInjection(key: string, instance: any): void {
    this.injectionMap.set(key, instance);
  }

  // registerPixiInspector() {
  //   (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__ &&  (window as any).__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
  // }
}