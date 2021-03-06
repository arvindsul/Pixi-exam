import {Vector2} from "../util/Vector2";
import {Deref} from "../util/Deref";

export enum AspectRatio {
  None       = 0,
  Aspect4x3  = 1,
  Aspect3x2  = 2,
  Aspect8x5  = 3,
  Aspect16x9 = 4
}

/**
 * Detects all browser information
 */
export class Detect {
  public static readonly MAC = "mac";
  public static readonly IOS = "ios";
  public static readonly GGL = "android";
  public static readonly AMZ = "amazon";
  public static readonly FB  = "facebook";
  public static readonly WIN = "windows";
  public static readonly LNX = "linux";
  public static readonly WEB = "web";

  /**
   * True if the browser is Chrome or compatible.
   */
  public readonly isChrome: boolean;

  /**
   * True if the browser is Firefox.
   */
  public readonly isFirefox: boolean;

  /**
   * True if the browser is using the Gecko engine.
   */
  public readonly isGecko: boolean;

  /**
   * True if the browser is Internet Explorer.
   */
  public readonly isIE: boolean;

  /**
   * True if the browser is running on Kindle.
   */
  public readonly isKindle: boolean;

  /**
   * True if we are running on Opera.
   */
  public readonly isOpera: boolean;

  /**
   * True if the browser is Safari.
   */
  public readonly isSafari: boolean;

  /**
   * True if the browser is running on a WebKit browser.
   */
  public readonly isWebKit: boolean;

  /**
   * True if the browser is running on an Android device.
   */
  public readonly isAndroid: boolean;

  /**
   * True if the browser is running on any iOS device.
   */
  public readonly isIOS: boolean;

  /**
   * True if the browser is running on a mobile device.
   */
  public readonly isMobile: boolean;

  /**
   * True if the browser is running on a desktop computer.
   * @public
   * @member Detect#isDesktop
   * @type {boolean}
   */
  public readonly isDesktop: boolean;

  /**
   * True if the browser is running on an iPad.
   */
  public readonly isIPad: boolean;

  /**
   * True if the browser is running on an iPhone.
   */
  public readonly isIPhone: boolean;

  /**
   * True if the browser is running on a phone.
   */
  public readonly isPhone: boolean;

  /**
   * True if the browser is running on a tablet.
   */
  public readonly isTablet: boolean;

  /**
   * True if the browser is running on a TV.
   */
  public readonly isTV: boolean;

  /**
   * True if the browser is running on a Mac.
   */
  public readonly isMac: boolean;

  /**
   * True if the browser is running on Windows.
   */
  public readonly isWindows: boolean;

  /**
   * True if the browser is running on Linux.
   */
  public readonly isLinux: boolean;

  /**
   * True if the browser is running on Mobile in Cordova.
   */
  public readonly isHybrid: boolean;

  /**
   * Name ID of the current browser
   */
  public readonly browser: string;

  /**
   * Name ID of the current operating system
   */
  public readonly os: string;

  /**
   * Type of device browser is running on
   */
  public readonly deviceType: string;

  /**
   * Type of device model is running on
   */
  public readonly deviceModel: string;

  /**
   * Vendor of the device
   */
  public readonly deviceVendor: string;

  /**
   * True if the browser is running on a device that is wide screen ... ie 16:9, 16:10
   */
  public readonly isWidescreen: boolean;

  /**
   * Current aspect ratio of teh screen the browser is on
   */
  public readonly AspectRatio: AspectRatio;

  /**
   * Id of the current platform
   */
  public readonly PlatformId: string;

  /**
   * Current Browser user agent string
   */
  public readonly userAgent: string;
  
