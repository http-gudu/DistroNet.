const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let w, h, particles, stickyParticles, floatingParticles;
let mouse = { x: null, y: null };
let resetTimer = null;
const interactionRadius = 10; // Interaction radius for cursor
const particleAmount = 500; // Total number of particles
const particleRadius = 1; // Particle size
const particleColor = "white"; // Particle color
const stickyAmount = 500; // Number of sticky particles
const floatingAmount = 20; // Number of floating particles

function init() {
  resizeReset();
  particles = createDParticles();
  stickyParticles = createStickyParticles();
  floatingParticles = createFloatingParticles();
  requestAnimationFrame(animationLoop);
}

function resizeReset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

function animationLoop() {
  ctx.clearRect(0, 0, w, h);
  drawScene();
  requestAnimationFrame(animationLoop);
}

function drawScene() {
  [...particles, ...stickyParticles, ...floatingParticles].forEach((particle) => {
    particle.draw();
    particle.update();
  });
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Create "D" shape particles with proper proportions
function createDParticles() {
  const particles = [];
  const centerX = w - 350; // Horizontal center for the curved part
  const centerY = h / 2; // Vertical center
  const verticalHeight = 400; // Total height of the "D"
  const curveRadius = verticalHeight / 2; // Radius of the curved part
  const curveWidth = 150; // Thickness of the curved part
  const verticalLineWidth = 100; // Width of the vertical line
  const verticalCenterX = centerX + getRandomNumber(-68, -52); // Random shift between -8 and -2

  // Create particles for the vertical line
  for (let i = 0; i < particleAmount * 9; i++) {
    const xOffset = getRandomNumber(-verticalLineWidth / 2, verticalLineWidth / 2);
    const x = verticalCenterX + xOffset;
    const y = centerY - verticalHeight / 2 + getRandomNumber(0, verticalHeight);
    particles.push(new Particle (x, y));
  }

  // Create particles for the curved part
  for (let i = 0; i < particleAmount * 9; i++) {
    const angle = getRandomNumber(-Math.PI / 2, Math.PI / 2);
    const r = getRandomNumber(curveRadius - curveWidth, curveRadius);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    particles.push(new Particle(x, y));
  }

  return particles;
}

function createStickyParticles() {
  const particles = [];
  const centerX = w - 350;
  const centerY = h / 2;
  const verticalHeight = 400;
  const curveRadius = verticalHeight / 2;
  const curveWidth = 150;
  const verticalLineWidth = 100;
  const verticalCenterX = centerX + getRandomNumber(-68, -52); // Random shift between -8 and -2

  // Sticky particles in the vertical line
  for (let i = 0; i < stickyAmount * 5; i++) {
    const xOffset = getRandomNumber(-verticalLineWidth / 2, verticalLineWidth / 2);
    const x = verticalCenterX + xOffset;
    const y = centerY - verticalHeight / 2 + getRandomNumber(0, verticalHeight);
    particles.push(new StickyParticle(x, y));
  }

  // Sticky particles in the curved part
  for (let i = 0; i < stickyAmount * 5; i++) {
    const angle = getRandomNumber(-Math.PI / 2, Math.PI / 2);
    const r = getRandomNumber(curveRadius - curveWidth, curveRadius);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    particles.push(new StickyParticle(x, y));
  }

  return particles;
}


function createFloatingParticles() {
  const particles = [];
  const centerX = w - 350;
  const centerY = h / 2;
  const verticalHeight = 400;
  const curveRadius = verticalHeight / 2;
  const curveWidth = 150;

  for (let i = 0; i < floatingAmount; i++) {
    const isInVertical = Math.random() < 0.3;

    let x, y;
    if (isInVertical) {
      const xOffset = getRandomNumber(-50 / 2, 50 / 2);
      x = centerX - curveRadius + xOffset + 30; // Shift closer to the curve
      y = centerY - verticalHeight / 2 + getRandomNumber(0, verticalHeight);
    } else {
      const angle = getRandomNumber(-Math.PI / 2, Math.PI / 2);
      const r = getRandomNumber(curveRadius - curveWidth, curveRadius);
      x = centerX + r * Math.cos(angle);
      y = centerY + r * Math.sin(angle);
    }

    particles.push(new FloatingParticle(x, y));
  }

  return particles;
}

// Particle classes
class Particle {
  constructor(x, y) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.radius = particleRadius;
    this.color = particleColor;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    const dx = this.originalX - this.x;
    const dy = this.originalY - this.y;

    if (Math.abs(dx) > 0.1) this.x += dx * 0.1;
    if (Math.abs(dy) > 0.1) this.y += dy * 0.1;
  }

  resetPosition() {
    this.x = this.originalX;
    this.y = this.originalY;
  }
}

class StickyParticle extends Particle {
  constructor(x, y) {
    super(x, y);
    this.stuck = false;
  }

  update() {
    if (!this.stuck) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < interactionRadius) {
        this.stuck = true;
      }
    }
  }
}

class FloatingParticle extends Particle {
  constructor(x, y) {
    super(x, y);
    this.vx = getRandomNumber(-2, -0.3); // Horizontal velocity to the left
    this.vy = getRandomNumber(-1, -0.2); // Vertical velocity upwards
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.y < 0 || this.x < 0) {
      this.x = getRandomNumber(w - 400, w - 100);
      this.y = getRandomNumber(h / 2 - 200, h / 2 + 200);
    }
  }
}

// Handle mouse hover
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  clearTimeout(resetTimer);

  particles.forEach((particle) => {
    const dx = particle.x - mouse.x;
    const dy = particle.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < interactionRadius) {
      const angle = Math.atan2(dy, dx);
      particle.x += Math.cos(angle) * 80; // Distract further
      particle.y += Math.sin(angle) * 80;
    }
  });

  resetTimer = setTimeout(() => {
    particles.forEach((particle) => particle.resetPosition());
  }, 300);
});

init();


// mousemove GSAP

document.addEventListener("DOMContentLoaded", function () {
  var main = document.querySelector(".main");
  var cursor = document.querySelector(".cursor");
  var cursor1 = document.querySelector(".cursor1");
  var cursor2 = document.querySelector(".cursor2");

  main.addEventListener("mousemove", function (dets) {
    // Fastest dot
    gsap.to(cursor, {
      x: dets.clientX,
      y: dets.clientY,
      duration: 0.5, // Shortest duration
      ease: "back.out",
    });

    // Medium-speed dot
    gsap.to(cursor1, {
      x: dets.clientX,
      y: dets.clientY,
      duration: 1, // Medium duration
      ease: "back.out",
    });

    // Slowest dot
    gsap.to(cursor2, {
      x: dets.clientX,
      y: dets.clientY,
      duration: 1.5, // Longest duration
      ease: "back.out",
    });
  });
});



const hoverText = document.getElementById('hover-text');
const videoContainer = document.getElementById('video-container');
const hoverVideo = document.getElementById('hover-video');

hoverText.addEventListener('mouseenter', () => {
    videoContainer.style.display = 'block'; // Show the video
    hoverVideo.play(); // Start playing the video
});

hoverText.addEventListener('mouseleave', () => {
    hoverVideo.pause(); // Stop playing the video
    hoverVideo.currentTime = 0; // Reset video playback
    videoContainer.style.display = 'none'; // Hide the video
});
