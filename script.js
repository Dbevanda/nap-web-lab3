// Get the canvas and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to fill the window
function setCanvasDimensions() {
    canvas.width = window.innerWidth - 5;
    canvas.height = window.innerHeight - 5;
}
setCanvasDimensions();
window.addEventListener('resize', setCanvasDimensions); // Update on window resize

// Game constants
const PADDLE_WIDTH = canvas.width / 8;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BALL_SPEED = 6; // Constant speed of the ball
const BRICK_ROWS = 4;
const BRICK_COLS = 6;
const BRICK_PADDING = 5;
const BRICK_WIDTH = (canvas.width - (BRICK_PADDING * (BRICK_COLS + 1))) / BRICK_COLS;
const BRICK_HEIGHT = 30;
const BRICK_OFFSET_TOP = 50;

// Game variables
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let ballX = canvas.width / 2; // Centered horizontally
let ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 1; // Just above the paddle
let ballDX = BALL_SPEED * Math.cos(Math.PI / 4); // Start direction
let ballDY = -BALL_SPEED * Math.sin(Math.PI / 4); // Moving upwards
let score = 0;
let rightPressed = false;
let leftPressed = false;
let gameOver = false; // Track game over state

// Retrieve high score from localStorage
let highScore = localStorage.getItem('highScore') || 0;

// Brick array
let bricks = [];
function initializeBricks() {
    bricks = [];
    for (let i = 0; i < BRICK_ROWS; i++) {
        bricks[i] = [];
        for (let j = 0; j < BRICK_COLS; j++) {
            bricks[i][j] = {
                x: BRICK_PADDING + j * (BRICK_WIDTH + BRICK_PADDING),
                y: BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_PADDING),
                status: 1
            };
        }
    }
}
initializeBricks(); // Initial brick setup

// Event listeners for paddle movement
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') rightPressed = true;
    if (e.key === 'ArrowLeft') leftPressed = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') rightPressed = false;
    if (e.key === 'ArrowLeft') leftPressed = false;
});

// Normalize ball velocity to keep constant speed
function normalizeBallSpeed() {
    const speed = Math.sqrt(ballDX ** 2 + ballDY ** 2);
    ballDX = (ballDX / speed) * BALL_SPEED;
    ballDY = (ballDY / speed) * BALL_SPEED;
}

// Draw paddle with shadow
function drawPaddle() {
    ctx.shadowColor = 'rgb(255,128,0)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'red';
    ctx.fillRect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowColor = 'transparent'; // Reset shadow
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();
}

// Draw bricks with shadow
function drawBricks() {
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            if (bricks[i][j].status === 1) {
                const brickX = bricks[i][j].x;
                const brickY = bricks[i][j].y;

                ctx.shadowColor = 'rgb(253,8,233)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 3;

                ctx.fillStyle = 'blue';
                ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);

                ctx.shadowColor = 'transparent'; // Reset shadow
            }
        }
    }
}

// Show Game Over overlay
function showGameOverOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.flexDirection = 'column';

    const message = document.createElement('h1');
    message.textContent = 'GAME OVER';
    message.style.color = 'white';
    message.style.fontSize = '3rem';
    message.style.marginBottom = '20px';

    const scoreMessage = document.createElement('h2');
    scoreMessage.textContent = `Your Score: ${score}`;
    scoreMessage.style.color = 'white';
    scoreMessage.style.fontSize = '2rem';
    scoreMessage.style.marginBottom = '20px';

    const highScoreMessage = document.createElement('h2');
    highScoreMessage.textContent = `High Score: ${highScore}`;
    highScoreMessage.style.color = 'white';
    highScoreMessage.style.fontSize = '2rem';
    highScoreMessage.style.marginBottom = '20px';

    const button = document.createElement('button');
    button.textContent = 'Start Again';
    button.style.padding = '10px 20px';
    button.style.fontSize = '1.5rem';
    button.style.cursor = 'pointer';
    button.onclick = () => {
        document.body.removeChild(overlay);
        restartGame();
    };

    overlay.appendChild(message);
    overlay.appendChild(scoreMessage);
    overlay.appendChild(highScoreMessage);
    overlay.appendChild(button);
    document.body.appendChild(overlay);

    updateHighScore(); // Update high score at the end of the game
}


function showVictoryOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'victory-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.style.flexDirection = 'column';

    const message = document.createElement('h1');
    message.textContent = 'YOU WIN!';
    message.style.color = 'white';
    message.style.fontSize = '3rem';
    message.style.marginBottom = '20px';

    const button = document.createElement('button');
    button.textContent = 'Play Again';
    button.style.padding = '10px 20px';
    button.style.fontSize = '1.5rem';
    button.style.cursor = 'pointer';
    button.onclick = () => {
        document.body.removeChild(overlay);
        restartGame();
    };

    overlay.appendChild(message);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}

// Restart game
function restartGame() {
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 1;
    ballDX = BALL_SPEED * Math.cos(Math.PI / 4);
    ballDY = -BALL_SPEED * Math.sin(Math.PI / 4);
    score = 0;
    gameOver = false;
    initializeBricks();
    draw();
}

// Move paddle
function movePaddle() {
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7;
    }
    if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
}

// Collision detection
function collisionDetection() {
    let bricksLeft = 0; // Track remaining bricks

    // Check for ball collision with bricks
    for (let i = 0; i < BRICK_ROWS; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            const b = bricks[i][j];
            if (b.status === 1) {
                bricksLeft++; // Count remaining bricks

                // Brick boundaries
                const brickLeft = b.x;
                const brickRight = b.x + BRICK_WIDTH;
                const brickTop = b.y;
                const brickBottom = b.y + BRICK_HEIGHT;

                // Check for collision
                if (
                    ballX + BALL_RADIUS > brickLeft &&
                    ballX - BALL_RADIUS < brickRight &&
                    ballY + BALL_RADIUS > brickTop &&
                    ballY - BALL_RADIUS < brickBottom
                ) {
                    // Determine if the collision is vertical or horizontal
                    const collisionFromTopOrBottom =
                        ballX > brickLeft && ballX < brickRight; // Ball is within brick's horizontal bounds

                    if (collisionFromTopOrBottom) {
                        ballDY = -ballDY; // Bounce vertically
                    } else {
                        ballDX = -ballDX; // Bounce horizontally
                    }

                    b.status = 0; // Mark brick as destroyed
                    score++; // Increment score
                    normalizeBallSpeed(); // Keep ball speed constant
                    break;
                }
            }
        }
    }

    // If no bricks are left, the player wins
    if (bricksLeft === 0) {
        gameOver = true;
        showVictoryOverlay();
    }

    // Check for ball collision with paddle (top side only)
    if (
        ballY + BALL_RADIUS >= canvas.height - PADDLE_HEIGHT && // Ball is at paddle level
        ballY + BALL_RADIUS <= canvas.height && // Ball is not below paddle
        ballX > paddleX && ballX < paddleX + PADDLE_WIDTH // Ball is within paddle width
    ) {
        ballDY = -Math.abs(ballDY); // Ensure it moves upwards
        const paddleCenter = paddleX + PADDLE_WIDTH / 2;
        ballDX = (ballX - paddleCenter) * 0.2; // Add angle based on impact point

        normalizeBallSpeed(); // Maintain constant speed
    }

    // Game Over condition: Ball goes below the paddle
    if (ballY - BALL_RADIUS > canvas.height) {
        gameOver = true;
        showGameOverOverlay();
    }
}

// Update high score
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
}

// Draw high score (left side)
function drawHighScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left'; // Align text to the left
    ctx.fillText(`High Score: ${highScore}`, 20, 30); // High score at the top-left
}

// Draw score and max score (right side)
function drawScore() {
    const maxScore = BRICK_ROWS * BRICK_COLS; // Total number of bricks
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right'; // Align text to the right
    ctx.fillText(`Score: ${score} / Max: ${maxScore}`, canvas.width - 20, 30); // Current score at the top-right
}

// Draw game elements and handle updates
function draw() {
    if (gameOver) return; // Stop rendering when game is over

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawHighScore(); // Add high score display
    collisionDetection();
    movePaddle();

    // Ball movement
    if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
        ballDX = -ballDX;
        normalizeBallSpeed();
    }
    if (ballY + ballDY < BALL_RADIUS) {
        ballDY = -ballDY;
        normalizeBallSpeed();
    }

    ballX += ballDX;
    ballY += ballDY;

    requestAnimationFrame(draw);
}

// Start the game
draw();
