import { type IGameBoard } from "../models/game-board";
import { type IGamePieceFactory } from "../factories/game-piece-factory";
import { type IGameRenderer } from "../renderers/game-renderer";
import { GameStatus } from "../common/game-status";
import { ShiftDirection, ShiftDirectionMap } from "../common/shift-direction";
import type { IGameAgent } from "../ai/game-agent";

export class GameController {
  #boundOnArrowKeyDown: (event: KeyboardEvent) => void;
  #boundOnAiRecommendationClick: () => void;

  #status: GameStatus | null = null;

  constructor(
    private readonly board: IGameBoard,
    private readonly pieceFactory: IGamePieceFactory,
    private readonly renderer: IGameRenderer,
    private readonly agent: IGameAgent,
    private readonly config: {
      gameWinValue: number;
      startingPieceCount: number;
    }
  ) {
    this.#boundOnArrowKeyDown = this.#onArrowKeyDown.bind(this);
    this.#boundOnAiRecommendationClick =
      this.#onAiRecommendationClick.bind(this);
  }

  startGame() {
    if (this.#status === GameStatus.InProgress) {
      throw new Error("Game already started.");
    }

    this.#placeNewPieces(this.config.startingPieceCount);
    this.renderer.renderBoard(this.board);
    document.addEventListener("keydown", this.#boundOnArrowKeyDown);
    document
      .getElementById("ai-recommendation")
      ?.addEventListener("click", this.#boundOnAiRecommendationClick);
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
      this.#executeMove(direction);
    }
  }

  #executeMove(direction: ShiftDirection) {
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

      if (this.#status === GameStatus.Won || this.#status === GameStatus.Lost) {
        document.removeEventListener("keydown", this.#boundOnArrowKeyDown);
        document
          .getElementById("ai-recommendation")
          ?.removeEventListener("click", this.#boundOnAiRecommendationClick);
        this.renderer.renderMessage(this.#status);
      }
    }
  }

  #onAiRecommendationClick() {
    const recommendedMove = this.agent.recommendNextMove(this.board);

    if (recommendedMove != null) {
      const executeConfirmed = window.confirm(`
            The recommended move is: ${ShiftDirectionMap[recommendedMove]}.
            Would you like to execute it?
          `);

      if (executeConfirmed) {
        this.#executeMove(recommendedMove);
      }
    }
  }
}
