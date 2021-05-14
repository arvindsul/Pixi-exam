import {Runtime} from "./engine/webengine";
import {PlaygroundGame} from "./PlaygroundGame"

import {Constants} from "./Constants";

console.log("---------- LOADING " + Constants.GAME_NAME.toUpperCase() + " ----------");
console.log("Build version: " + Constants.BUILD_VERSION);
console.log("Build date: " + Constants.BUILD_DATE);
console.log("Build environment: " + Constants.BUILD_ENV);

localStorage.setItem("x_offset", 350);

let container = document.getElementById("game-root");
container.hidden = false;

new Runtime(container, new PlaygroundGame()).start();