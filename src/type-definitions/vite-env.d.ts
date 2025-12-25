/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_BOARD_GRID_SIZE: string;
  readonly VITE_GAME_BOARD_ID: string;
  readonly VITE_GAME_WIN_VALUE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
