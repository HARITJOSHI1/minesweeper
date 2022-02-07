import React from "react";
import { cellState, cellValues, Face } from "../../types";
import { CELL} from "../../utils/generateCells";
import "./Button.scss";

interface BtnProps {
  row: number;
  col: number;
  hasLost: boolean;
  gameLogic: (row: number, col: number) => void;
  hasWon: boolean;
  cells: CELL[][];
  showFlag: (row: number, col: number) => void;
  state: cellState;
  value: cellValues;
  changeFace: React.Dispatch<React.SetStateAction<Face>>;
  gameStartEvent: (row: number, col: number) => boolean;
}

export const Button: React.FC<BtnProps> = ({
  row,
  col,
  hasWon,
  hasLost,
  state,
  gameLogic,
  showFlag,
  value,
  changeFace,
  gameStartEvent,
  cells,
}) => {

  const handleClick = () => {
    if (gameStartEvent(row, col)) gameLogic(row, col);
    else if(hasWon) changeFace(Face.won);
    else changeFace(Face.lost);
  };

  const handleMouseUpDown = (face: Face) => {
    if(hasLost || hasWon) return;
    changeFace(face);
  }

  const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    showFlag(row, col);
  };

  const renderContent = (
    state: cellState,
    value: cellValues
  ): React.ReactNode => {
    if (state === cellState.visible) {
      if (value === cellValues.bomb)
        return (
          <span role="img" aria-label="bomb">
            💣
          </span>
        );
      return value === cellValues.none ? null : value;
    } else if (state === cellState.flagged)
      return (
        <span role="img" aria-label="flag">
          🚩
        </span>
      );
    else return null;
  };

  return (
    <div
      onMouseDown={handleMouseUpDown.bind(null, Face.oh)}
      onClick={handleClick}
      onMouseUp={handleMouseUpDown.bind(null, Face.smile)}
      onContextMenu={handleRightClick}
      className={`Button 
      ${
        state === cellState.visible ? "visible" : ""
      } value-${value}  
      ${cells[row][col].red? 'red' : ''}`}
    >
      {renderContent(state, value)}
    </div>
  );
};
