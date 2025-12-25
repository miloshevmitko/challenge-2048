import { cryptoRandomInt } from "../common/crypto-random-int";
import configCommon from "./config.common";

export default {
  ...configCommon,
  startingPieceCount: cryptoRandomInt(2, 6),
};
