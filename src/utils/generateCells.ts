import { MAX_ROWS, MAX_COLS, NUM_BOMBS } from "../constants";
import { cellValues, cellState } from "../types";

export interface CELL {
  value: cellValues;
  state: cellState;
  red?: boolean;
}


const grabAllAdjacentCells = (
  cells: CELL[][],
  rowParam: number,
  colParam: number
): {
  topLeftCell: CELL | null;
  topCell: CELL | null;
  topRightCell: CELL | null;
  leftCell: CELL | null;
  rightCell: CELL | null;
  bottomLeftCell: CELL | null;
  bottomCell: CELL | null;
  bottomRightCell: CELL | null;
} => {
  const topLeftCell =
    rowParam > 0 && colParam > 0 ? cells[rowParam - 1][colParam - 1] : null;
  const topCell = rowParam > 0 ? cells[rowParam - 1][colParam] : null;
  const topRightCell =
    rowParam > 0 && colParam < MAX_COLS - 1
      ? cells[rowParam - 1][colParam + 1]
      : null;
  const leftCell = colParam > 0 ? cells[rowParam][colParam - 1] : null;
  const rightCell =
    colParam < MAX_COLS - 1 ? cells[rowParam][colParam + 1] : null;
  const bottomLeftCell =
    rowParam < MAX_ROWS - 1 && colParam > 0
      ? cells[rowParam + 1][colParam - 1]
      : null;
  const bottomCell =
    rowParam < MAX_ROWS - 1 ? cells[rowParam + 1][colParam] : null;
  const bottomRightCell =
    rowParam < MAX_ROWS - 1 && colParam < MAX_COLS - 1
      ? cells[rowParam + 1][colParam + 1]
      : null;

  return {
    topLeftCell,
    topCell,
    topRightCell,
    leftCell,
    rightCell,
    bottomLeftCell,
    bottomCell,
    bottomRightCell
  };
};

function addBombs(cells: CELL[][]) {
  let bomb = 0;
  while (bomb < NUM_BOMBS) {
    const row = Math.floor(Math.random() * MAX_ROWS);
    const col = Math.floor(Math.random() * MAX_COLS);

    const currentCell = cells[row][col];

    if (currentCell && currentCell.value !== cellValues.bomb) {
      cells = cells.map((r, rdx) =>
        r.map((cell: CELL, cdx) => {
          if (rdx === row && cdx === col)
            return { ...cell, value: cellValues.bomb };
          return cell;
        })
      );
    }

    bomb++;
  }

  return cells;
}

function countAdjBombs(cells: CELL[][]) {
  for (let row = 0; row < MAX_ROWS; row++) {
    for (let col = 0; col < MAX_COLS; col++) {
      let count = 0;
      if (!cells[row][col]) continue;
      if (cells[row][col].value === cellValues.bomb) continue;
      else {
        if (
          cells[row + 1] &&
          cells[row + 1][col].value === cellValues.bomb
        )
          count++;
        if (
          cells[row - 1]  &&
          cells[row - 1][col].value === cellValues.bomb
        )
          count++;
        if (
          cells[row][col + 1] &&
          cells[row][col + 1].value === cellValues.bomb
        )
          count++;
        if (
          cells[row][col - 1] &&
          cells[row][col - 1].value === cellValues.bomb
        )
          count++;
        if (
          cells[row + 1] && cells[row + 1][col + 1] &&
          cells[row + 1][col + 1].value === cellValues.bomb
        )
          count++;
        if (
          cells[row + 1] && cells[row + 1][col - 1] &&
          cells[row + 1][col - 1].value === cellValues.bomb
        )
          count++;
        if (
          cells[row - 1] && cells[row - 1][col + 1] &&
          cells[row - 1][col + 1].value === cellValues.bomb
        )
          count++;
        if (
          cells[row - 1] && cells[row - 1][col - 1] &&
          cells[row - 1][col - 1].value === cellValues.bomb
        )
          count++;
        
        cells[row][col].value = count;
      }
    }
  }
}

export const generateCells = () => {
  let cells: CELL[][] = [];
  let bomb = 0;
  for (let row = 0; row < MAX_ROWS; row++) {
    cells.push([]);

    for (let col = 0; col < MAX_COLS; col++) {
      cells[row].push({
        value: cellValues.none,
        state: cellState.open,
        red: false
      });
    }
  }

  cells = addBombs(cells);
  countAdjBombs(cells);

  return cells;
};


export const openMultipleCells = (cells: CELL[][], row: number, col: number) => {
  const currentCell = cells[row][col];

  if (
    currentCell.state === cellState.visible ||
    currentCell.state === cellState.flagged
  ) {
    return cells;
  }

  let newCells = cells.slice();
  newCells[row][col].state = cellState.visible;

  const {
    topLeftCell,
    topCell,
    topRightCell,
    leftCell,
    rightCell,
    bottomLeftCell,
    bottomCell,
    bottomRightCell
  } = grabAllAdjacentCells(cells, row, col);

  if (
    topLeftCell?.state === cellState.open &&
    topLeftCell.value !== cellValues.bomb
  ) {
    if (topLeftCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row - 1, col - 1);
    } else {
      newCells[row - 1][col - 1].state = cellState.visible;
    }
  }

  if (topCell?.state === cellState.open && topCell.value !== cellValues.bomb) {
    if (topCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row - 1, col);
    } else {
      newCells[row - 1][col].state = cellState.visible;
    }
  }

  if (
    topRightCell?.state === cellState.open &&
    topRightCell.value !== cellValues.bomb
  ) {
    if (topRightCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row - 1, col + 1);
    } else {
      newCells[row - 1][col + 1].state = cellState.visible;
    }
  }

  if (leftCell?.state === cellState.open && leftCell.value !== cellValues.bomb) {
    if (leftCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row, col - 1);
    } else {
      newCells[row][col - 1].state = cellState.visible;
    }
  }

  if (
    rightCell?.state === cellState.open &&
    rightCell.value !== cellValues.bomb
  ) {
    if (rightCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row, col + 1);
    } else {
      newCells[row][col + 1].state = cellState.visible;
    }
  }

  if (
    bottomLeftCell?.state === cellState.open &&
    bottomLeftCell.value !== cellValues.bomb
  ) {
    if (bottomLeftCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row + 1, col - 1);
    } else {
      newCells[row + 1][col - 1].state = cellState.visible;
    }
  }

  if (
    bottomCell?.state === cellState.open &&
    bottomCell.value !== cellValues.bomb
  ) {
    if (bottomCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row + 1, col);
    } else {
      newCells[row + 1][col].state = cellState.visible;
    }
  }

  if (
    bottomRightCell?.state === cellState.open &&
    bottomRightCell.value !== cellValues.bomb
  ) {
    if (bottomRightCell.value === cellValues.none) {
      newCells = openMultipleCells(newCells, row + 1, col + 1);
    } else {
      newCells[row + 1][col + 1].state = cellState.visible;
    }
  }

  return newCells;
}