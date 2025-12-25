import { type IGameBoard } from "../models/game-board";

/**
 * Responsible for rendering the game board into the DOM.
 * The `GameRenderer` takes a reference to a container element and updates
 * its HTML structure based on the current state of an `IGameBoard`.
 *
 * Each cell in the grid is represented by a `<div>` with a CSS class,
 * and game pieces are rendered as child elements with their value stored
 * in a `data-value` attribute.
 */
export interface IGameRenderer {
  /**
   * Renders the entire game board into the associated DOM element.
   * Clears any existing content and rebuilds the grid based on the
   * provided board state.
   *
   * @param {IGameBoard} board - The game board instance to render.
   */
  renderBoard(board: IGameBoard): void;
}

export class GameRenderer implements IGameRenderer {
  #classNames = {
    gameBoardGridCell: "cell",
    gamePiece: "game-piece",
  };

  /**
   * The root DOM element where the game board will be rendered.
   * @type {HTMLElement|null}
   * @private
   */
  #gameBoardEl: HTMLElement | null;

  /**
   * Creates a new renderer instance.
   *
   * @param {HTMLElement|null} gameBoardEl - The container element in which the game board
   * will be rendered. If `null`, rendering will be skipped.
   */
  constructor(gameBoardEl: HTMLElement | null) {
    this.#gameBoardEl = gameBoardEl;
  }

  renderBoard(board: IGameBoard) {
    if (!this.#gameBoardEl) return;

    this.#gameBoardEl.innerHTML = "";

    document.documentElement.style.setProperty(
      "--grid-size",
      board.getSize().toString()
    );

    for (const row of board.getGrid()) {
      for (const gamePiece of row) {
        const cellEl = document.createElement("div");
        cellEl.classList.add(this.#classNames.gameBoardGridCell);

        if (gamePiece) {
          const gamePieceEl = document.createElement("div");
          gamePieceEl.classList.add(this.#classNames.gamePiece);
          gamePieceEl.setAttribute("data-value", gamePiece.value.toString());
          cellEl.append(gamePieceEl);
        }

        this.#gameBoardEl.appendChild(cellEl);
      }
    }
  }
}
