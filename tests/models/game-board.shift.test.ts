import { ShiftDirection } from "../../src/common/shift-direction";
import { GameBoard } from "../../src/models/game-board";
import { GamePiece } from "../../src/models/game-piece";

test("shift left merges pieces with the same values in the same row", () => {
  const board = new GameBoard(4);
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 0 });
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 2 });

  const hasMoved = board.shift(ShiftDirection.Left);
  expect(hasMoved).toBe(true);

  const row = board.getGrid()[0];
  // Expect one merged piece of value 4 at column 0, rest null
  expect(row[0]?.value).toBe(4);
  expect(row[1]).toBeNull();
  expect(row[2]).toBeNull();
  expect(row[3]).toBeNull();
});

test("shift does not merge pieces if pieces have different values", () => {
  const board = new GameBoard(4);
  board.placeGamePiece(new GamePiece(2), { rowIndex: 0, columnIndex: 0 });
  board.placeGamePiece(new GamePiece(4), { rowIndex: 0, columnIndex: 2 });

  const hasMoved = board.shift(ShiftDirection.Left);
  expect(hasMoved).toBe(true);

  const row = board.getGrid()[0];
  expect(row[0]?.value).toBe(2);
  expect(row[1]?.value).toBe(4);
  expect(row[2]).toBeNull();
  expect(row[3]).toBeNull();
});

test("shift right slides pieces to edge", () => {
  const board = new GameBoard(4);
  board.placeGamePiece(new GamePiece(2), { rowIndex: 1, columnIndex: 0 });

  const hasMoved = board.shift(ShiftDirection.Right);
  expect(hasMoved).toBe(true);

  const row = board.getGrid()[1];
  expect(row[0]).toBeNull();
  expect(row[3]?.value).toBe(2);
});
