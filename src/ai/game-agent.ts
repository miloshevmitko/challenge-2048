import { ShiftDirection } from "../common/shift-direction";
import { type IGamePieceFactory } from "../factories/game-piece-factory";
import { type IGameBoard } from "../models/game-board";
import { type IGamePiece } from "../models/game-piece";

type Config = {
  targetValue: number;
  searchDepth: number;
};

/**
 * Represents an agent capable of analyzing the current game board
 * and recommending the next move.
 *
 * Implementations of this interface encapsulate decision-making logic,
 * which may be based on heuristics, AI algorithms, or other strategies.
 */
export interface IGameAgent {
  /**
   * Analyzes the provided game board and recommends the next move.
   *
   * @param {IGameBoard} board - The current state of the game board to evaluate.
   * @returns {ShiftDirection|null} The recommended shift direction (e.g., up, down, left, right),
   * or `null` if no valid move can be determined.
   */
  recommendNextMove(board: IGameBoard): ShiftDirection | null;
}

export class GameAgent implements IGameAgent {
  #directions = [
    ShiftDirection.Down,
    ShiftDirection.Left,
    ShiftDirection.Right,
    ShiftDirection.Up,
  ];

  #weights = {
    emptyCoordinates: 350.0,
    smoothness: 3.0,
    monotonicity: 10.0,
    cornerBonus: 300.0,
    highestValue: 1.0,
  };

  #pieceFactory: IGamePieceFactory;

  #config: Config;

  constructor(pieceFactory: IGamePieceFactory, config: Config) {
    this.#pieceFactory = pieceFactory;
    this.#config = config;
  }

  recommendNextMove(board: IGameBoard): ShiftDirection | null {
    let recommendedMove: ShiftDirection | null = null;
    let bestValue = -Infinity;

    for (const direction of this.#directions) {
      const boardClone = board.clone();
      const hasMoved = boardClone.shift(direction);

      if (!hasMoved) continue;

      const value = this.#expectimaxNode(
        boardClone,
        this.#config.searchDepth,
        false
      );

      if (value > bestValue) {
        bestValue = value;
        recommendedMove = direction;
      }
    }

    return recommendedMove;
  }

  #expectimaxNode(board: IGameBoard, depth: number, isPlayerTurn: boolean) {
    if (
      depth === 0 ||
      !board.hasValidMoves() ||
      board.findMaxValueGamePiece()?.value === this.#config.targetValue
    ) {
      return this.#evaluateBoard(board);
    }

    if (isPlayerTurn) {
      let best = -Infinity;

      for (const direction of this.#directions) {
        const boardClone = board.clone();
        const hasMoved = boardClone.shift(direction);
        if (!hasMoved) continue;

        const value = this.#expectimaxNode(boardClone, depth - 1, false);
        if (value > best) best = value;
      }

      if (best === -Infinity) return this.#evaluateBoard(board);
      return best;
    } else {
      const emptyCoordinates = board.getEmptyCoordinates();

      if (emptyCoordinates.length === 0) return this.#evaluateBoard(board);

      const p2 = 0.9;
      const p4 = 0.1;
      let expected = 0;

      for (const { rowIndex, columnIndex } of emptyCoordinates) {
        const board2 = board.clone();
        board2.placeGamePiece(this.#pieceFactory.createPiece(2), {
          rowIndex,
          columnIndex,
        });

        expected +=
          (p2 / emptyCoordinates.length) *
          this.#expectimaxNode(board2, depth - 1, true);

        const board4 = board.clone();
        board4.placeGamePiece(this.#pieceFactory.createPiece(4), {
          rowIndex,
          columnIndex,
        });

        expected +=
          (p4 / emptyCoordinates.length) *
          this.#expectimaxNode(board4, depth - 1, true);
      }

      return expected;
    }
  }

  #log2or0(value: number): number {
    return value > 0 ? Math.log2(value) : 0;
  }

  #evaluateBoard(board: IGameBoard) {
    const emptyCoordinatesCount = board.getEmptyCoordinates().length;
    const highestValue = board.findMaxValueGamePiece()?.value ?? 0;
    const grid = board.getGrid();
    const gridSize = board.getSize();

    let cornerBonus = 0;

    const smoothness = this.#evaluateBoardSmoothness(board);
    const monotonicity = this.#evaluateBoardMonotonicity(board);

    if (
      grid[0][0]?.value === highestValue ||
      grid[0][gridSize - 1]?.value === highestValue ||
      grid[gridSize - 1][0]?.value === highestValue ||
      grid[gridSize - 1][gridSize - 1]?.value === highestValue
    ) {
      cornerBonus = 1;
    }

    return (
      this.#weights.emptyCoordinates * emptyCoordinatesCount +
      this.#weights.smoothness * smoothness +
      this.#weights.monotonicity * monotonicity +
      this.#weights.cornerBonus * cornerBonus +
      this.#weights.highestValue * highestValue
    );
  }

  #evaluateBoardSmoothness(board: IGameBoard): number {
    const grid = board.getGrid();
    const gridSize = board.getSize();

    let smoothness = 0;

    for (let rowIndex = 0; rowIndex < gridSize; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < gridSize; columnIndex += 1) {
        const gamePiece = grid[rowIndex][columnIndex];

        if (!gamePiece) {
          continue;
        }

        const valueLog = this.#log2or0(gamePiece.value);

        if (rowIndex + 1 < gridSize && grid[rowIndex + 1][columnIndex]) {
          smoothness -= Math.abs(
            valueLog - this.#log2or0(grid[rowIndex + 1][columnIndex]!.value)
          );
        }

        if (columnIndex + 1 < gridSize && grid[rowIndex][columnIndex + 1]) {
          smoothness -= Math.abs(
            valueLog - this.#log2or0(grid[rowIndex][columnIndex + 1]!.value)
          );
        }
      }
    }

    return smoothness;
  }

  #evaluateBoardMonotonicity(board: IGameBoard): number {
    const calcLineMonotonicity = (row: (IGamePiece | null)[]): number => {
      let inc = 0;
      let dec = 0;

      for (let i = 0; i < row.length - 1; i++) {
        const a = row[i];
        const b2 = row[i + 1];
        if (a === null || b2 === null) continue;

        const va = this.#log2or0(a.value);
        const vb = this.#log2or0(b2.value);

        if (va <= vb) inc += vb - va;
        if (va >= vb) dec += va - vb;
      }

      return Math.max(inc, dec);
    };

    const grid = board.getGrid();
    const gridSize = board.getSize();

    let monotonicity = 0;

    for (let rowIndex = 0; rowIndex < gridSize; rowIndex += 1) {
      monotonicity += calcLineMonotonicity(grid[rowIndex]);
    }

    for (let columnIndex = 0; columnIndex < gridSize; columnIndex += 1) {
      const column = [];

      for (let rowIndex = 0; rowIndex < gridSize; rowIndex += 1) {
        column.push(grid[rowIndex][columnIndex]);
      }

      monotonicity += calcLineMonotonicity(column);
    }

    return monotonicity;
  }
}
