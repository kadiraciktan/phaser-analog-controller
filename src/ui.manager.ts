export class UIManager {
  texts: {
    object: Phaser.GameObjects.Text;
    x: number;
    y: number;
  }[] = [];
  private cameraEvent: Phaser.Cameras.Scene2D.Camera;
  constructor(private readonly scene: Phaser.Scene) {}

  create() {
    this.cameraEvent = this.scene.cameras.main.on(
      "prerender",
      (camera, progress, delta) => {
        const cameraOffsetX = camera.scrollX * camera.zoom;
        const cameraOffsetY = camera.scrollY * camera.zoom;

        this.texts.forEach((text) => {
          text.object.x = cameraOffsetX + text.x;
          text.object.y = cameraOffsetY + text.y;
        });
      }
    );
  }

  addText(
    text: string,
    x: number,
    y: number,
    style: Phaser.Types.GameObjects.Text.TextStyle
  ) {
    const newText = this.scene.add.text(x, y, text, style);
    this.texts.push({
      object: newText,
      x,
      y,
    });
    return newText;
  }

  destroy() {
    this.cameraEvent.removeAllListeners();
  }
}