  constructor() {
    this.userAgent = (window.navigator && navigator.userAgent) || "";

    this.isChrome  = this.detect(/webkit\W.*(chrome|chromium)\W/i);
    this.isFirefox = this.detect(/mozilla.*\Wfirefox\W/i);
    this.isGecko   = this.detect(/mozilla(?!.*webkit).*\Wgecko\W/i);
    this.isOpera   = this.detect(/opera.*\Wpresto\W|OPR/i);
    this.isSafari  = this.detect(/webkit\W(?!.*chrome).*safari\W/i);
    this.isWebKit  = this.detect(/webkit\W/i);

    if (navigator.appName === "Microsoft Internet Explorer") {
      this.isIE = true;
    } else {
      this.isIE = this.detect(/\bTrident\b/);
    }

    this.isAndroid = this.detect(/android/i);
    this.isIOS     = this.detect(/(ipad|iphone|ipod)/i);

    this.isKindle  = this.detect(/\W(kindle|silk)\W/i);
    this.isIPad    = this.detect(/ipad/i);
    this.isIPhone  = this.detect(/iphone/i);
    this.isPhone   = this.detect(/(iphone|ipod|((?:android)?.*?mobile)|blackberry|nokia)/i);
    this.isTablet  = this.detect(/(ipad|android(?!.*mobile)|tablet)/i) || this.isKindle;
    this.isMobile  = this.isPhone || this.isTablet || this.isKindle;
    this.isDesktop = !this.isMobile;
    this.isTV      = this.detect(/googletv|sonydtv/i);

    this.isMac     = this.detect(/Mac/i);
    this.isWindows = this.detect(/(Windows|Win|windows)/i);
    this.isLinux   = this.detect(/(Linux|linux)/i);
    this.isHybrid  = this.isMobile && Deref.valid((<any>window).cordova);

    this.os           = this.getOS();
    this.browser      = this.getBrowserName();
    this.deviceType   = this.getDeviceType();
    this.deviceModel  = this.getDeviceModel();
    this.deviceVendor = this.getDeviceVendor();
    this.AspectRatio  = Detect.getAspectRatio();
    this.isWidescreen = (this.AspectRatio == AspectRatio.Aspect16x9 || this.AspectRatio == AspectRatio.Aspect8x5);
    this.PlatformId   = this.getPlatformId();

    if (!this.isMobile) {
      this.isWidescreen = true;
    }
  }

  /**
   * Returns the current viewport size.
   */
  public static getViewportSize(): Vector2 {
    return new Vector2(Math.max(document.documentElement.clientWidth,
      Math.max(window.innerWidth, window.outerWidth)),

      Math.max(document.documentElement.clientHeight,
        Math.max(window.innerHeight, window.outerHeight)));
  }

  /**
   * Returns the current viewport size.
   */
  public static getDocumentSize(): Vector2 {
    return new Vector2(Math.max(document.body.clientWidth,
      Math.max(document.body.offsetWidth,
        Math.max(document.body.scrollWidth,
          Math.max(document.documentElement.clientWidth,
            Math.max(document.documentElement.offsetWidth, document.documentElement.scrollWidth))))),

      Math.max(document.body.clientHeight,
        Math.max(document.body.offsetHeight,
          Math.max(document.body.scrollHeight,
            Math.max(document.documentElement.clientHeight,
              Math.max(document.documentElement.offsetHeight, document.documentElement.scrollHeight))))));
  }

  /**
   * Gets the given element's size
   */
  public static getElementSize(element: HTMLElement): Vector2 {
    return new Vector2(Math.max(Math.max(element.clientWidth, element.offsetWidth), element.scrollWidth),
      Math.max(Math.max(element.clientHeight, element.offsetHeight), element.scrollHeight));
  }

  /**
   * Gets the given element's scale
   */
  public static getElementScale(element: HTMLElement): Vector2 {
    const staticWidth  = element.scrollWidth;
    const staticHeight = element.scrollHeight;

    const size = Detect.getElementSize(element);
    const scale = new Vector2(1,1);

    if (size.y / staticHeight < size.x / staticWidth) {
      scale.x = scale.y = size.y / staticHeight;
    } else {
      scale.x = scale.y = size.x / staticWidth;
    }

    return scale;
  }

  /**
   * Returns the current viewport size.
   */
  public static getScreenSize(): Vector2 {
    return new Vector2(
      Math.max(window.screen.width, window.screen.availWidth),
      Math.max(window.screen.height, window.screen.availHeight));
  }

  /**
   * Returns true if the document has a scrollbar
   */
  public static hasScrollbar(): boolean {
    // The modern solution
    if (typeof window.innerWidth === 'number') {
      return window.innerWidth > document.documentElement.clientWidth
    }

    // rootElem for quirksmode
    let rootElem: any = document.documentElement || document.body;

    // Check overflow style property on body for fauxscrollbars
    let overflowStyle;

    if (typeof rootElem.currentStyle !== 'undefined') {
      overflowStyle = rootElem.currentStyle.overflow;
    }

    overflowStyle = overflowStyle || window.getComputedStyle(rootElem, '').overflow;

    // Also need to check the Y axis overflow
    let overflowYStyle;

    if (typeof rootElem.currentStyle !== 'undefined') {
      overflowYStyle = rootElem.currentStyle.overflowY;
    }

    overflowYStyle = overflowYStyle || window.getComputedStyle(rootElem, '').overflowY;

    let contentOverflows = rootElem.scrollHeight > rootElem.clientHeight;
    let overflowShown    = /^(visible|auto)$/.test(overflowStyle) || /^(visible|auto)$/.test(overflowYStyle);
    let alwaysShowScroll = overflowStyle === 'scroll' || overflowYStyle === 'scroll';

    return (contentOverflows && overflowShown) || (alwaysShowScroll)
  }

