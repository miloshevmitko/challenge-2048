/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_BOARD_GRID_SIZE: string;
  readonly VITE_GAME_BOARD_ID: string;
  readonly VITE_GAME_WIN_VALUE: string;
  readonly VITE_MESSAGE_BOARD_ID: string;
  readonly VITE_GAME_AGENT_SEARCH_DEPTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
