class WorldLevel {
  constructor(levelJson) {
    // A readable label for HUD.
    this.name = levelJson.name || "Level";

    // Theme defaults + override with JSON.
    this.theme = Object.assign(
      { bg: "#98ec90", platform: "#6422e0", blob: "#ff5e14" },
      levelJson.theme || {},
    );

    // Physics knobs
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Player spawn data.
    this.start = {
      x: levelJson.start?.x ?? 80,
      y: levelJson.start?.y ?? 180,
      r: levelJson.start?.r ?? 26,
    };

    // Convert raw platform objects into Platform instances.
    this.pipes = (levelJson.pipes || []).map((p) => ({ ...p }));
  }

  inferWidth(defaultW = 640) {
    if (!this.pipes.length) return defaultW;
    return max(this.pipes.map((p) => p.x + p.w));
  }

  inferHeight(defaultH = 360) {
    return defaultH;
  }

  //draw world
  drawWorld() {
    background(color(this.theme.bg));

    fill(color(this.theme.pipe));

    for (const pipe of this.pipes) {
      // Move pipes left (scroll world)
      pipe.x -= 2;

      let topH = pipe.gapY - pipe.gapH / 2;
      let bottomY = pipe.gapY + pipe.gapH / 2;

      // Draw top pipe
      rect(pipe.x, 0, pipe.w, topH);

      // Draw bottom pipe
      rect(pipe.x, bottomY, pipe.w, height - bottomY);
    }
  }
}
