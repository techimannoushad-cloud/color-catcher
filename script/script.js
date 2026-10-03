// ============================================
// COLOR CATCHER
// ============================================


// ================================
// CANVAS
// ================================

const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext("2d");


// ================================
// HTML ELEMENTS
// ================================

const scoreElement =
    document.getElementById("score");

const comboElement =
    document.getElementById("combo");

const highScoreElement =
    document.getElementById("highScore");

const targetColorElement =
    document.getElementById("targetColor");

const targetNameElement =
    document.getElementById("targetName");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const finalScore =
    document.getElementById("finalScore");

const newBest =
    document.getElementById("newBest");


// ================================
// GAME SETTINGS
// ================================

const colors = [

    {
        name: "RED",
        value: "#ff3b5c"
    },

    {
        name: "BLUE",
        value: "#3b82ff"
    },

    {
        name: "GREEN",
        value: "#22c55e"
    },

    {
        name: "YELLOW",
        value: "#facc15"
    },

    {
        name: "PURPLE",
        value: "#a855f7"
    },

    {
        name: "CYAN",
        value: "#22d3ee"
    }

];


// ================================
// GAME VARIABLES
// ================================

let player;

let balls = [];

let particles = [];

let score = 0;

let combo = 0;

let lives = 3;

let gameRunning = false;

let animationId;

let spawnTimer = 0;

let difficulty = 1;

let targetColor;


// ================================
// HIGH SCORE
// ================================

let highScore =
    Number(localStorage.getItem("colorCatcherHighScore")) || 0;

highScoreElement.textContent = highScore;


// ================================
// CANVAS SIZE
// ================================

function resizeCanvas() {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;

    if (player) {

        player.y =
            canvas.height - 90;

    }

}

window.addEventListener(
    "resize",
    resizeCanvas
);


// ================================
// PLAYER
// ================================

function createPlayer() {

    player = {

        x: canvas.width / 2,

        y: canvas.height - 90,

        width: 95,

        height: 22,

        speed: 8,

        dx: 0

    };

}


// ================================
// CHOOSE TARGET COLOR
// ================================

function chooseTargetColor() {

    targetColor =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];

    targetColorElement.style.background =
        targetColor.value;

    targetColorElement.style.color =
        targetColor.value;

    targetNameElement.textContent =
        targetColor.name;

}


// ================================
// CREATE BALL
// ================================

function createBall() {

    const color =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];

    balls.push({

        x:
            Math.random() *
            (canvas.width - 30) + 15,

        y: -30,

        radius:
            13 + Math.random() * 7,

        speed:
            2.5 +
            Math.random() * 2 +
            difficulty * 0.25,

        color: color,

        rotation:
            Math.random() * Math.PI * 2

    });

}


// ================================
// PARTICLES
// ================================

function createParticles(x, y, color) {

    for (let i = 0; i < 18; i++) {

        particles.push({

            x: x,

            y: y,

            dx:
                (Math.random() - 0.5) * 7,

            dy:
                (Math.random() - 0.5) * 7,

            size:
                Math.random() * 4 + 2,

            life: 1,

            color: color

        });

    }

}


// ================================
// DRAW PLAYER
// ================================

function drawPlayer() {

    ctx.save();

    ctx.shadowBlur = 20;

    ctx.shadowColor = "#8b5cf6";

    ctx.fillStyle = "#ffffff";

    roundRect(
        player.x - player.width / 2,
        player.y,
        player.width,
        player.height,
        12
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#8b5cf6";

    roundRect(
        player.x - player.width / 2 + 5,
        player.y + 5,
        player.width - 10,
        player.height - 10,
        8
    );

    ctx.fill();

    ctx.restore();

}


// ================================
// DRAW BALL
// ================================

function drawBall(ball) {

    ctx.save();

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2
    );

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        ball.color.value;

    ctx.fillStyle =
        ball.color.value;

    ctx.fill();

    ctx.restore();

}


// ================================
// ROUND RECTANGLE
// ================================

function roundRect(
    x,
    y,
    width,
    height,
    radius
) {

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
    );

}


// ================================
// UPDATE BALLS
// ================================

function updateBalls() {

    for (let i = balls.length - 1; i >= 0; i--) {

        const ball = balls[i];

        ball.y += ball.speed;

        ball.rotation += 0.03;


        // ------------------------
        // COLLISION WITH PLAYER
        // ------------------------

        const hitPlayer =

            ball.y + ball.radius >= player.y &&

            ball.y - ball.radius <=
                player.y + player.height &&

            ball.x >=
                player.x - player.width / 2 &&

            ball.x <=
                player.x + player.width / 2;


        if (hitPlayer) {

            if (
                ball.color.name ===
                targetColor.name
            ) {

                // CORRECT COLOR

                score += 10;

                combo++;

                createParticles(
                    ball.x,
                    ball.y,
                    ball.color.value
                );


                // Every 5 combo = bonus

                if (combo % 5 === 0) {

                    score += 25;

                }

            } else {

                // WRONG COLOR

                lives--;

                combo = 0;

                createParticles(
                    ball.x,
                    ball.y,
                    "#ffffff"
                );

                if (lives <= 0) {

                    endGame();

                    return;

                }

            }

            balls.splice(i, 1);

            updateUI();

            continue;

        }


        // ------------------------
        // BALL MISSED
        // ------------------------

        if (
            ball.y >
            canvas.height + 50
        ) {

            if (
                ball.color.name ===
                targetColor.name
            ) {

                lives--;

                combo = 0;

                if (lives <= 0) {

                    endGame();

                    return;

                }

            }

            balls.splice(i, 1);

            updateUI();

        }

    }

}