  /**
   * Detects a regex pattern in the user agent string
   */
  private detect(pattern: any): boolean {
    return (pattern).test(this.userAgent);
  }

  /**
   * Detects if WebGL is available
   */
  private static hasWebGL(): boolean {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return (gl && (gl instanceof WebGLRenderingContext));
  }

  /**
   * Get the name of the browser
   */
  private getBrowserName(): string {
    if (this.isChrome) {
      return "Chrome";
    } else if (this.isFirefox) {
      return "Firefox";
    } else if (this.isIE) {
      return "Internet Explorer";
    } else if (this.isOpera) {
      return "Opera";
    } else if (this.isSafari) {
      return "Safari";
    } else if (this.isWebKit) {
      return "Webkit";
    }
    return "Unknown";
  }

  /**
   * Get the name of the operating system
   */
  private getOS(): string {
    if (this.isIOS) {
      return "iOS";
    } else if (this.isAndroid) {
      return "Android";
    } else if (this.isMac) {
      return "macOS";
    } else if (this.isWindows) {
      return "Windows";
    } else if (this.isLinux) {
      return "Linux";
    }
    return "Unknown";
  }

  /**
   * Get the name of the device type
   */
  private getDeviceType(): string {
    if (this.isMobile) {
      if (this.isTablet) {
        return "Tablet";
      } else if (this.isPhone) {
        return "Phone";
      }
    } else if (this.isTV) {
      return "TV";
    }
    return "Desktop";
  }

  /**
   * Get the name of the device vendor
   */
  private getDeviceVendor(): string {
    if (this.isKindle) {
      return "Amazon";
    } else if (this.isIPad || this.isIPhone || this.isMac) {
      return "Apple";
    } else if (this.isTV) {
      return "TV";
    }
    return "Unknown";
  }

  /**
   * Get the aspect ratio of the screen
   */
  private static getAspectRatio(): AspectRatio {
    const width       = (window.screen.width * window.devicePixelRatio);
    const height      = (window.screen.height * window.devicePixelRatio);
    let   aspectRatio = height / width;

    if (aspectRatio < 1) {
      aspectRatio = width / height;
    }

    if (aspectRatio >= 1.7) return AspectRatio.Aspect16x9;
    if (aspectRatio >= 1.6) return AspectRatio.Aspect8x5;
    if (aspectRatio >= 1.5) return AspectRatio.Aspect3x2;

    return AspectRatio.Aspect4x3;
  }

  /**
   * Get id of the current platform
   */
  private getPlatformId(): string {
    if (this.isIOS)     return "ios";
    if (this.isMac)     return "mac";
    if (this.isKindle)  return "amazon";
    if (this.isAndroid) return "android";
    if (this.isWindows) return "windows";
    if (this.isLinux)   return "linux";
    return "unknown";
  }

  /**
   * Returns the device model
   */
  private getDeviceModel() {
    const keysPhones = Object.getOwnPropertyNames(this.deviceMatch_Phones);
    for (let i = 0; i < keysPhones.length; ++i) {
      if ((this.deviceMatch_Phones[keysPhones[i]]).test(this.userAgent)) {
        return keysPhones[i];
      }
    }
    const keysTablets = Object.getOwnPropertyNames(this.deviceMatch_Tablets);
    for (let i = 0; i < keysTablets.length; ++i) {
      if ((this.deviceMatch_Tablets[keysTablets[i]]).test(this.userAgent)) return keysTablets[i];
    }

    if (this.isMobile) {
      if (this.isPhone)  return "UnknownPhone";
      if (this.isTablet) return "UnknownTablet";
    }

    return "UnknownDesktop";
  }

