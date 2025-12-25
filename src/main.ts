import { GameBoard } from "./models/game-board";
import { GameController } from "./controllers/game-controller";
import { DefaultGamePieceFactory } from "./factories/game-piece-factory";
import { GameRenderer } from "./renderers/game-renderer";
import config from "./configs";

const controller = new GameController(
  new GameBoard(config.gameBoardGridSize),
  new DefaultGamePieceFactory(),
  new GameRenderer(document.getElementById(config.gameBoardId)!),
  {
    gameWinValue: config.gameWinValue,
    startingPieceCount: config.startingPieceCount,
  }
);

controller.startGame();
