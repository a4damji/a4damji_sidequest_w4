/*
BlobPlayer.js (Example 5)

BlobPlayer owns all "dynamic" player state:
- position (x,y), radius (r)
- velocity (vx,vy)
- movement tuning (accel, friction, max run)
- jump state (onGround)
- blob rendering animation parameters (noise wobble)

It also implements:
- update() for physics + collision against platforms
- jump() for input
- draw() for the "breathing blob" look

The algorithm is the same as the original blob world example from Week 2: 
- Apply input acceleration
- Apply friction
- Apply gravity
- Compute an AABB (box) around the blob
- Move box in X and resolve collisions
- Move box in Y and resolve collisions
- Write back box center to blob position
*/

class BlobPlayer {
  constructor() {
    // ----- Transform -----
    this.x = 0;
    this.y = 0;
    this.r = 26;

    // ----- Velocity -----
    this.vx = 0;
    this.vy = 0;

    // Physics values that are typically overridden per level.
    this.gravity = 0.65;

    // Flappy mechanics tuning
    this.fixedX = 100; // where blob stays horizontally
    this.flapStrength = -8; // upward impulse
    this.maxFall = 12; // clamp falling speed (optional)

    // ----- Blob rendering / animation -----
    this.t = 0;
    this.tSpeed = 0.01;
    this.wobble = 7;
    this.points = 48;
    this.wobbleFreq = 0.9;
  }

  /*
  Apply level settings + spawn the player.
  We reset velocities so each level starts consistently. 
  */
  spawnFromLevel(level) {
    this.gravity = level.gravity;

    this.x = this.fixedX;
    this.y = level.start.y;
    this.r = level.start.r;

    this.vx = 0;
    this.vy = 0;
  }

  /*
  Update movement + resolve collisions against all platforms.

  Input is polled with keyIsDown to get smooth movement (held keys).
  This keeps the behavior aligned with your original blob example. 
  */
  update() {
    // Apply gravity
    this.vy += this.gravity;

    // Clamp falling speed
    this.vy = constrain(this.vy, -Infinity, this.maxFall);

    // Move vertically
    this.y += this.vy;

    // Lock horizontal position
    this.x = this.fixedX;

    // Keep inside screen
    this.y = constrain(this.y, this.r, height - this.r);

    // Animate blob
    this.t += this.tSpeed;
  }

  flap() {
    this.vy = this.flapStrength;
  }
  /*
  Draw the blob with a wobbly outline:
  - we sample a noise value around the circle
  - perturb the radius slightly per vertex
  - this creates an organic "breathing"”" look

  This is the same technique as the original drawBlob() function. 
  */
  draw(colourHex) {
    fill(color(colourHex));
    beginShape();

    for (let i = 0; i < this.points; i++) {
      const a = (i / this.points) * TAU;

      // Noise input: circle coordinates + time.
      const n = noise(
        cos(a) * this.wobbleFreq + 100,
        sin(a) * this.wobbleFreq + 100,
        this.t,
      );

      // Map noise to a small radius offset.
      const rr = this.r + map(n, 0, 1, -this.wobble, this.wobble);

      // Place the vertex around the center.
      vertex(this.x + cos(a) * rr, this.y + sin(a) * rr);
    }

    endShape(CLOSE);
  }
}

/*
Collision function: AABB overlap test.
- a is the moving player "box"
- b is a platform rectangle

We accept b as either:
- a Platform instance (with x,y,w,h)
- or a plain object with x,y,w,h
This keeps it flexible. 
*/
function overlapAABB(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}
