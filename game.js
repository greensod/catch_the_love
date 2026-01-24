// ===== ELEMENTS =====
let girl = document.getElementById("girl");
let boy = document.getElementById("boy");
let boyFace = document.getElementById("boy-face");
let scoreDisplay = document.getElementById("score");
let highScoreDisplay = document.getElementById("high-score");
let startBtn = document.getElementById("start-btn");
let livesDisplay = document.getElementById("lives");
let comboDisplay = document.getElementById("combo");

// Mobile controls
let btnLeft = document.getElementById("btn-left");
let btnRight = document.getElementById("btn-right");

// ===== SOUND EFFECTS =====
const sounds = {
  start: new Audio("assets/start.wav"),
  catch: new Audio("assets/catch.wav"),
  miss: new Audio("assets/miss.wav"),
  gameover: new Audio("assets/gameover.wav")
};

// Preload sounds
Object.values(sounds).forEach(sound => {
  sound.load();
});

function playSound(soundName) {
  const sound = sounds[soundName];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed:", e));
  }
}

// ===== IMAGE CHANGER =====
function changeGirl(img) {
  girl.src = "assets/" + img;
}

function changeBoy(img) {
  boyFace.src = "assets/" + img;
}

// ===== GAME STATE =====
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let lives = 3;
let combo = 0;
let girlTop = 0;
let fallSpeed = 2;
let boyLeft = 150;
let moveSpeed = 10;
let caught = false;
let isGameOver = false;
let gameInterval = null;
let particles = [];

// Mobile-specific
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let touchStartX = 0;
let touchCurrentX = 0;

// Display high score on load
highScoreDisplay.innerText = highScore;

// ===== RESET GAME =====
function resetGame() {
  score = 0;
  lives = 3;
  combo = 0;
  girlTop = 0;
  fallSpeed = 2;
  moveSpeed = isMobile ? 12 : 10; // Slightly faster on mobile
  boyLeft = 150;
  caught = false;
  isGameOver = false;
  particles = [];

  scoreDisplay.innerText = score;
  livesDisplay.innerText = "❤️".repeat(lives);
  comboDisplay.style.display = "none";
  girl.style.top = "0px";
  girl.style.left = Math.random() * 340 + "px";
  boy.style.left = boyLeft + "px";
  boyFace.src = "assets/boy.png";
  
  document.querySelectorAll('.particle').forEach(p => p.remove());
}

// ===== GIRL FALLING =====
function fall() {
  if (isGameOver) return;

  girlTop += fallSpeed;
  girl.style.top = girlTop + "px";

  if (girlTop > 600) {
    handleMiss();
  }
}

// ===== HANDLE MISS =====
function handleMiss() {
  playSound("miss");
  lives--;
  combo = 0;
  comboDisplay.style.display = "none";
  
  livesDisplay.innerText = "❤️".repeat(lives);
  
  document.getElementById("game").classList.add("shake");
  setTimeout(() => {
    document.getElementById("game").classList.remove("shake");
  }, 500);

  if (lives <= 0) {
    gameOver();
  } else {
    girlTop = 0;
    girl.style.top = "0px";
    girl.style.left = Math.random() * 340 + "px";
    caught = false;
  }
}

// ===== KEYBOARD MOVEMENT =====
let keysPressed = {};

document.addEventListener("keydown", (e) => {
  if (!gameInterval) return;
  keysPressed[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function moveBoyKeyboard() {
  if (keysPressed["ArrowLeft"] && boyLeft > 0) {
    boyLeft -= moveSpeed;
  }
  if (keysPressed["ArrowRight"] && boyLeft < 300) {
    boyLeft += moveSpeed;
  }
  boy.style.left = boyLeft + "px";
}

// ===== MOBILE TOUCH CONTROLS =====
let isMovingLeft = false;
let isMovingRight = false;

// Button controls
btnLeft.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isMovingLeft = true;
  btnLeft.classList.add("active");
});

btnLeft.addEventListener("touchend", (e) => {
  e.preventDefault();
  isMovingLeft = false;
  btnLeft.classList.remove("active");
});

btnRight.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isMovingRight = true;
  btnRight.classList.add("active");
});

btnRight.addEventListener("touchend", (e) => {
  e.preventDefault();
  isMovingRight = false;
  btnRight.classList.remove("active");
});

// Mouse support for desktop testing
btnLeft.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isMovingLeft = true;
  btnLeft.classList.add("active");
});

btnLeft.addEventListener("mouseup", (e) => {
  e.preventDefault();
  isMovingLeft = false;
  btnLeft.classList.remove("active");
});

btnRight.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isMovingRight = true;
  btnRight.classList.add("active");
});

btnRight.addEventListener("mouseup", (e) => {
  e.preventDefault();
  isMovingRight = false;
  btnRight.classList.remove("active");
});

// Swipe controls on game area
let gameArea = document.getElementById("game");

