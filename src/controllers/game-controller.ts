import { type IGameBoard, type GridCoordinate } from "../models/game-board";
import { type IGamePiece } from "../models/game-piece";
import { type IGamePieceFactory } from "../factories/game-piece-factory";
import type { IGameRenderer } from "../renderers/game-renderer";
import { GameStatus } from "../common/game-status";

enum MoveDirection {
  Down,
  Left,
  Right,
  Up,
}

export class GameController {
  #boundOnArrowKeyDown: (event: KeyboardEvent) => void;

  #status: GameStatus | null = null;

  constructor(
    private readonly board: IGameBoard,
    private readonly pieceFactory: IGamePieceFactory,
    private readonly renderer: IGameRenderer,
    private readonly config: {
      gameWinValue: number;
      startingPieceCount: number;
    }
  ) {
    this.#boundOnArrowKeyDown = this.#onArrowKeyDown.bind(this);
  }

  startGame() {
    if (this.#status === GameStatus.InProgress) {
      throw new Error("Game already started.");
    }

    this.#placeNewPieces(this.config.startingPieceCount);
    this.renderer.renderBoard(this.board);
    document.addEventListener("keydown", this.#boundOnArrowKeyDown);
  }

  #placeNewPieces(count: number) {
    for (const coordinate of this.board.getRandomEmptyCoordinates(count)) {
      this.board.placeGamePiece(this.pieceFactory.createPiece(), coordinate);
    }
  }

  #onArrowKeyDown(event: KeyboardEvent) {
    let direction: MoveDirection | null = null;

    switch (event.key) {
      case "ArrowDown":
        direction = MoveDirection.Down;
        break;
      case "ArrowLeft":
        direction = MoveDirection.Left;
        break;
      case "ArrowRight":
        direction = MoveDirection.Right;
        break;
      case "ArrowUp":
        direction = MoveDirection.Up;
        break;
      default:
        break;
    }

    if (direction !== null) {
      const hasMoved = this.#move(direction);
      if (hasMoved) {
        this.#placeNewPieces(1);
        this.renderer.renderBoard(this.board);
        
        if (!this.board.hasValidMoves()) {
          this.#status = GameStatus.Lost;
        }

        if (this.#status === GameStatus.Won || this.#status === GameStatus.Lost) {
          document.removeEventListener("keydown", this.#boundOnArrowKeyDown);
          this.renderer.renderMessage(this.#status);
        }
      }
    }
  }

  #move(direction: MoveDirection) {
    let hasMoved = false;
    const accessSequence = this.#getBoardGridAccessSequence(direction);

    for (const coordinate of accessSequence) {
      const piece = this.board.getGamePieceByCoordinate(coordinate);

      if (!piece) continue;

      const updateInstruction = this.#getUpdateInstructionForPiece(
        piece,
        coordinate,
        direction
      );

      if (updateInstruction.mergeRequired) {
        const mergedPiece = this.pieceFactory.createPiece(piece.value * 2);

        this.board.removeGamePiece(coordinate);
        this.board.placeGamePiece(
          mergedPiece,
          updateInstruction.nextCoordinate!
        );

        if (mergedPiece.value === this.config.gameWinValue) {
          this.#status = GameStatus.Won;
        }

        hasMoved = true;
      } else if (updateInstruction.nextCoordinate) {
        this.board.moveGamePiece(coordinate, updateInstruction.nextCoordinate);
        hasMoved = true;
      }
    }

    return hasMoved;
  }

  #getBoardGridAccessSequence(direction: MoveDirection) {
    const maxCoordinate = this.board.getSize() - 1;
    const accessSequence: GridCoordinate[] = [];

    for (let rowIndex = 0; rowIndex <= maxCoordinate; rowIndex += 1) {
      for (
        let columnIndex = 0;
        columnIndex <= maxCoordinate;
        columnIndex += 1
      ) {
        accessSequence.push({
          rowIndex:
            direction === MoveDirection.Down
              ? maxCoordinate - rowIndex
              : rowIndex,
          columnIndex:
            direction === MoveDirection.Right
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
    direction: MoveDirection
  ) {
    let nextCoordinate: GridCoordinate | null = null;
    let mergeRequired = false;
    let keepSearching = true;

    while (keepSearching) {
      const candidateCoordinate = this.#updateCoordinateByDirection(
        nextCoordinate ?? currentCoordinate,
        direction
      );

      if (this.board.isValidGridCoordinate(candidateCoordinate)) {
        const candidateCoordinatePiece =
          this.board.getGamePieceByCoordinate(candidateCoordinate);

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

  #updateCoordinateByDirection(
    coordinate: GridCoordinate,
    direction: MoveDirection
  ) {
    switch (direction) {
      case MoveDirection.Down:
        return { ...coordinate, rowIndex: coordinate.rowIndex + 1 };
      case MoveDirection.Left:
        return { ...coordinate, columnIndex: coordinate.columnIndex - 1 };
      case MoveDirection.Right:
        return { ...coordinate, columnIndex: coordinate.columnIndex + 1 };
      case MoveDirection.Up:
        return { ...coordinate, rowIndex: coordinate.rowIndex - 1 };
      default:
        return coordinate;
    }
  }
}
