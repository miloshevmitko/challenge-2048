import { DefaultGamePieceFactory } from "../../src/factories/game-piece-factory";
import { GameBoard } from "../../src/models/game-board";
import { GameAgent } from "../../src/ai/game-agent";
import type { ShiftDirection } from "../../src/common/shift-direction";

test("agent knows how to play the game", () => {
  const pieceFactory = new DefaultGamePieceFactory();
  const agent = new GameAgent(pieceFactory, {
    searchDepth: 4,
    targetValue: 2048,
  });
  const board = new GameBoard(4);

  board.placeGamePiece(
    pieceFactory.createPiece(),
    board.getRandomEmptyCoordinates(1)[0]
  );
  board.placeGamePiece(
    pieceFactory.createPiece(),
    board.getRandomEmptyCoordinates(1)[0]
  );

  // A reasonable number of moves to reach the 2048 tile is typically 
  // between 800 and 1500 moves, depending on skill, strategy, and luck.
  const maxIterations = 1000;
  let iterations = 0;
  let recommendedMove: ShiftDirection | null = null;

  do {
    iterations += 1;
    recommendedMove = agent.recommendNextMove(board);

    // The agent is supposed to return null when 
    // the target value is reached or no valid moves are available.
    if (recommendedMove === null) {
      console.warn("Agent returned null; stopping.");
      break;
    }

    const hasMoved = board.shift(recommendedMove);

    // If the board didn't change, the agent failed to provide a valid recommendation.
    expect(hasMoved).toBe(true);

    board.placeGamePiece(
      pieceFactory.createPiece(),
      board.getRandomEmptyCoordinates(1)[0]
    );
  } while (iterations < maxIterations);

  if (iterations >= maxIterations) {
    console.warn("Hit iteration cap; test stopping defensively.");
  }

  const maxPieceValue = board.findMaxValueGamePiece()?.value;
  expect(maxPieceValue).toBeGreaterThanOrEqual(2048);
});