gameArea.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchCurrentX = touchStartX;
});

gameArea.addEventListener("touchmove", (e) => {
  if (!gameInterval) return;
  e.preventDefault();
  
  touchCurrentX = e.touches[0].clientX;
  let deltaX = touchCurrentX - touchStartX;
  
  // Direct control - move boy to touch position
  let gameRect = gameArea.getBoundingClientRect();
  let touchRelativeX = touchCurrentX - gameRect.left;
  
  // Center the boy on the touch point
  boyLeft = Math.max(0, Math.min(300, touchRelativeX - 50));
  boy.style.left = boyLeft + "px";
});

gameArea.addEventListener("touchend", (e) => {
  touchStartX = 0;
  touchCurrentX = 0;
});

function moveBoyMobile() {
  if (isMovingLeft && boyLeft > 0) {
    boyLeft -= moveSpeed;
  }
  if (isMovingRight && boyLeft < 300) {
    boyLeft += moveSpeed;
  }
  boy.style.left = boyLeft + "px";
}

// ===== COLLISION DETECTION =====
function checkCatch() {
  let girlRect = girl.getBoundingClientRect();
  let boyRect = boy.getBoundingClientRect();

  if (!caught &&
      girlRect.bottom >= boyRect.top &&
      girlRect.left < boyRect.right &&
      girlRect.right > boyRect.left
  ) {
    caught = true;
    playSound("catch");
    
    score++;
    combo++;
    
    if (combo > 1) {
      score += Math.floor(combo / 3);
    }
    
    scoreDisplay.innerText = score;
    
    if (combo > 2) {
      comboDisplay.innerText = `🔥 ${combo}x COMBO!`;
      comboDisplay.style.display = "block";
    }
    
    createParticles(girlRect.left + 30, girlRect.top + 30);
    showLoveEffect(girlRect.left - 20, girlRect.top - 50);

    girlTop = 0;
    girl.style.top = "0px";
    girl.style.left = Math.random() * 340 + "px";

    fallSpeed = Math.min(2 + score * 0.2, 8);
    moveSpeed = Math.min((isMobile ? 12 : 10) + score * 0.15, 20);

    setTimeout(() => {
      caught = false;
    }, 20);
  }
}

// ===== PARTICLE SYSTEM =====
function createParticles(x, y) {
  const colors = ['#ff69b4', '#ff1493', '#ff85c1', '#ffc0cb'];
  
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    const angle = (Math.PI * 2 * i) / 8;
    const velocity = 2 + Math.random() * 2;
    
    particle.velocityX = Math.cos(angle) * velocity;
    particle.velocityY = Math.sin(angle) * velocity;
    particle.life = 1;
    
    document.getElementById("game").appendChild(particle);
    particles.push(particle);
  }
}

function updateParticles() {
  particles = particles.filter(particle => {
    particle.life -= 0.02;
    
    if (particle.life <= 0) {
      particle.remove();
      return false;
    }
    
    const currentLeft = parseFloat(particle.style.left);
    const currentTop = parseFloat(particle.style.top);
    
    particle.style.left = (currentLeft + particle.velocityX) + "px";
    particle.style.top = (currentTop + particle.velocityY) + "px";
    particle.style.opacity = particle.life;
    particle.velocityY += 0.1;
    
    return true;
  });
}

// ===== GAME LOOP =====
function startGame() {
  resetGame();
  playSound("start");
  
  if (gameInterval) clearInterval(gameInterval);

  gameInterval = setInterval(() => {
    fall();
    checkCatch();
    moveBoyKeyboard();
    moveBoyMobile();
    updateParticles();
  }, 20);
}

// ===== START / RESTART BUTTON =====
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  startGame();
});

// ===== GAME OVER =====
function gameOver() {
  isGameOver = true;
  playSound("gameover");
  
  boyFace.src = "assets/sad.png";
  
  clearInterval(gameInterval);
  gameInterval = null;
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreDisplay.innerText = highScore;
    
    setTimeout(() => {
      alert(`🎉 NEW HIGH SCORE: ${score}! 🎉`);
    }, 300);
  } else {
    setTimeout(() => {
      alert(`💔 Game Over! Score: ${score}`);
    }, 300);
  }
  
  startBtn.innerText = "Restart Game 💖";
  startBtn.style.display = "block";
}

// ===== LOVE EFFECT =====
function showLoveEffect(x, y) {
  const hearts = ['💖', '💕', '💗', '💝'];
  const heart = document.createElement("div");
  heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
  heart.style.position = "absolute";
  heart.style.left = x + "px";
  heart.style.top = y + "px";
  heart.style.fontSize = "32px";
  heart.style.animation = "lovePop 0.8s ease-out forwards";
  heart.style.pointerEvents = "none";
  heart.style.zIndex = "100";
  document.getElementById("game").appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 800);
}