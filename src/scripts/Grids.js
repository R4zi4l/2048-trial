import { PLAYFIELD_ROWS, PLAYFIELD_COLUMNS, ANIMATION_MOVE_DELAY, ANIMATION_CREATE_DELAY } from "./defines.js";
import { GridIterator } from "./GridIterators.js";


class Grid {
  constructor() {
    this.grid = new Array(PLAYFIELD_ROWS * PLAYFIELD_COLUMNS);
  }

  cell(x, y, value) {
    return value === undefined ? this.grid[x * PLAYFIELD_ROWS + y] : (this.grid[x * PLAYFIELD_ROWS + y] = value);
  }

  filter(callback) {
    return this.grid.filter(callback);
  }
}


class ElementGrid extends Grid {
  createElement(tag, className, parent) {
    const element = document.createElement(tag);
    element.className = className;
    parent.append(element);
    return element;
  }
}


export class BackGrid extends ElementGrid {
  constructor(root) {
    super();

    this.root = root;

    for (let j = 0; j < PLAYFIELD_ROWS; ++j) {
      const row = this.createElement("div", "row", root);

      for (let i = 0; i < PLAYFIELD_COLUMNS; ++i) {
        this.cell(i, j, this.createElement("div", "back", row));
      }
    }
  }
}


export class TileGrid extends ElementGrid {
  constructor(root) {
    super();

    this.root = root;
  }

  async createTile(cell, backs) {
    const back = backs.cell(cell.x, cell.y);
    const tile = this.createElement("div", "tile t" + cell.value, this.root);
    
    tile.textContent = cell.value || "";
    tile.style.left = back.offsetLeft + "px";
    tile.style.top = back.offsetTop + "px";
    tile.style.width = back.offsetWidth + "px";
    tile.style.height = back.offsetHeight + "px";

    this.cell(cell.x, cell.y, tile);

    tile.style.transform = "scale(1.1)";
    await this.sleep(ANIMATION_CREATE_DELAY);

    tile.style.transform = "";
    
    return tile;
  }

  async sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async moveTile(originCell, targetCell, backs) {
    const targetBack = backs.cell(targetCell.x, targetCell.y);
    const tile = this.cell(originCell.x, originCell.y);

    tile.style.left = targetBack.offsetLeft + "px";
    tile.style.top = targetBack.offsetTop + "px";

    this.cell(originCell.x, originCell.y, null);
    this.cell(targetCell.x, targetCell.y, tile);

    await this.sleep(ANIMATION_MOVE_DELAY);
  }

  async mergeTile(originCell, targetCell, backs) {
    const targetBack = backs.cell(targetCell.x, targetCell.y);
    const originTile = this.cell(originCell.x, originCell.y);
    const targetTile = this.cell(targetCell.x, targetCell.y);

    originTile.style.left = targetBack.offsetLeft + "px";
    originTile.style.top = targetBack.offsetTop + "px";
    originTile.style.zIndex = 5;

    this.cell(originCell.x, originCell.y, null);

    await this.sleep(ANIMATION_MOVE_DELAY);

    originTile.remove();
    targetTile.textContent = targetCell.value;
    targetTile.className = "tile t" + targetCell.value;

    targetTile.style.transform = "scale(1.1)";
    await this.sleep(ANIMATION_CREATE_DELAY);

    targetTile.style.transform = "";
    await this.sleep(ANIMATION_CREATE_DELAY);
  }

  async moveField(iterator, cells, backs) {
    const heap = [];

    let cell = iterator.first(cells);

    while (cell) {
      if (cell.previousCell) {
        heap.push(this.moveTile(cell.previousCell, cell, backs));
        cell.previousCell = undefined;
      }

      if (cell.mergedCell) {
        heap.push(this.mergeTile(cell.mergedCell, cell, backs));
        cell.mergedCell = undefined;
      }

      cell = iterator.next(cells, cell);
    }

    await Promise.all(heap);
  }
}


export class CellGrid extends Grid {
  constructor(playfield) {
    super();

    this.playfield = playfield;

    for (let j = 0; j < PLAYFIELD_ROWS; ++j) {
      for (let i = 0; i < PLAYFIELD_COLUMNS; ++i) {
        this.cell(i, j, {
          x: i,
          y: j,
          value: 0,
          mergedCell: undefined,
          previousCell: undefined
        });
      }
    }
  }

  fillRandomEmptyCell() {
    const emptyCells = this.filter(cell => cell.value === 0);

    if (!emptyCells.length) {
      return undefined;
    }

    const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    cell.value = Math.random() < 0.9 ? 2 : 4;

    return cell;
  }

  shiftField(iterator) {
    let currentCell = iterator.first(this),
        nearestCell,
        shifted = false;

    while (currentCell) {
      nearestCell = iterator.nearest(this, currentCell);

      if (nearestCell && currentCell.value === 0) {
        currentCell.previousCell = nearestCell;
        currentCell.value = nearestCell.value;
        nearestCell.value = 0;
        shifted = true;

      } else if (nearestCell && currentCell.value === nearestCell.value) {
        currentCell.mergedCell = nearestCell;
        currentCell.value *= 2;
        this.playfield.scoreAmount += currentCell.value;
        
        nearestCell.value = 0;
        shifted = true;
        currentCell = iterator.next(this, currentCell);

      } else {
        currentCell = iterator.next(this, currentCell);
      }
    }

    return shifted;
  }

  isShiftable() {
    for (let j = 0; j < PLAYFIELD_ROWS; ++j) {
      for (let i = 0; i < PLAYFIELD_COLUMNS; ++i) {
        if (GridIterator.isShiftable(this, this.cell(i, j))) {
          return true;
        }
      }
    }

    return false;
  }
}