  private deviceMatch_Phones: {[key: string]: RegExp} = {
    "iPhone": /\biPhone\b|\biPod\b/,
    "BlackBerry": /BlackBerry|\bBB10\b|rim[0-9]+/,
    "HTC": /HTC|HTC.*(Sensation|Evo|Vision|Explorer|6800|8100|8900|A7272|S510e|C110e|Legend|Desire|T8282)|APX515CKT|Qtek9090|APA9292KT|HD_mini|Sensation.*Z710e|PG86100|Z715e|Desire.*(A8181|HD)|ADR6200|ADR6400L|ADR6425|001HT|Inspire 4G|Android.*\bEVO\b|T-Mobile G1|Z520m|Android [0-9.]+; Pixel/,
    "Nexus": /Nexus One|Nexus S|Galaxy.*Nexus|Android.*Nexus.*Mobile|Nexus 4|Nexus 5|Nexus 6/,
    "Dell": /Dell[;]? (Streak|Aero|Venue|Venue Pro|Flash|Smoke|Mini 3iX)|XCD28|XCD35|\b001DL\b|\b101DL\b|\bGS01\b/,
    "Motorola": /Motorola|DROIDX|DROID BIONIC|\\bDroid\\b.*Build|Android.*Xoom|HRI39|MOT-|A1260|A1680|A555|A853|A855|A953|A955|A956|Motorola.*ELECTRIFY|Motorola.*i1|i867|i940|MB200|MB300|MB501|MB502|MB508|MB511|MB520|MB525|MB526|MB611|MB612|MB632|MB810|MB855|MB860|MB861|MB865|MB870|ME501|ME502|ME511|ME525|ME600|ME632|ME722|ME811|ME860|ME863|ME865|MT620|MT710|MT716|MT720|MT810|MT870|MT917|Motorola.*TITANIUM|WX435|WX445|XT300|XT301|XT311|XT316|XT317|XT319|XT320|XT390|XT502|XT530|XT531|XT532|XT535|XT603|XT610|XT611|XT615|XT681|XT701|XT702|XT711|XT720|XT800|XT806|XT860|XT862|XT875|XT882|XT883|XT894|XT901|XT907|XT909|XT910|XT912|XT928|XT926|XT915|XT919|XT925|XT1021|\\bMoto E\\b|XT1068|XT1092|XT1052/,
    "Samsung": /\bSamsung\b|SM-G950F|SM-G955F|SM-G9250|GT-19300|SGH-I337|BGT-S5230|GT-B2100|GT-B2700|GT-B2710|GT-B3210|GT-B3310|GT-B3410|GT-B3730|GT-B3740|GT-B5510|GT-B5512|GT-B5722|GT-B6520|GT-B7300|GT-B7320|GT-B7330|GT-B7350|GT-B7510|GT-B7722|GT-B7800|GT-C3010|GT-C3011|GT-C3060|GT-C3200|GT-C3212|GT-C3212I|GT-C3262|GT-C3222|GT-C3300|GT-C3300K|GT-C3303|GT-C3303K|GT-C3310|GT-C3322|GT-C3330|GT-C3350|GT-C3500|GT-C3510|GT-C3530|GT-C3630|GT-C3780|GT-C5010|GT-C5212|GT-C6620|GT-C6625|GT-C6712|GT-E1050|GT-E1070|GT-E1075|GT-E1080|GT-E1081|GT-E1085|GT-E1087|GT-E1100|GT-E1107|GT-E1110|GT-E1120|GT-E1125|GT-E1130|GT-E1160|GT-E1170|GT-E1175|GT-E1180|GT-E1182|GT-E1200|GT-E1210|GT-E1225|GT-E1230|GT-E1390|GT-E2100|GT-E2120|GT-E2121|GT-E2152|GT-E2220|GT-E2222|GT-E2230|GT-E2232|GT-E2250|GT-E2370|GT-E2550|GT-E2652|GT-E3210|GT-E3213|GT-I5500|GT-I5503|GT-I5700|GT-I5800|GT-I5801|GT-I6410|GT-I6420|GT-I7110|GT-I7410|GT-I7500|GT-I8000|GT-I8150|GT-I8160|GT-I8190|GT-I8320|GT-I8330|GT-I8350|GT-I8530|GT-I8700|GT-I8703|GT-I8910|GT-I9000|GT-I9001|GT-I9003|GT-I9010|GT-I9020|GT-I9023|GT-I9070|GT-I9082|GT-I9100|GT-I9103|GT-I9220|GT-I9250|GT-I9300|GT-I9305|GT-I9500|GT-I9505|GT-M3510|GT-M5650|GT-M7500|GT-M7600|GT-M7603|GT-M8800|GT-M8910|GT-N7000|GT-S3110|GT-S3310|GT-S3350|GT-S3353|GT-S3370|GT-S3650|GT-S3653|GT-S3770|GT-S3850|GT-S5210|GT-S5220|GT-S5229|GT-S5230|GT-S5233|GT-S5250|GT-S5253|GT-S5260|GT-S5263|GT-S5270|GT-S5300|GT-S5330|GT-S5350|GT-S5360|GT-S5363|GT-S5369|GT-S5380|GT-S5380D|GT-S5560|GT-S5570|GT-S5600|GT-S5603|GT-S5610|GT-S5620|GT-S5660|GT-S5670|GT-S5690|GT-S5750|GT-S5780|GT-S5830|GT-S5839|GT-S6102|GT-S6500|GT-S7070|GT-S7200|GT-S7220|GT-S7230|GT-S7233|GT-S7250|GT-S7500|GT-S7530|GT-S7550|GT-S7562|GT-S7710|GT-S8000|GT-S8003|GT-S8500|GT-S8530|GT-S8600|SCH-A310|SCH-A530|SCH-A570|SCH-A610|SCH-A630|SCH-A650|SCH-A790|SCH-A795|SCH-A850|SCH-A870|SCH-A890|SCH-A930|SCH-A950|SCH-A970|SCH-A990|SCH-I100|SCH-I110|SCH-I400|SCH-I405|SCH-I500|SCH-I510|SCH-I515|SCH-I600|SCH-I730|SCH-I760|SCH-I770|SCH-I830|SCH-I910|SCH-I920|SCH-I959|SCH-LC11|SCH-N150|SCH-N300|SCH-R100|SCH-R300|SCH-R351|SCH-R400|SCH-R410|SCH-T300|SCH-U310|SCH-U320|SCH-U350|SCH-U360|SCH-U365|SCH-U370|SCH-U380|SCH-U410|SCH-U430|SCH-U450|SCH-U460|SCH-U470|SCH-U490|SCH-U540|SCH-U550|SCH-U620|SCH-U640|SCH-U650|SCH-U660|SCH-U700|SCH-U740|SCH-U750|SCH-U810|SCH-U820|SCH-U900|SCH-U940|SCH-U960|SCS-26UC|SGH-A107|SGH-A117|SGH-A127|SGH-A137|SGH-A157|SGH-A167|SGH-A177|SGH-A187|SGH-A197|SGH-A227|SGH-A237|SGH-A257|SGH-A437|SGH-A517|SGH-A597|SGH-A637|SGH-A657|SGH-A667|SGH-A687|SGH-A697|SGH-A707|SGH-A717|SGH-A727|SGH-A737|SGH-A747|SGH-A767|SGH-A777|SGH-A797|SGH-A817|SGH-A827|SGH-A837|SGH-A847|SGH-A867|SGH-A877|SGH-A887|SGH-A897|SGH-A927|SGH-B100|SGH-B130|SGH-B200|SGH-B220|SGH-C100|SGH-C110|SGH-C120|SGH-C130|SGH-C140|SGH-C160|SGH-C170|SGH-C180|SGH-C200|SGH-C207|SGH-C210|SGH-C225|SGH-C230|SGH-C417|SGH-C450|SGH-D307|SGH-D347|SGH-D357|SGH-D407|SGH-D415|SGH-D780|SGH-D807|SGH-D980|SGH-E105|SGH-E200|SGH-E315|SGH-E316|SGH-E317|SGH-E335|SGH-E590|SGH-E635|SGH-E715|SGH-E890|SGH-F300|SGH-F480|SGH-I200|SGH-I300|SGH-I320|SGH-I550|SGH-I577|SGH-I600|SGH-I607|SGH-I617|SGH-I627|SGH-I637|SGH-I677|SGH-I700|SGH-I717|SGH-I727|SGH-i747M|SGH-I777|SGH-I780|SGH-I827|SGH-I847|SGH-I857|SGH-I896|SGH-I897|SGH-I900|SGH-I907|SGH-I917|SGH-I927|SGH-I937|SGH-I997|SGH-J150|SGH-J200|SGH-L170|SGH-L700|SGH-M110|SGH-M150|SGH-M200|SGH-N105|SGH-N500|SGH-N600|SGH-N620|SGH-N625|SGH-N700|SGH-N710|SGH-P107|SGH-P207|SGH-P300|SGH-P310|SGH-P520|SGH-P735|SGH-P777|SGH-Q105|SGH-R210|SGH-R220|SGH-R225|SGH-S105|SGH-S307|SGH-T109|SGH-T119|SGH-T139|SGH-T209|SGH-T219|SGH-T229|SGH-T239|SGH-T249|SGH-T259|SGH-T309|SGH-T319|SGH-T329|SGH-T339|SGH-T349|SGH-T359|SGH-T369|SGH-T379|SGH-T409|SGH-T429|SGH-T439|SGH-T459|SGH-T469|SGH-T479|SGH-T499|SGH-T509|SGH-T519|SGH-T539|SGH-T559|SGH-T589|SGH-T609|SGH-T619|SGH-T629|SGH-T639|SGH-T659|SGH-T669|SGH-T679|SGH-T709|SGH-T719|SGH-T729|SGH-T739|SGH-T746|SGH-T749|SGH-T759|SGH-T769|SGH-T809|SGH-T819|SGH-T839|SGH-T919|SGH-T929|SGH-T939|SGH-T959|SGH-T989|SGH-U100|SGH-U200|SGH-U800|SGH-V205|SGH-V206|SGH-X100|SGH-X105|SGH-X120|SGH-X140|SGH-X426|SGH-X427|SGH-X475|SGH-X495|SGH-X497|SGH-X507|SGH-X600|SGH-X610|SGH-X620|SGH-X630|SGH-X700|SGH-X820|SGH-X890|SGH-Z130|SGH-Z150|SGH-Z170|SGH-ZX10|SGH-ZX20|SHW-M110|SPH-A120|SPH-A400|SPH-A420|SPH-A460|SPH-A500|SPH-A560|SPH-A600|SPH-A620|SPH-A660|SPH-A700|SPH-A740|SPH-A760|SPH-A790|SPH-A800|SPH-A820|SPH-A840|SPH-A880|SPH-A900|SPH-A940|SPH-A960|SPH-D600|SPH-D700|SPH-D710|SPH-D720|SPH-I300|SPH-I325|SPH-I330|SPH-I350|SPH-I500|SPH-I600|SPH-I700|SPH-L700|SPH-M100|SPH-M220|SPH-M240|SPH-M300|SPH-M305|SPH-M320|SPH-M330|SPH-M350|SPH-M360|SPH-M370|SPH-M380|SPH-M510|SPH-M540|SPH-M550|SPH-M560|SPH-M570|SPH-M580|SPH-M610|SPH-M620|SPH-M630|SPH-M800|SPH-M810|SPH-M850|SPH-M900|SPH-M910|SPH-M920|SPH-M930|SPH-N100|SPH-N200|SPH-N240|SPH-N300|SPH-N400|SPH-Z400|SWC-E100|SCH-i909|GT-N7100|GT-N7105|SCH-I535|SM-N900A|SGH-I317|SGH-T999L|GT-S5360B|GT-I8262|GT-S6802|GT-S6312|GT-S6310|GT-S5312|GT-S5310|GT-I9105|GT-I8510|GT-S6790N|SM-G7105|SM-N9005|GT-S5301|GT-I9295|GT-I9195|SM-C101|GT-S7392|GT-S7560|GT-B7610|GT-I5510|GT-S7582|GT-S7530E|GT-I8750|SM-G9006V|SM-G9008V|SM-G9009D|SM-G900A|SM-G900D|SM-G900F|SM-G900H|SM-G900I|SM-G900J|SM-G900K|SM-G900L|SM-G900M|SM-G900P|SM-G900R4|SM-G900S|SM-G900T|SM-G900V|SM-G900W8|SHV-E160K|SCH-P709|SCH-P729|SM-T2558|GT-I9205|SM-G9350|SM-J120F|SM-G920F|SM-G920V|SM-G930F|SM-N910C|SM-A310F|GT-I9190|SM-J500FN|SM-G903F|SM-J330F/,
    "LG": /\bLG\b;|LG[- ]?(C800|C900|E400|E610|E900|E-900|F160|F180K|F180L|F180S|730|855|L160|LS740|LS840|LS970|LU6200|MS690|MS695|MS770|MS840|MS870|MS910|P500|P700|P705|VM696|AS680|AS695|AX840|C729|E970|GS505|272|C395|E739BK|E960|L55C|L75C|LS696|LS860|P769BK|P350|P500|P509|P870|UN272|US730|VS840|VS950|LN272|LN510|LS670|LS855|LW690|MN270|MN510|P509|P769|P930|UN200|UN270|UN510|UN610|US670|US740|US760|UX265|UX840|VN271|VN530|VS660|VS700|VS740|VS750|VS910|VS920|VS930|VX9200|VX11000|AX840A|LW770|P506|P925|P999|E612|D955|D802|MS323|M257)/,
    "Sony": /SonyST|SonyLT|SonyEricsson|SonyEricssonLT15iv|LT18i|E10i|LT28h|LT26w|SonyEricssonMT27i|C5303|C6902|C6903|C6906|C6943|D2533/,
    "Asus": /Asus.*Galaxy|PadFone.*Mobile/
  };

