import * as PIXI from "pixi.js-legacy";

/**
 * Runtime settings object
 */
export interface IRuntimeOptions {
  BaseWidth?: number;
  BaseHeight?: number;
  MinWidth?: number;
  MaxScale?: number;
  ResponsiveWidth?: number;
  ResponsiveHeight?: number;
  ContainerFitWidth?: number;
  ContainerFitHeight?: number;
  BackgroundColor?: number;
  SceneCenterX?: number;
  SceneCenterY?: number;
  WebGL?: boolean;
  HalfSize?: boolean;
  AntiAlias?: boolean;
  RunInBackground?: boolean;
  CanZoom?: boolean;
  ContainerFit?: boolean;
  ContainerConstrain?: boolean;
  PreventDefaultInteraction?: boolean;
  Framerate?: number;
}

/**
 * Defines the core engine object responsible for managing the application.
 */
export interface IRuntime {
  readonly GameRoot: PIXI.Container;
  
  start(): void;
  attach(tickable: any): void;
  detach(tickable: any): void;
  
  getInjection(type: string): any;
}