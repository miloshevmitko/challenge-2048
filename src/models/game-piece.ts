import { cryptoRandom } from "../common/crypto-random";

/**
 * Represents a single piece in the game and it's value.
 */
export interface IGamePiece {
  /**
   * The numeric value of the game piece.
   * @type {number}
   */
  value: number;
}

export class GamePiece implements IGamePiece {
  value: number;

  /**
   * Creates a new game piece.
   * If no value is provided, the piece is initialized randomly:
   * - 90% chance of being `2`
   * - 10% chance of being `4`
   *
   * @param {number} [value] - Optional initial value for the piece.
   */
  constructor(value?: number) {
    this.value = value ?? (cryptoRandom() < 0.9 ? 2 : 4);
  }
}