// ================================
// UPDATE PARTICLES
// ================================

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];

        particle.x += particle.dx;

        particle.y += particle.dy;

        particle.life -= 0.03;

        if (particle.life <= 0) {

            particles.splice(i, 1);

        }

    }

}


// ================================
// DRAW PARTICLES
// ================================

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                particle.color;

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();

        }
    );

}


// ================================
// UPDATE PLAYER
// ================================

function updatePlayer() {

    player.x += player.dx;

    const halfWidth =
        player.width / 2;


    if (
        player.x - halfWidth < 0
    ) {

        player.x =
            halfWidth;

    }


    if (
        player.x + halfWidth >
        canvas.width
    ) {

        player.x =
            canvas.width - halfWidth;

    }

}


// ================================
// DRAW BACKGROUND
// ================================

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Grid

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;


    const gridSize = 50;


    for (
        let x = 0;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


// ================================
// DRAW LIVES
// ================================

function drawLives() {

    ctx.font = "22px Arial";

    ctx.textAlign = "center";

    ctx.fillStyle = "white";

    ctx.fillText(

        "❤️".repeat(lives),

        canvas.width / 2,

        canvas.height - 30

    );

}


// ================================
// SPAWN BALLS
// ================================

function spawnBalls() {

    spawnTimer++;

    const spawnRate =
        Math.max(
            18,
            50 - difficulty * 3
        );


    if (
        spawnTimer >= spawnRate
    ) {

        createBall();

        spawnTimer = 0;

    }

}


// ================================
// INCREASE DIFFICULTY
// ================================

function updateDifficulty() {

    difficulty =
        1 + Math.floor(score / 100);

}


// ================================
// UPDATE UI
// ================================

function updateUI() {

    scoreElement.textContent =
        score;

    comboElement.textContent =
        combo;

    highScoreElement.textContent =
        highScore;

}


// ================================
// GAME LOOP
// ================================

function gameLoop() {

    if (!gameRunning) return;


    drawBackground();

    updatePlayer();

    spawnBalls();

    updateBalls();

    updateParticles();

    updateDifficulty();


    balls.forEach(
        ball => drawBall(ball)
    );

    drawParticles();

    drawPlayer();

    drawLives();


    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


// ================================
// START GAME
// ================================

function startGame() {

    cancelAnimationFrame(
        animationId
    );


    score = 0;

    combo = 0;

    lives = 3;

    balls = [];

    particles = [];

    spawnTimer = 0;

    difficulty = 1;

    gameRunning = true;


    resizeCanvas();

    createPlayer();

    chooseTargetColor();

    updateUI();


    startScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );


    gameLoop();

}


// ================================
// END GAME
// ================================

function endGame() {

    gameRunning = false;


    cancelAnimationFrame(
        animationId
    );


    finalScore.textContent =
        score;


    let isNewBest = false;


    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "colorCatcherHighScore",
            highScore
        );

        isNewBest = true;

    }


    highScoreElement.textContent =
        highScore;


    if (isNewBest) {

        newBest.classList.remove(
            "hidden"
        );

    } else {

        newBest.classList.add(
            "hidden"
        );

    }


    gameOverScreen.classList.remove(
        "hidden"
    );

}


// ================================
// KEYBOARD CONTROLS
// ================================

const keys = {};


document.addEventListener(
    "keydown",
    event => {

        keys[event.key.toLowerCase()] =
            true;


        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            if (player) {

                player.dx =
                    -player.speed;

            }

        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            if (player) {

                player.dx =
                    player.speed;

            }

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "a" ||
            event.key.toLowerCase() === "d"
        ) {

            if (player) {

                player.dx = 0;

            }

        }

    }
);


// ================================
// MOBILE CONTROLS
// ================================

const leftButton =
    document.getElementById(
        "leftButton"
    );

const rightButton =
    document.getElementById(
        "rightButton"
    );


function moveLeft() {

    if (player) {

        player.dx =
            -player.speed;

    }

}


function moveRight() {

    if (player) {

        player.dx =
            player.speed;

    }

}


function stopMoving() {

    if (player) {

        player.dx = 0;

    }

}


leftButton.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        moveLeft();

    }
);


rightButton.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        moveRight();

    }
);


leftButton.addEventListener(
    "touchend",
    stopMoving
);


rightButton.addEventListener(
    "touchend",
    stopMoving
);


// ================================
// BUTTONS
// ================================

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


// ================================
// INITIAL SETUP
// ================================

resizeCanvas();

createPlayer();

chooseTargetColor();

updateUI();
