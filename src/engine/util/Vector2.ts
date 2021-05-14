import * as PIXI from "pixi.js-legacy";

import {Deref} from "../util/Deref";

export interface IPoint {
  x: number;
  y: number;
}

export class Vector2 implements IPoint {
  /**
   * X component
   */
  public x: number = 0;

  /**
   * Y component
   */
  public y: number = 0;

  constructor(p?: IPoint);
  constructor(x: number, y: number);
  constructor(x: any = 0, y: number = 0) {
    this.set(x, y);
  }

  /**
   * IPoint type guard
   */
  public static isPoint(p: any): p is IPoint {
    return (Deref.valid(p) && typeof p === "object" && "x" in p && "y" in p);
  }
  
  /**
   * Set the vector values from the given point/vector
   */
  public set(p?: IPoint): this;
  /**
   * Set the vector values from the given x and y
   */
  public set(x: number, y: number): this;
  public set(x: number | IPoint, y: number = 0): this {
    if (Vector2.isPoint(x)) {
      ({x, y} = x);
    }

    this.x = x ?? 0;
    this.y = y;
    
    return this;
  }

  /**
   * Creates a pixi point with the same x,y
   */
  public toPoint(): PIXI.Point {
    return new PIXI.Point(this.x, this.y);
  }
}