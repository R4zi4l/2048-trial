import "core-js/stable";
import "regenerator-runtime/runtime";

import { PlayField } from "./PlayField.js";

document.addEventListener('DOMContentLoaded', () => {
  new PlayField("playfield");
});
