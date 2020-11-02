import { GAME_OVER_DELAY, MOUSE_MOVE_ERROR } from "./defines.js";
import { BackGrid, TileGrid, CellGrid } from "./Grids.js";
import { LeftShiftIterator, RightShiftIterator, UpShiftIterator, DownShiftIterator } from "./GridIterators.js";


export class PlayField {
  constructor(selector) {
    let root = document.getElementById(selector);

    if (root === null) {
      throw new Error("Element with id '" + selector + "' not found");
    }

    root.innerHTML = "";

    this.grid = this.createGrid();
    this.score = this.createScore();
    this.overlay = this.createOverlay();

    root.append(this.overlay);
    root.append(this.score);
    root.append(this.grid);

    let scoreAmount;

    Object.defineProperties(this, {
      scoreAmount: {
        get: () => scoreAmount,
        set: (value) => {
          scoreAmount = value;
          this.score.textContent = "Score: " + scoreAmount;
        }
      }
    });

    this.setupKeyboardListener();
    this.setupMouseListener();

    this.resetRound();
  }

  createOverlay() {
    let overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = "<h1>Game over</h1><button>Try again</button>";

    let button = overlay.querySelector("button");
    button.addEventListener("click", () => {
      this.resetRound();
    });

    return overlay;
  }

  createScore() {
    let score = document.createElement("div");
    score.className = "score"
    score.textContent = "Score: " + this.scoreAmount;

    return score;
  }

  createGrid() {
    let grid = document.createElement("div");
    grid.className = "grid";

    return grid;
  }

  setupKeyboardListener() {
    document.addEventListener("keydown", event => {
      if (this.__lock) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft": this.nextRound(LeftShiftIterator); break;
        case "ArrowRight": this.nextRound(RightShiftIterator); break;
        case "ArrowUp": this.nextRound(UpShiftIterator); break;
        case "ArrowDown": this.nextRound(DownShiftIterator); break;
      }
    });
  }

  setupMouseListener() {
    let clientX, clientY;

    this.grid.addEventListener("mousedown", event => {
      if (this.__lock) {
        return;
      }

      clientX = event.clientX;
      clientY = event.clientY;
    });

    document.addEventListener("mouseup", event => {
      if (clientX === undefined || clientY === undefined) {
        return;
      }

      clientX = event.clientX - clientX;
      clientY = event.clientY - clientY;

      if (Math.abs(clientX) > MOUSE_MOVE_ERROR || Math.abs(clientY) > MOUSE_MOVE_ERROR) {
        if (Math.abs(clientX) >= Math.abs(clientY)) {
          this.nextRound(clientX > 0 ? RightShiftIterator : LeftShiftIterator);
        } else {
          this.nextRound(clientY > 0 ? DownShiftIterator : UpShiftIterator);
        }
      }

      clientX = clientY = undefined;
    });
  }

  unlockUserInput() {  
    this.__lock = false;
  }

  lockUserInput() {
    this.__lock = true;
  }

  async resetRound() {
    this.scoreAmount = 0;

    this.grid.innerHTML = "";
    this.overlay.style.visibility = "hidden";

    this.backs = new BackGrid(this.grid);
    this.tiles = new TileGrid(this.grid);
    this.cells = new CellGrid(this);

    let cell = this.cells.fillRandomEmptyCell();
    await this.tiles.createTile(cell, this.backs);

    this.unlockUserInput();
  }

  async nextRound(iterator) {
    this.lockUserInput();

    if (!this.cells.shiftField(iterator)) {
      this.unlockUserInput();
      return;
    }
    
    await this.tiles.moveField(iterator, this.cells, this.backs);

    let cell = this.cells.fillRandomEmptyCell();
    
    if (cell) {
      await this.tiles.createTile(cell, this.backs);
    }

    if (!this.cells.isShiftable()) {
      await this.tiles.sleep(GAME_OVER_DELAY);
      this.overlay.style.visibility = "visible";
    } else {
      this.unlockUserInput();
    }
  }
}
