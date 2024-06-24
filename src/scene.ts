import Phaser from "phaser";
import { AnalogControl } from "./analog.control";
import { UIManager } from "./ui.manager";

export class Scene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  inputControl = new AnalogControl(this);
  uiManager = new UIManager(this);
  constructor(config) {
    super(config);
  }

  preload() {
    this.inputControl.margin = "bottom-left";
    this.load.setBaseURL("src/assets/");
    this.load.image("ground", "platform.jpg");
    this.load.spritesheet("hero", "VirtualGuy/Idle(32x32).png", {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 9,
    });

    this.load.spritesheet("run", "VirtualGuy/Run(32x32).png", {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 10,
    });

    this.load.spritesheet("jump", "VirtualGuy/Jump(32x32).png", {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 10,
    });
  }

  create() {
    this.createLogTexts();
    this.inputControl.create();

    // create hero sprite and play idle animation add physics and collider
    const player = this.physics.add.sprite(100, 450, "hero");
    const moveSpeed = 250;
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setFrictionX(moveSpeed);
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("hero", {
        start: 0,
        end: 10,
      }),
      frameRate: 24,
      repeat: -1,
    });

    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("run", {
        start: 0,
        end: 10,
      }),
      frameRate: 24,
      repeat: -1,
    });

    player.anims.play("idle", true);

    // create platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.physics.add.collider(player, this.platforms);
    this.cameras.main.startFollow(player);

    this.events.on("analog-move", (movement) => {
      if (movement.x === 0 && movement.y === 0) {
        console.log("idle");
        player.anims.play("idle", true);
        player.setVelocityX(0);
        return;
      }
      player.anims.play("run", true);
      player.setVelocityX(movement.x * moveSpeed);

      if (player.body.touching.down) {
        player.setVelocityY(movement.y * moveSpeed * 1.25);
      }

      if (movement.left > 0) {
        // turn left animation
        player.flipX = true;
      } else if (movement.right > 0) {
        // turn right animation
        player.flipX = false;
      }
    });
  }

  update() {
    this.inputControl.update();
  }

  destroy() {
    this.inputControl.destroy();
  }

  private createLogTexts() {
    this.uiManager.create();

    const currentFPS = this.uiManager.addText("FPS: 0", 50, 30, {
      fontSize: "30px",
      color: "#FFFFFF",
    });

    // add FPS counter
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        currentFPS.setText("FPS: " + this.game.loop.actualFps.toFixed(2));
      },
    });

    const log2Text = this.uiManager.addText("log2", 50, 90, {
      fontSize: "20px",
      color: "#FFFFFF",
    });

    const deviceLogText = this.uiManager.addText("device", 50, 120, {
      fontSize: "20px",
      color: "#FFFFFF",
    });

    const device = this.game.device;
    const isAndroid = device.os.android;
    const isIOS = device.os.iOS;
    const isChrome = device.browser.chrome;
    const isSafari = device.browser.safari;

    deviceLogText.setText(
      "android : " +
        isAndroid +
        ", ios " +
        isIOS +
        ", Chrome " +
        isChrome +
        ", Safari " +
        isSafari +
        ", isPortrait " +
        screen.orientation.type
    );
  }
}
