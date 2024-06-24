export class AnalogControl {
  private circle: Phaser.Geom.Circle;
  private graphics: Phaser.GameObjects.Graphics;
  active: boolean = true;
  radius: number = 50;
  xOffset: number = 8;
  yOffset: number = -15;
  margin: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "free" =
    "bottom-left";
  private isToucahble = false;
  private isTouched = false;
  private currentWidth: number;
  private currentHeight: number;
  private eventList: Phaser.Input.InputPlugin[] = [];
  private originalPosition: Phaser.Math.Vector2;
  private moveData = {
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    x: 0,
    y: 0,
  };

  private isReleased = false;

  /**
   * @description Analog stick precision values
   */
  precision = 4;

  private cameraEvent;

  constructor(private readonly scene: Phaser.Scene) {}

  create() {
    this.currentWidth = this.scene.cameras.main.width;
    this.currentHeight = this.scene.cameras.main.height;
    this.graphics = this.scene.add.graphics();
    this.circle = new Phaser.Geom.Circle(0, 0, this.radius);

    const { x, y } = this.setStrictPosition();
    this.originalPosition = new Phaser.Math.Vector2(x, y);
    let circleMaxX = x + this.radius;
    let circleMinX = x - this.radius;
    let circleMaxY = y + this.radius;
    let circleMinY = y - this.radius;

    const onDown = this.scene.input.on("pointerdown", (pointer) => {
      if (this.margin === "free" && !this.isToucahble) {
        this.moveTo(pointer.x, pointer.y);
        this.originalPosition = new Phaser.Math.Vector2(pointer.x, pointer.y);
        const multiplier = 1.25;
        circleMaxX = pointer.x + this.radius * multiplier;
        circleMinX = pointer.x - this.radius * multiplier;
        circleMaxY = pointer.y + this.radius * multiplier;
        circleMinY = pointer.y - this.radius * multiplier;
      }
      this.isTouched = true;
      this.isToucahble = true;
      this.isReleased = false;
    });
    this.eventList.push(onDown);

    const onMove = this.scene.input.on("pointermove", (pointer) => {
      if (this.isTouched) {
        if (pointer.x < circleMaxX && pointer.x > circleMinX) {
          this.circle.x = pointer.x;
          this.moveTo(this.circle.x, this.circle.y);
        }
        if (pointer.y < circleMaxY && pointer.y > circleMinY) {
          this.circle.y = pointer.y;
          this.moveTo(this.circle.x, this.circle.y);
        }

        // X ve Y eksenlerindeki aralık değerlerini hesapla ve sınırla
        const xRange = Phaser.Math.Clamp(
          (pointer.x - this.originalPosition.x) / this.radius,
          -1,
          1
        );
        const yRange = Phaser.Math.Clamp(
          (pointer.y - this.originalPosition.y) / this.radius,
          -1,
          1
        );

        this.moveData.left = xRange < 0 ? Math.abs(xRange) : 0;
        this.moveData.right = xRange > 0 ? xRange : 0;
        this.moveData.up = yRange < 0 ? Math.abs(yRange) : 0;
        this.moveData.down = yRange > 0 ? yRange : 0;
        this.moveData.x = Number(xRange.toFixed(this.precision));
        this.moveData.y = Number(yRange.toFixed(this.precision));
        this.moveData.left = Number(this.moveData.left.toFixed(this.precision));
        this.moveData.right = Number(
          this.moveData.right.toFixed(this.precision)
        );
        this.moveData.up = Number(this.moveData.up.toFixed(this.precision));
        this.moveData.down = Number(this.moveData.down.toFixed(this.precision));
      }
    });

    this.eventList.push(onMove);

    const onUp = this.scene.input.on("pointerup", (pointer) => {
      this.isToucahble = false;
      this.isTouched = false;
      if (this.margin === "free") {
        this.graphics.clear();
      } else {
        this.moveTo(this.originalPosition.x, this.originalPosition.y);
      }
      this.moveData = {
        left: 0,
        right: 0,
        up: 0,
        down: 0,
        x: 0,
        y: 0,
      };
    });

    this.eventList.push(onUp);

    this.cameraEvent = this.scene.cameras.main.on(
      "prerender",
      (camera, progress, delta) => {
        const cameraOffsetX = camera.scrollX * camera.zoom;
        const cameraOffsetY = camera.scrollY * camera.zoom;
        this.graphics.x = cameraOffsetX;
        this.graphics.y = cameraOffsetY;
      }
    );
  }

  update() {
    if (this.isTouched) {
      this.scene.events.emit("analog-move", this.moveData);
    }

    // sadece 1 kere çalışması için
    if (!this.isReleased && !this.isTouched) {
      this.isReleased = true;
      this.scene.events.emit("analog-move", this.moveData);
    }
  }

  destroy() {
    this.graphics.destroy();
    this.eventList.forEach((event) => event.removeAllListeners());
    this.cameraEvent.removeAllListeners();
  }

  private setStrictPosition() {
    let x = this.currentWidth - this.radius + this.xOffset;
    let y = this.currentHeight - this.radius + this.yOffset;

    // xOffset and yOffset percentage
    this.xOffset = this.currentWidth * (this.xOffset / 100);
    this.yOffset = this.currentHeight * (this.yOffset / 100);

    if (this.margin === "bottom-left") {
      x = this.radius + this.xOffset;
      y = this.currentHeight - this.radius + this.yOffset;
    } else if (this.margin === "bottom-right") {
      x = this.currentWidth - this.radius + this.xOffset;
      y = this.currentHeight - this.radius + this.yOffset;
    } else if (this.margin === "top-right") {
      x = this.currentWidth - this.radius + this.xOffset;
      y = this.radius + this.yOffset;
    } else if (this.margin === "top-left") {
      x = this.radius + this.xOffset;
      y = this.radius + this.yOffset;
    }
    if (this.margin !== "free") {
      this.moveTo(x, y);
      this.isToucahble = true;
    }

    return { x, y };
  }

  private moveTo(x: number, y: number) {
    this.graphics.clear();
    this.circle.x = x;
    this.circle.y = y;
    this.graphics.fillStyle(0x000000, 0.7);
    this.graphics.fillCircleShape(this.circle);
    this.graphics.lineStyle(2, 0xffffff, 0.4);
    this.graphics.strokeCircleShape(this.circle);
  }
}
