import { GamePiece, type IGamePiece } from "../models/game-piece";

/**
 * Defines a factory interface for creating game pieces.
 * Implementations of this interface are responsible for instantiating
 * objects that conform to the `IGamePiece` contract.
 */
export interface IGamePieceFactory {
  /**
   * Creates a new game piece instance.
   *
   * @param {number} [value] - Optional initial value for the game piece.
   * If omitted, the piece may be initialized with randomized value.
   * @returns {IGamePiece} A newly created game piece.
   */
  createPiece(value?: number): IGamePiece;
}

export class DefaultGamePieceFactory implements IGamePieceFactory {
  createPiece(value?: number): IGamePiece {
    return new GamePiece(value);
  }
}
