import { GamePiece } from "../../src/models/game-piece";

test("piece always has value and two is more common than four", () => {
  const trials = 10000;
  let count2 = 0;
  let count4 = 0;

  for (let i = 0; i < trials; i += 1) {
    const piece = new GamePiece();
    expect([2, 4]).toContain(piece.value);

    if (piece.value === 2) count2++;
    if (piece.value === 4) count4++;
  }

  expect(count2).toBeGreaterThan(0);
  expect(count4).toBeGreaterThan(0);
  expect(count2).toBeGreaterThan(count4);
});

test("upgrade doubles the value", () => {
  const piece = new GamePiece(2);

  expect(piece.value).toBe(2);

  piece.upgrade();

  expect(piece.value).toBe(4);
});

test("clone returns independent piece with same value", () => {
  const piece = new GamePiece(4);
  const cloned = piece.clone();

  expect(cloned).not.toBe(piece);
  expect(cloned.value).toBe(4);

  cloned.upgrade();

  expect(piece.value).toBe(4);
  expect(cloned.value).toBe(8);
});
