import { type IGamePiece } from "./game-piece";
import { cryptoRandomInt } from "../common/crypto-random-int";

/**
 * Indicates the position of a cell in the GameBoard grid.
 */
export type GridCoordinate = {
  columnIndex: number;
  rowIndex: number;
};

/**
 * Represents a square playing field consisting of a grid of cells.
 * Cells can contain a `IGamePiece` or be empty (`null`).
 * Provides methods to manage the game pieces and query the board state.
 */
export interface IGameBoard {
  /**
   * Returns the current grid of the game board.
   * @returns {Array<Array<IGamePiece|null>>} A 2D array representing the board.
   */
  getGrid(): (IGamePiece | null)[][];

  /**
   * Returns the size of the game board.
   * @returns {number} The number of rows/columns in the board.
   */
  getSize(): number;

  /**
   * Retrieves a random selection of empty positions on the board.
   * @param {number} count - The number of empty positions to return.
   * @returns {GridCoordinate[]} An array of randomly chosen empty coordinates.
   */
  getRandomEmptyCoordinates(count: number): GridCoordinate[];

  /**
   * Places a game piece at the specified coordinate.
   * @param {IGamePiece} piece - The game piece to place.
   * @param {GridCoordinate} coordinate - The target coordinate on the board.
   */
  placeGamePiece(piece: IGamePiece, coordinate: GridCoordinate): void;

  /**
   * Moves a game piece from one coordinate to another.
   * @param {GridCoordinate} fromCoordinate - The source coordinate.
   * @param {GridCoordinate} toCoordinate - The destination coordinate.
   */
  moveGamePiece(
    fromCoordinate: GridCoordinate,
    toCoordinate: GridCoordinate
  ): void;

  /**
   * Removes a game piece from the specified coordinate.
   * @param {GridCoordinate} coordinate - The coordinate to clear.
   */
  removeGamePiece(coordinate: GridCoordinate): void;

  /**
   * Retrieves the game piece at the given coordinate.
   * @param {GridCoordinate} coordinate - The coordinate to query.
   * @returns {IGamePiece|null} The game piece at the coordinate, or null if empty.
   */
  getGamePieceByCoordinate(coordinate: GridCoordinate): IGamePiece | null;

  /**
   * Checks whether a coordinate is valid within the bounds of the board.
   * @param {GridCoordinate} coordinate - The coordinate to validate.
   * @returns {boolean} True if the coordinate is within bounds, false otherwise.
   */
  isValidGridCoordinate(coordinate: GridCoordinate): boolean;

  /**
   * Determines whether there are any valid moves left on the board.
   *
   * A move is considered valid if:
   * - At least one cell is empty (`null`), allowing a new piece to be placed.
   * - Or, at least one adjacent cell (horizontally or vertically) contains
   *   the same value, meaning two pieces can be merged.
   *
   * @returns {boolean} `true` if there are valid moves available, otherwise `false`.
   */
  hasValidMoves(): boolean;
}

export class GameBoard implements IGameBoard {
  #grid: (IGamePiece | null)[][] = [];

  #size: number;

  /**
   * Creates a new game board with the given size.
   * @param {number} size - The number of rows and columns in the grid.
   */
  constructor(size: number) {
    this.#size = size;
    this.#grid = Array<Array<null>>(this.#size)
      .fill([])
      .map(() => Array<null>(this.#size).fill(null));
  }

  getGrid(): (IGamePiece | null)[][] {
    return this.#grid;
  }

  getSize(): number {
    return this.#size;
  }

  #getEmptyCoordinates() {
    const coordinates: GridCoordinate[] = [];

    for (let rowIndex = 0; rowIndex < this.#grid.length; rowIndex += 1) {
      const row = this.#grid[rowIndex];

      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        if (row[columnIndex] === null) {
          coordinates.push({ columnIndex, rowIndex });
        }
      }
    }

    return coordinates;
  }

  getRandomEmptyCoordinates(count: number): GridCoordinate[] {
    const coordinates = this.#getEmptyCoordinates();
    const randomCoordinates: GridCoordinate[] = [];

    while (randomCoordinates.length < Math.min(count, coordinates.length)) {
      const index = cryptoRandomInt(0, coordinates.length - 1);
      randomCoordinates.push(coordinates[index]);
      coordinates.splice(index, 1);
    }

    return randomCoordinates;
  }

  placeGamePiece(piece: IGamePiece, coordinate: GridCoordinate) {
    this.#grid[coordinate.rowIndex][coordinate.columnIndex] = piece;
  }

  moveGamePiece(fromCoordinate: GridCoordinate, toCoordinate: GridCoordinate) {
    const gamePiece = this.getGamePieceByCoordinate(fromCoordinate);

    if (gamePiece) {
      this.removeGamePiece(fromCoordinate);
      this.placeGamePiece(gamePiece, toCoordinate);
    }
  }

  removeGamePiece(coordinate: GridCoordinate) {
    this.#grid[coordinate.rowIndex][coordinate.columnIndex] = null;
  }

  getGamePieceByCoordinate(coordinate: GridCoordinate): IGamePiece | null {
    return this.#grid[coordinate.rowIndex][coordinate.columnIndex];
  }

  isValidGridCoordinate(coordinate: GridCoordinate): boolean {
    return (
      coordinate.rowIndex >= 0 &&
      coordinate.rowIndex < this.#size &&
      coordinate.columnIndex >= 0 &&
      coordinate.columnIndex < this.#size
    );
  }

  hasValidMoves(): boolean {
    let validMoveFound = false;
    const lastIndex = this.#size - 1;

    for (let rowIndex = 0; rowIndex < this.#size; rowIndex += 1) {
      const row = this.#grid[rowIndex];

      for (let columnIndex = 0; columnIndex < this.#size; columnIndex += 1) {
        if (row[columnIndex] === null) {
          validMoveFound = true;
        } else if (
          (columnIndex < lastIndex && row[columnIndex] === row[columnIndex + 1]) ||
          (rowIndex < lastIndex &&
            row[columnIndex] === this.#grid[rowIndex + 1][columnIndex])
        ) {
          validMoveFound = true;
        }

        if (validMoveFound) {
          break;
        }
      }
    }

    return validMoveFound;
  }
}