  private deviceMatch_Tablets: {[key: string]: RegExp} = {
    "iPad": /iPad|iPad.*Mobile/,
    "NexusTablet": /Android.*Nexus[\\s]+(7|9|10)/,
    "GoogleTablet": /Android.*Pixel C/,
    "SamsungTablet": /SAMSUNG.*Tablet|Galaxy.*Tab|SC-01C|GT-P1000|GT-P1003|GT-P1010|GT-P3105|GT-P6210|GT-P6800|GT-P6810|GT-P7100|GT-P7300|GT-P7310|GT-P7500|GT-P7510|SCH-I800|SCH-I815|SCH-I905|SGH-I957|SGH-I987|SGH-T849|SGH-T859|SGH-T869|SPH-P100|GT-P3100|GT-P3108|GT-P3110|GT-P5100|GT-P5110|GT-P6200|GT-P7320|GT-P7511|GT-N8000|GT-P8510|SGH-I497|SPH-P500|SGH-T779|SCH-I705|SCH-I915|GT-N8013|GT-P3113|GT-P5113|GT-P8110|GT-N8010|GT-N8005|GT-N8020|GT-P1013|GT-P6201|GT-P7501|GT-N5100|GT-N5105|GT-N5110|SHV-E140K|SHV-E140L|SHV-E140S|SHV-E150S|SHV-E230K|SHV-E230L|SHV-E230S|SHW-M180K|SHW-M180L|SHW-M180S|SHW-M180W|SHW-M300W|SHW-M305W|SHW-M380K|SHW-M380S|SHW-M380W|SHW-M430W|SHW-M480K|SHW-M480S|SHW-M480W|SHW-M485W|SHW-M486W|SHW-M500W|GT-I9228|SCH-P739|SCH-I925|GT-I9200|GT-P5200|GT-P5210|GT-P5210X|SM-T311|SM-T310|SM-T310X|SM-T210|SM-T210R|SM-T211|SM-P600|SM-P601|SM-P605|SM-P900|SM-P901|SM-T217|SM-T217A|SM-T217S|SM-P6000|SM-T3100|SGH-I467|XE500|SM-T110|GT-P5220|GT-I9200X|GT-N5110X|GT-N5120|SM-P905|SM-T111|SM-T2105|SM-T315|SM-T320|SM-T320X|SM-T321|SM-T520|SM-T525|SM-T530NU|SM-T230NU|SM-T330NU|SM-T900|XE500T1C|SM-P605V|SM-P905V|SM-T337V|SM-T537V|SM-T707V|SM-T807V|SM-P600X|SM-P900X|SM-T210X|SM-T230|SM-T230X|SM-T325|GT-P7503|SM-T531|SM-T330|SM-T530|SM-T705|SM-T705C|SM-T535|SM-T331|SM-T800|SM-T700|SM-T537|SM-T807|SM-P907A|SM-T337A|SM-T537A|SM-T707A|SM-T807A|SM-T237|SM-T807P|SM-P607T|SM-T217T|SM-T337T|SM-T807T|SM-T116NQ|SM-T116BU|SM-P550|SM-T350|SM-T550|SM-T9000|SM-P9000|SM-T705Y|SM-T805|GT-P3113|SM-T710|SM-T810|SM-T815|SM-T360|SM-T533|SM-T113|SM-T335|SM-T715|SM-T560|SM-T670|SM-T677|SM-T377|SM-T567|SM-T357T|SM-T555|SM-T561|SM-T713|SM-T719|SM-T813|SM-T819|SM-T580|SM-T355Y?|SM-T280|SM-T817A|SM-T820|SM-W700|SM-P580|SM-T587|SM-P350|SM-P555M|SM-P355M|SM-T113NU|SM-T815Y|SM-T585|SM-T285|SM-T825|SM-W708|SM-T835/,
    "Kindle": /Kindle|Silk.*Accelerated|Android.*\b(KFOT|KFTT|KFJWI|KFJWA|KFOTE|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|WFJWAE|KFSAWA|KFSAWI|KFASWI|KFARWI|KFFOWI|KFGIWI|KFMEWI)\b|Android.*Silk\/[0-9.]+ like Chrome\/[0-9.]+ (?!Mobile)/,
    "SurfaceTablet": /Windows NT [0-9.]+; ARM;.*(Tablet|ARMBJS)/,
    "HPTablet": /HP Slate (7|8|10)|HP ElitePad 900|hp-tablet|EliteBook.*Touch|HP 8|Slate 21|HP SlateBook 10/,
    "AsusTablet": /^.*PadFone((?!Mobile).)*$|Transformer|TF101|TF101G|TF300T|TF300TG|TF300TL|TF700T|TF700KL|TF701T|TF810C|ME171|ME301T|ME302C|ME371MG|ME370T|ME372MG|ME172V|ME173X|ME400C|Slider SL101|\\bK00F\\b|\\bK00C\\b|\\bK00E\\b|\\bK00L\\b|TX201LA|ME176C|ME102A|\\bM80TA\\b|ME372CL|ME560CG|ME372CG|ME302KL| K010 | K011 | K017 | K01E |ME572C|ME103K|ME170C|ME171C|\\bME70C\\b|ME581C|ME581CL|ME8510C|ME181C|P01Y|PO1MA|P01Z|\\bP027\\b|\\bP024\\b|\\bP00C\\b/,
    "BlackBerryTablet": /PlayBook|RIM Tablet/,
    "HTCtablet": /HTC_Flyer_P512|HTC Flyer|HTC Jetstream|HTC-P715a|HTC EVO View 4G|PG41200|PG09410/,
    "MotorolaTablet": /xoom|sholest|MZ615|MZ605|MZ505|MZ601|MZ602|MZ603|MZ604|MZ606|MZ607|MZ608|MZ609|MZ615|MZ616|MZ617/,
    "NookTablet": /Android.*Nook|NookColor|nook browser|BNRV200|BNRV200A|BNTV250|BNTV250A|BNTV400|BNTV600|LogicPD Zoom2/,
    "AcerTablet": /Android.*; \b(A100|A101|A110|A200|A210|A211|A500|A501|A510|A511|A700|A701|W500|W500P|W501|W501P|W510|W511|W700|G100|G100W|B1-A71|B1-710|B1-711|A1-810|A1-811|A1-830)\b|W3-810|\bA3-A10\b|\bA3-A11\b|\bA3-A20\b|\bA3-A30/,
    "NokiaLumiaTablet": /Lumia 2520/,
    "SonyTablet": /Sony.*Tablet|Xperia Tablet|Sony Tablet S|SO-03E|SGPT12|SGPT13|SGPT114|SGPT121|SGPT122|SGPT123|SGPT111|SGPT112|SGPT113|SGPT131|SGPT132|SGPT133|SGPT211|SGPT212|SGPT213|SGP311|SGP312|SGP321|EBRD1101|EBRD1102|EBRD1201|SGP351|SGP341|SGP511|SGP512|SGP521|SGP541|SGP551|SGP621|SGP641|SGP612|SOT31|SGP771|SGP611|SGP612|SGP712/,
    "PhilipsTablet": /\b(PI2010|PI3000|PI3100|PI3105|PI3110|PI3205|PI3210|PI3900|PI4010|PI7000|PI7100)\b/,
    "HuaweiTablet": /MediaPad|MediaPad 7 Youth|IDEOS S7|S7-201c|S7-202u|S7-101|S7-103|S7-104|S7-105|S7-106|S7-201|S7-Slim|M2-A01L|BAH-L09|BAH-W09/,
    "ViewsonicTablet": /ViewPad 10pi|ViewPad 10e|ViewPad 10s|ViewPad E72|ViewPad7|ViewPad E100|ViewPad 7e|ViewSonic VB733|VB100a/,
    "VerizonTablet": /QTAQZ3|QTAIR7|QTAQTZ3|QTASUN1|QTASUN2|QTAXIA1/
  };
}