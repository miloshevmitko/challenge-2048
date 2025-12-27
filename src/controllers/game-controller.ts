import { type IGameBoard } from "../models/game-board";
import { type IGamePieceFactory } from "../factories/game-piece-factory";
import { type IGameRenderer } from "../renderers/game-renderer";
import { GameStatus } from "../common/game-status";
import { ShiftDirection } from "../common/shift-direction";

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
    let direction: ShiftDirection | null = null;

    switch (event.key) {
      case "ArrowDown":
        direction = ShiftDirection.Down;
        break;
      case "ArrowLeft":
        direction = ShiftDirection.Left;
        break;
      case "ArrowRight":
        direction = ShiftDirection.Right;
        break;
      case "ArrowUp":
        direction = ShiftDirection.Up;
        break;
      default:
        break;
    }

    if (direction !== null) {
      const hasMoved = this.board.shift(direction);
      if (hasMoved) {
        this.#placeNewPieces(1);
        this.renderer.renderBoard(this.board);

        if (
          this.board.findMaxValueGamePiece()?.value === this.config.gameWinValue
        ) {
          this.#status = GameStatus.Won;
        } else if (!this.board.hasValidMoves()) {
          this.#status = GameStatus.Lost;
        }

        if (
          this.#status === GameStatus.Won ||
          this.#status === GameStatus.Lost
        ) {
          document.removeEventListener("keydown", this.#boundOnArrowKeyDown);
          this.renderer.renderMessage(this.#status);
        }
      }
    }
  }
}
