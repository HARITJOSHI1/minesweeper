import React, { useEffect, useState } from "react";
import { NumberDisplay } from "../NumberDisplay";
import {
  generateCells,
  CELL,
  openMultipleCells,
} from "../../utils/generateCells";
import { Button } from "../Button";
import { Face, cellState, cellValues } from "../../types";
import { MAX_COLS, MAX_ROWS, NUM_BOMBS } from "../../constants";
import "./App.scss";

export const App: React.FC = () => {
  const [cells, setCells] = useState<CELL[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.smile);
  const [time, setTime] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);
  const [bombsLeft, setBombsLeft] = useState<number>(NUM_BOMBS);
  const [hasLost, setLost] = useState<boolean>(false);
  const [hasWon, setWon] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (live && time < 999) {
      timer = setInterval(() => {
        setTime((time) => (time += 1));
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    } else {
      clearInterval(timer);
      setLive(false);
    }
  }, [live, time]);


  useEffect(() => {
    if (hasLost) {
      setLive(false);
      setFace(Face.lost);
      setCells(showAllBombs());
    }
  }, [hasLost]);

  useEffect(() => {
    if (hasWon) {
      setLive(false);
      setFace(Face.won);
    }
  }, [hasWon]);

  const gameStartEvent = (row: number, col: number): boolean => {
    if (hasLost || hasWon) return false;
    setLive(true);
    return true;
  };

  const gameLogic = (row: number, col: number) => {
    let newCells = cells.slice();
    const currentCell = cells[row][col];
    if ([cellState.flagged, cellState.visible].includes(currentCell.state))
      return;
    if (currentCell.value === cellValues.bomb) {
      currentCell.red = true;
      setLost(true);
    } else if (currentCell.value === cellValues.none)
      newCells = openMultipleCells(cells, row, col);
    else {
      newCells[row][col].state = cellState.visible;
    }

    let safeOpenCellExists = false;

    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const currentCell = newCells[row][col];
        if (
          currentCell.value !== cellValues.bomb &&
          currentCell.state === cellState.open
        ) {
          safeOpenCellExists = true;
          break;
        }
      }
    }

    if(!safeOpenCellExists){
      newCells.forEach((r) => r.forEach(c => {
        if(c.value === cellValues.bomb){
          c.state = cellState.flagged;
        }
      }));

      setWon(true);
    }

    setCells(newCells);

  };

  const handleReset = () => {
    setLive(false);
    setTime(0);
    setLost(false);
    setFace(Face.smile);
    setBombsLeft(NUM_BOMBS);
    setCells(generateCells());
  };

  const showFlag = (row: number, col: number) => {
    if (!live) return;
    if (bombsLeft === 0) return;

    if (cells[row][col].state === cellState.flagged) {
      cells[row][col].state = cellState.open;
      setCells(cells);
      setBombsLeft(bombsLeft + 1);
    } else if (cells[row][col].state === cellState.visible) return;
    else if (cells[row][col].state === cellState.open) {
      cells[row][col].state = cellState.flagged;
      setCells(cells);
      setBombsLeft(bombsLeft - 1);
    }
  };

  const renderCells = () =>
    cells.map((r: CELL[], rdx: number) =>
      r.map((c: CELL, cdx: number) => (
        <Button
          cells={cells}
          showFlag={showFlag}
          gameLogic={gameLogic}
          hasWon={hasWon}
          hasLost={hasLost}
          gameStartEvent={gameStartEvent}
          changeFace={setFace}
          key={`${rdx}-${cdx}`}
          row={rdx}
          col={cdx}
          state={c.state}
          value={c.value}
        />
      ))
    );

  const showAllBombs = (): CELL[][] => {
    const currentCells = cells.slice();
    return currentCells.map((row) =>
      row.map((cell) => {
        if (cell.value === cellValues.bomb) {
          return {
            ...cell,
            state: cellState.visible,
          };
        }

        return cell;
      })
    );
  };

  return (
    <div className="App">
      <div className="Header">
        <NumberDisplay value={bombsLeft} />
        <div onClick={handleReset} className="Face">
          <span role="img" aria-label="face">
            {face}
          </span>
        </div>
        <NumberDisplay value={time} />
      </div>

      <div className="Body">{renderCells()}</div>
    </div>
  );
};
