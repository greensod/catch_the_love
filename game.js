// ===== ELEMENTS =====
let girl = document.getElementById("girl");
let boy = document.getElementById("boy");
let boyFace = document.getElementById("boy-face");
let scoreDisplay = document.getElementById("score");
let startBtn = document.getElementById("start-btn");
let caught = false; // NEW

// ===== IMAGE CHANGER =====
function changeGirl(img) {
  girl.src = "assets/" + img;
}

function changeBoy(img) {
  boyFace.src = "assets/" + img;
}

// ===== GAME STATE =====
let score = 0;
let girlTop = 0;
let fallSpeed = 2;
let boyLeft = 150;
let moveSpeed = 10;

let gameInterval = null;  // will store setInterval

// ===== RESET GAME =====
function resetGame() {
  score = 0;
  girlTop = 0;
  fallSpeed = 2;
  moveSpeed = 10;
  boyLeft = 150;

  scoreDisplay.innerText = score;
  girl.style.top = "0px";
  girl.style.left = "170px";
  boy.style.left = boyLeft + "px";
}

// ===== MODIFY GAME OVER =====
function fall() {
  girlTop += fallSpeed;
  girl.style.top = girlTop + "px";

  // Missed → Game Over
  if (girlTop > 600) {
    alert("Game Over 💔\nScore: " + score);

    clearInterval(gameInterval); // stop game loop

    // Show Start/Restart button again
    startBtn.innerText = "Restart Game 💖";
    startBtn.style.display = "block";
  }
}
// ===== BOY MOVEMENT =====
document.addEventListener("keydown", (e) => {
  if (!gameInterval) return; // ignore keypress before game starts

  if (e.key === "ArrowLeft" && boyLeft > 0) {
    boyLeft -= moveSpeed;
  }

  if (e.key === "ArrowRight" && boyLeft < 300) {
    boyLeft += moveSpeed;
  }

  boy.style.left = boyLeft + "px";
});

// ===== COLLISION DETECTION =====
function checkCatch() {
  let girlRect = girl.getBoundingClientRect();
  let boyRect = boy.getBoundingClientRect();

  // Only count if not already caught
  if (!caught &&
      girlRect.bottom >= boyRect.top &&
      girlRect.left < boyRect.right &&
      girlRect.right > boyRect.left
  ) {
    caught = true;  // mark as caught

    // Caught!
    score++;
    scoreDisplay.innerText = score;

    // Reset girl
    girlTop = 0;
    girl.style.top = "0px";
    girl.style.left = Math.random() * 340 + "px";

    // Increase difficulty
    fallSpeed += 0.3;
    moveSpeed += 0.2;

    // Allow next catch after reset
    setTimeout(() => {
      caught = false;
    }, 20); // small delay
  }
}


// ===== GAME LOOP =====
function startGame() {
  resetGame();
  if (gameInterval) clearInterval(gameInterval); // clear old interval if any

  gameInterval = setInterval(() => {
    fall();
    checkCatch();
  }, 20);
}
// ===== START / RESTART BUTTON =====
startBtn.addEventListener("click", () => {
  // Hide button when game starts
  startBtn.style.display = "none";

  // Start the game
  startGame();
});

