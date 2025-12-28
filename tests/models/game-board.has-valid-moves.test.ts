import { GameBoard } from "../../src/models/game-board";
import { GamePiece } from "../../src/models/game-piece";

test("empty board has valid moves", () => {
  const board = new GameBoard(2);

  expect(board.hasValidMoves()).toBe(true);
});

test("full board with no possible merges has no valid moves", () => {
  const board = new GameBoard(2);
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 0 });
  board.placeGamePiece(new GamePiece(4), { rowIndex: 0, columnIndex: 1 });
  board.placeGamePiece(new GamePiece(4), { rowIndex: 1, columnIndex: 0 });
  board.placeGamePiece(new GamePiece(2), { rowIndex: 1, columnIndex: 1 });

  expect(board.hasValidMoves()).toBe(false);
});

test("adjacent pieces with equal values has valid moves", () => {
  const board = new GameBoard(2);
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 0 });
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 1 });

  expect(board.hasValidMoves()).toBe(true);
});
