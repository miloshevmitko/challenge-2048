import devConfig from "./config.development.js";
import prodConfig from "./config.production.js";

export default import.meta.env.PROD ? prodConfig : devConfig;
