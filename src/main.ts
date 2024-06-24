import Phaser from "phaser";
import { Scene } from "./scene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  physics: {
    default: "arcade",
    arcade: {
       gravity: { y: 300 },
    },
  },
  scene: [Scene],
  parent: "game",
  backgroundColor: "#0000FF",
  scale: {
    mode: Phaser.Scale.NONE,
  },
};

const game = new Phaser.Game(config);
