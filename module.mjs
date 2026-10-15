// @ts-check
import { module } from "@prisma/composer";
import kksTerminalShaderHeroService from "./service.mjs";

export default module("kks-terminal-shader-hero", ({ provision }) => {
  provision(kksTerminalShaderHeroService, { id: "kksterminalshaderhero" });
});
