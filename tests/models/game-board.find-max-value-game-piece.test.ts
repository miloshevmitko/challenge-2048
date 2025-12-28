import { GameBoard } from "../../src/models/game-board";
import { GamePiece } from "../../src/models/game-piece";

test("returns null on empty board", () => {
  const board = new GameBoard(4);

  expect(board.findMaxValueGamePiece()).toBeNull();
});

test("returns piece with max value", () => {
  const board = new GameBoard(4);
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 0 });
  board.placeGamePiece(new GamePiece(32), { rowIndex: 1, columnIndex: 2 });
  board.placeGamePiece(new GamePiece(8), { rowIndex: 3, columnIndex: 3 });

  expect(board.findMaxValueGamePiece()?.value).toBe(32);
});
