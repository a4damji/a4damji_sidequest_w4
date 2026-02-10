let data; // raw JSON data
let levelIndex = 0;

let world; // WorldLevel instance (current level)
let player; // BlobPlayer instance

let loss = 0;
let gameState = "start";

function preload() {
  // Load the level data from disk before setup runs.
  data = loadJSON("levels.json");
}

function setup() {
  // Create the player once (it will be respawned per level).
  player = new BlobPlayer();

  // Load the first level.
  loadLevel(0);
  // Simple shared style setup.
  noStroke();
  textFont("sans-serif");
  textSize(14);
}

function draw() {
  // draw the world
  world.drawWorld();
  fill("gold");
  rect(width - 70, 0, 70, 200);

  if (gameState === "start") {
    fill("white");
    rect(width / 2 - 150, height / 2 - 25, 250, 50);
    fill(0);
    text("Press ENTER to Start", width / 2 - 100, height / 2);
    return;
  }

  if (gameState === "playing") {
    player.update();

    if (checkPipeCollision(player, world.pipes)) {
      loss++;
      gameState = "lose";
      noLoop();
    }
  }

  player.draw(world.theme.blob);

  fill(0);
  text(world.name, 10, 18);
  text(
    "Press enter to start. Use space bar, w, or the up arrow to fly!",
    10,
    36,
  );

  //lose screen
  if (gameState === "lose") {
    fill("white");
    rect(width / 2 - 120, height / 2 - 25, 300, 90);

    fill("#6422e0");
    text("GAME OVER", width / 2 - 10, height / 2);

    fill("red");
    text("Loss count: " + loss, width / 2 - 10, height / 2 + 25);

    text("Press ENTER to restart", width / 2 - 40, height / 2 + 45);
  }
}

function keyPressed() {
  // Start or restart game
  if (keyCode === ENTER) {
    loadLevel(levelIndex);
    gameState = "playing";
    loop();
  }

  // Flap only when playing
  if (
    gameState === "playing" &&
    (key === " " || keyCode === UP_ARROW || key === "w" || key === "W")
  ) {
    player.flap();
  }
}

/*
Load a level by index:
- create a WorldLevel instance from JSON
- resize canvas based on inferred geometry
- spawn player using level start + physics
*/
function loadLevel(i) {
  levelIndex = i;

  // Create the world object from the JSON level object.
  world = new WorldLevel(data.levels[levelIndex]);

  // Fit canvas to world geometry (or defaults if needed).
  const W = world.inferWidth(640);
  const H = world.inferHeight(360);
  resizeCanvas(W, H);

  // Apply level settings + respawn.
  player.spawnFromLevel(world);
}

function checkPipeCollision(player, pipes) {
  for (const pipe of pipes) {
    let topH = pipe.gapY - pipe.gapH / 2;
    let bottomY = pipe.gapY + pipe.gapH / 2;

    // Horizontal overlap
    if (player.x + player.r > pipe.x && player.x - player.r < pipe.x + pipe.w) {
      // Hit top pipe
      if (player.y - player.r < topH) return true;

      // Hit bottom pipe
      if (player.y + player.r > bottomY) return true;
    }
  }

  return false;
}
