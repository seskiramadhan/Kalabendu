export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.viewW = 0;
    this.viewH = 0;
  }

  setView(w, h) {
    this.viewW = w;
    this.viewH = h;
  }

  follow(target, world, snap = false) {
    const tx = target.x + target.w / 2 - this.viewW / 2;
    const ty = target.y + target.h / 2 - this.viewH / 2;
    if (snap) {
      this.x = tx;
      this.y = ty;
    } else {
      this.x += (tx - this.x) * 0.15;
      this.y += (ty - this.y) * 0.15;
    }
    this.clamp(world);
  }

  clamp(world) {
    const maxX = world.pixelWidth - this.viewW;
    const maxY = world.pixelHeight - this.viewH;
    this.x = maxX <= 0 ? maxX / 2 : Math.max(0, Math.min(this.x, maxX));
    this.y = maxY <= 0 ? maxY / 2 : Math.max(0, Math.min(this.y, maxY));
  }
}
