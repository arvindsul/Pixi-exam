// Version strings injected by webpack DefinePlugin
declare const BUILD_VERSION: string;
declare const BUILD_DATE: string;
declare const BUILD_ENV: string;

export class Constants {
  public static readonly BUILD_VERSION: string = BUILD_VERSION;
  public static readonly BUILD_DATE: string = BUILD_DATE;
  public static readonly BUILD_ENV: string = BUILD_ENV;

  public static readonly GAME_NAME: string = "Pixi Playground";
  public static readonly BASE_WIDTH: number = 1600;
  public static readonly BASE_HEIGHT: number = 900;
}