import { ShiftDirection } from "../../src/common/shift-direction";
import { GameBoard } from "../../src/models/game-board";
import { GamePiece } from "../../src/models/game-piece";
import { GameRenderer } from "../../src/renderers/game-renderer";

const elementIds = {
  gameBoard: "board",
  messageBoard: "message",
};

test("renderBoard updates DOM with correct cells and pieces", () => {
  document.body.innerHTML = `<div id="${elementIds.gameBoard}"></div><div id="${elementIds.messageBoard}"></div>`;
  const boardEl = document.getElementById(elementIds.gameBoard)!;
  const messageEl = document.getElementById(elementIds.messageBoard)!;
  const renderer = new GameRenderer(boardEl, messageEl);

  const boardSize = 2;
  const board = new GameBoard(boardSize);
  renderer.renderBoard(board);

  // Check the empty board is rendered correctly.
  const cells = boardEl.querySelectorAll(".cell");
  expect(cells).toHaveLength(boardSize * 2);

  const piece1Coordinates = { rowIndex: 0, columnIndex: 1 };
  board.placeGamePiece(new GamePiece(2), piece1Coordinates);
  const piece2Coordinates = { rowIndex: 1, columnIndex: 1 };
  board.placeGamePiece(new GamePiece(2), piece2Coordinates);
  renderer.renderBoard(board);

  // Check the board with pieces is rendered correctly.
  const pieceEls = boardEl.querySelectorAll(".game-piece");
  expect(pieceEls.length).toBe(2);
  expect(pieceEls[0]!.getAttribute("data-value")).toBe("2");
  expect(pieceEls[0]!.parentElement?.getAttribute("data-coordinates")).toBe(
    `${piece1Coordinates.rowIndex},${piece1Coordinates.columnIndex}`
  );
  expect(pieceEls[1]!.getAttribute("data-value")).toBe("2");
  expect(pieceEls[1]!.parentElement?.getAttribute("data-coordinates")).toBe(
    `${piece2Coordinates.rowIndex},${piece2Coordinates.columnIndex}`
  );

  board.shift(ShiftDirection.Down);
  renderer.renderBoard(board);

  // Check the board merged the pieces correctly after shift.
  const cell1El = boardEl.querySelector(
    `[data-coordinates="${piece1Coordinates.rowIndex},${piece1Coordinates.columnIndex}"]`
  );
  expect(cell1El?.hasChildNodes()).toBe(false);
  const cell2El = boardEl.querySelector(
    `[data-coordinates="${piece2Coordinates.rowIndex},${piece2Coordinates.columnIndex}"]`
  );
  expect(cell2El?.firstElementChild?.getAttribute("data-value")).toBe("4");
});
