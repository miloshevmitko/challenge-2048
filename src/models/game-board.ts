import { type IGamePiece } from "./game-piece";
import { cryptoRandomInt } from "../common/crypto-random-int";
import { ShiftDirection } from "../common/shift-direction";

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
   * Retrieves all empty positions on the board.
   * @returns {GridCoordinate[]} An array of all empty coordinates.
   */
  getEmptyCoordinates(): GridCoordinate[];

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
   * Finds and returns the game piece with the highest value on the board.
   * If the board is empty, the method returns `null`.
   *
   * @returns {IGamePiece|null} The game piece with the highest value,
   * or `null` if no pieces are present on the board.
   */
  findMaxValueGamePiece(): IGamePiece | null;

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

  /**
   * Shifts all game pieces on the board in the specified direction.
   * Pieces are moved sequentially according to an access order determined
   * by the direction of the shift. During the shift:
   *
   * - Empty cells are skipped.
   * - Pieces are moved as far as possible in the given direction.
   * - If a piece encounters another piece of the same value, a merge occurs:
   *   the source piece is removed and the target piece is upgraded (its value doubled).
   *
   * @param {ShiftDirection} direction - The direction in which to shift the board
   * (e.g., up, down, left, right).
   * @returns {boolean} `true` if at least one piece was moved or merged,
   * otherwise `false`.
   */
  shift(direction: ShiftDirection): boolean;

  /**
   * Creates a deep clone of the current game board instance.
   */
  clone(): IGameBoard;
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

  getEmptyCoordinates() {
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
    const coordinates = this.getEmptyCoordinates();
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

  findMaxValueGamePiece(): IGamePiece | null {
    let maxValueGamePiece: IGamePiece | null = null;

    for (const row of this.#grid) {
      for (const gamePiece of row) {
        if (
          gamePiece &&
          (!maxValueGamePiece || gamePiece.value > maxValueGamePiece.value)
        ) {
          maxValueGamePiece = gamePiece;
        }
      }
    }

    return maxValueGamePiece;
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
          (columnIndex < lastIndex &&
            row[columnIndex]?.value === row[columnIndex + 1]?.value) ||
          (rowIndex < lastIndex &&
            row[columnIndex]?.value ===
              this.#grid[rowIndex + 1][columnIndex]?.value)
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

  shift(direction: ShiftDirection): boolean {
    let hasMoved = false;
    const accessSequence = this.#getBoardGridAccessSequence(direction);

    for (const coordinate of accessSequence) {
      const piece = this.getGamePieceByCoordinate(coordinate);

      if (!piece) continue;

      const updateInstruction = this.#getUpdateInstructionForPiece(
        piece,
        coordinate,
        direction
      );

      if (updateInstruction.nextCoordinate) {
        if (updateInstruction.mergeRequired) {
          this.removeGamePiece(coordinate);
          this.getGamePieceByCoordinate(
            updateInstruction.nextCoordinate
          )?.upgrade();
        } else {
          this.moveGamePiece(coordinate, updateInstruction.nextCoordinate);
        }

        hasMoved = true;
      }
    }

    return hasMoved;
  }

  #getBoardGridAccessSequence(direction: ShiftDirection) {
    const maxCoordinate = this.#size - 1;
    const accessSequence: GridCoordinate[] = [];

    for (let rowIndex = 0; rowIndex <= maxCoordinate; rowIndex += 1) {
      for (
        let columnIndex = 0;
        columnIndex <= maxCoordinate;
        columnIndex += 1
      ) {
        accessSequence.push({
          rowIndex:
            direction === ShiftDirection.Down
              ? maxCoordinate - rowIndex
              : rowIndex,
          columnIndex:
            direction === ShiftDirection.Right
              ? maxCoordinate - columnIndex
              : columnIndex,
        });
      }
    }

    return accessSequence;
  }

  #getUpdateInstructionForPiece(
    piece: IGamePiece,
    currentCoordinate: GridCoordinate,
    direction: ShiftDirection
  ) {
    let nextCoordinate: GridCoordinate | null = null;
    let mergeRequired = false;
    let keepSearching = true;

    while (keepSearching) {
      const candidateCoordinate = GameBoard.updateCoordinateByDirection(
        nextCoordinate ?? currentCoordinate,
        direction
      );

      if (this.isValidGridCoordinate(candidateCoordinate)) {
        const candidateCoordinatePiece =
          this.getGamePieceByCoordinate(candidateCoordinate);

        if (candidateCoordinatePiece === null) {
          nextCoordinate = candidateCoordinate;
          continue;
        }

        if (candidateCoordinatePiece.value === piece.value) {
          nextCoordinate = candidateCoordinate;
          mergeRequired = true;
        }
      }

      keepSearching = false;
    }

    return {
      nextCoordinate,
      mergeRequired,
    };
  }

  clone(): IGameBoard {
    const clonedBoard = new GameBoard(this.#size);

    for (let rowIndex = 0; rowIndex < this.#size; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < this.#size; columnIndex += 1) {
        const piece = this.#grid[rowIndex][columnIndex];

        if (piece) {
          clonedBoard.placeGamePiece(piece.clone(), {
            rowIndex,
            columnIndex,
          });
        }
      }
    }

    return clonedBoard;
  }

  static updateCoordinateByDirection(
    coordinate: GridCoordinate,
    direction: ShiftDirection
  ) {
    switch (direction) {
      case ShiftDirection.Down:
        return { ...coordinate, rowIndex: coordinate.rowIndex + 1 };
      case ShiftDirection.Left:
        return { ...coordinate, columnIndex: coordinate.columnIndex - 1 };
      case ShiftDirection.Right:
        return { ...coordinate, columnIndex: coordinate.columnIndex + 1 };
      case ShiftDirection.Up:
        return { ...coordinate, rowIndex: coordinate.rowIndex - 1 };
      default:
        return coordinate;
    }
  }
}
