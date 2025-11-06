function createStars() {
    const starsContainer = document.getElementById('stars');
    const numStars = 150;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}
createStars();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;
let score = 0;
let highScore = 0;
let animationId;


const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 50,
    speed: 7,
    color: '#00d4ff'
};


let rocks = [];

const keys = {
    left: false,
    right: false
};


const rockConfig = {
    minSize: 30,
    maxSize: 50,
    minSpeed: 2,
    maxSpeed: 4,
    spawnRate: 0.02,
    colors: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#696969']
};


function drawAircraft() {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;

    ctx.save();
    
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = player.color;
    
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/2 - 8, y + h - 10);
    ctx.lineTo(x + w/2 + 8, y + h - 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + w/2 - 8, y + h/2);
    ctx.lineTo(x, y + h/2 + 10);
    ctx.lineTo(x + w/2 - 8, y + h/2 + 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + w/2 + 8, y + h/2);
    ctx.lineTo(x + w, y + h/2 + 10);
    ctx.lineTo(x + w/2 + 8, y + h/2 + 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(x + w/2, y + h - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawRocks() {
    rocks.forEach(rock => {
        ctx.save();
        ctx.translate(rock.x + rock.size/2, rock.y + rock.size/2);
        ctx.rotate(rock.rotation);
        
        ctx.fillStyle = rock.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = rock.color;
        
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = rock.size/2 * (0.7 + Math.random() * 0.3);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(-rock.size/6, -rock.size/6, rock.size/8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function init() {
    loadHighScore();
    updateScoreDisplay();
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.left = true;
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.left = false;
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.right = true;
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.right = false;
    });
    
    leftBtn.addEventListener('mousedown', () => keys.left = true);
    leftBtn.addEventListener('mouseup', () => keys.left = false);
    rightBtn.addEventListener('mousedown', () => keys.right = true);
    rightBtn.addEventListener('mouseup', () => keys.right = false);
    
    startGame();
}

function loadHighScore() {
    const saved = localStorage.getItem('spaceDodgerHighScore');
    highScore = saved ? parseInt(saved) : 0;
}

function saveHighScore() {
    localStorage.setItem('spaceDodgerHighScore', highScore.toString());
}

function startGame() {
    gameRunning = true;
    score = 0;
    rocks = [];
    player.x = canvas.width / 2 - player.width / 2;
    document.getElementById('gameOverScreen').classList.remove('active');
    gameLoop();
}

function restartGame() {
    startGame();
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.right = true;
    }
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        keys.right = false;
    }
}

function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function spawnRock() {
    if (Math.random() < rockConfig.spawnRate) {
        const difficultyMultiplier = 1 + (score / 1000);
        const speed = rockConfig.minSpeed + 
            (Math.random() * (rockConfig.maxSpeed - rockConfig.minSpeed)) * 
            difficultyMultiplier;
        
        const size = rockConfig.minSize + Math.random() * (rockConfig.maxSize - rockConfig.minSize);
        
        rocks.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            size: size,
            speed: speed,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            color: rockConfig.colors[Math.floor(Math.random() * rockConfig.colors.length)]
        });
    }
}

function updateRocks() {
    for (let i = rocks.length - 1; i >= 0; i--) {
        rocks[i].y += rocks[i].speed;
        rocks[i].rotation += rocks[i].rotationSpeed;
        
        if (rocks[i].y > canvas.height) {
            rocks.splice(i, 1);
        }
    }
}

function checkCollision() {
    for (let rock of rocks) {
        const rockCenterX = rock.x + rock.size/2;
        const rockCenterY = rock.y + rock.size/2;
        const rockRadius = rock.size/2;
        
        const playerCenterX = player.x + player.width/2;
        const playerCenterY = player.y + player.height/2;
        
        const distance = Math.sqrt(
            Math.pow(rockCenterX - playerCenterX, 2) + 
            Math.pow(rockCenterY - playerCenterY, 2)
        );
        
        if (distance < rockRadius + player.width/3) {
            return true;
        }
    }
    return false;
}

function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = score;
    document.getElementById('highScore').textContent = highScore;
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    const isNewHighScore = score > highScore;
    if (isNewHighScore) {
        highScore = score;
        saveHighScore();
        document.getElementById('newHighScore').style.display = 'block';
    } else {
        document.getElementById('newHighScore').style.display = 'none';
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.add('active');
    updateScoreDisplay();
}

function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    spawnRock();
    updateRocks();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    drawRocks();
    drawAircraft();
    
    score++;
    updateScoreDisplay();
    
    animationId = requestAnimationFrame(gameLoop);
}

init();
