import { GameBoard } from "./models/game-board";
import { GameController } from "./controllers/game-controller";
import { DefaultGamePieceFactory } from "./factories/game-piece-factory";
import { GameRenderer } from "./renderers/game-renderer";
import config from "./configs";
import { GameAgent } from "./ai/game-agent";

const gamePieceFactory = new DefaultGamePieceFactory();

const controller = new GameController(
  new GameBoard(config.gameBoardGridSize),
  gamePieceFactory,
  new GameRenderer(
    document.getElementById(config.gameBoardId),
    document.getElementById(config.messageBoardId)
  ),
  new GameAgent(gamePieceFactory, {
    searchDepth: config.gameAgentSearchDepth,
    targetValue: config.gameWinValue,
  }),
  {
    gameWinValue: config.gameWinValue,
    startingPieceCount: config.startingPieceCount,
  }
);

controller.startGame();
