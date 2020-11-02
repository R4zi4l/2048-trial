import { PLAYFIELD_COLUMNS, PLAYFIELD_ROWS } from "./defines.js";


export const GridIterator = Object.freeze(Object.create(null, {
  isShiftable: {
    value: (grid, cell) => {
      return cell.value === 0
          || (cell.x < PLAYFIELD_COLUMNS - 1 && cell.value === grid.cell(cell.x + 1, cell.y).value)
          || (cell.x > 0 && cell.value === grid.cell(cell.x - 1, cell.y).value)
          || (cell.y < PLAYFIELD_ROWS - 1 && cell.value === grid.cell(cell.x, cell.y + 1).value)
          || (cell.y > 0 && cell.value === grid.cell(cell.x, cell.y - 1).value);
    }
  }
}));


export const LeftShiftIterator = Object.freeze(Object.create(GridIterator, {
  first: {
    value: grid => {
      return grid.cell(0, 0);
    }
  },

  next: {
    value: (grid, cell) => {
      if (cell.x === PLAYFIELD_COLUMNS - 1) {
        if (cell.y === PLAYFIELD_ROWS - 1) {
          return undefined;
        }

        return grid.cell(0, cell.y + 1);
      }

      return grid.cell(cell.x + 1, cell.y);
    }
  },

  nearest: {
    value: (grid, cell) => {
      let nearest = cell;

      while (nearest.x !== PLAYFIELD_COLUMNS - 1) {
        nearest = grid.cell(nearest.x + 1, nearest.y);

        if (nearest.value !== 0) {
          return nearest;
        }
      }
      return undefined;
    }
  }
}));


export const RightShiftIterator = Object.freeze(Object.create(GridIterator, {
  first: {
    value: grid => {
      return grid.cell(PLAYFIELD_COLUMNS - 1, 0);
    }
  },

  next: {
    value: (grid, cell) => {
      if (cell.x === 0) {
        if (cell.y === PLAYFIELD_ROWS - 1) {
          return undefined;
        }

        return grid.cell(PLAYFIELD_COLUMNS - 1, cell.y + 1);
      }

      return grid.cell(cell.x - 1, cell.y);
    }
  },

  nearest: {
    value: (grid, cell) => {
      let nearest = cell;

      while (nearest.x !== 0) {
        nearest = grid.cell(nearest.x - 1, nearest.y);

        if (nearest.value !== 0) {
          return nearest;
        }
      }
      return undefined;
    }
  }
}));


export const UpShiftIterator = Object.freeze(Object.create(GridIterator, {
  first: {
    value: grid => {
      return grid.cell(0, 0);
    }
  },

  next: {
    value: (grid, cell) => {
      if (cell.y === PLAYFIELD_ROWS - 1) {
        if (cell.x === PLAYFIELD_COLUMNS - 1) {
          return undefined;
        }

        return grid.cell(cell.x + 1, 0);
      }

      return grid.cell(cell.x, cell.y + 1);
    }
  },

  nearest: {
    value: (grid, cell) => {
      let nearest = cell;

      while (nearest.y !== PLAYFIELD_ROWS - 1) {
        nearest = grid.cell(nearest.x, nearest.y + 1);

        if (nearest.value !== 0) {
          return nearest;
        }
      }
      return undefined;
    }
  }
}));


export const DownShiftIterator = Object.freeze(Object.create(GridIterator, {
  first: {
    value: grid => {
      return grid.cell(0, PLAYFIELD_ROWS - 1);
    }
  },

  next: {
    value: (grid, cell) => {
      if (cell.y === 0) {
        if (cell.x === PLAYFIELD_COLUMNS - 1) {
          return undefined;
        }

        return grid.cell(cell.x + 1, PLAYFIELD_ROWS - 1);
      }

      return grid.cell(cell.x, cell.y - 1);
    }
  },

  nearest: {
    value: (grid, cell) => {
      let nearest = cell;

      while (nearest.y !== 0) {
        nearest = grid.cell(nearest.x, nearest.y - 1);

        if (nearest.value !== 0) {
          return nearest;
        }
      }
      return undefined;
    }
  }
}));
