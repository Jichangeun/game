const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src='astronaut.png';

const enemyImg = new Image();
enemyImg.src='alien2.png';

const backgroundMusic = new Audio('background.mp3');
const gameOverMusic = new Audio('gameover.mp3');
backgroundMusic.loop = true;

// 사용자 상호작용 이벤트로 배경음악 재생
window.addEventListener('keydown', () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play().catch(error => {
      console.error('Audio playback failed:', error);
    });
  }
});

let playerX = canvas.width/2, playerY = canvas.height/2;
let isGameOver = false;
let startTime, currentTime;
let highRecord = localStorage.getItem('highRecord') || 0;

if(isNaN(highRecord)){
  highRecord=0;
}
// 적 배열
const enemies = [];


// 적 초기화 함수 (N개의 적 생성)
function initializeEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push({
      x: Math.random() * (canvas.width - 50), // 랜덤 X 위치
      y: Math.random() * (canvas.height - 50), // 랜덤 Y 위치
      width: 55,
      height: 35,
      speedX: Math.random() * 2 + 1, // X 방향 속도 (1~3)
      speedY: Math.random() * 2 + 1, // Y 방향 속도 (1~3)
    });
  }
}

// 적 그리기
function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.drawImage(enemyImg,enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

// 적 움직임
function moveEnemies() {
  enemies.forEach(enemy => {
    enemy.x += enemy.speedX;
    enemy.y += enemy.speedY;

    // Canvas 경계에서 방향 변경
    if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
      enemy.speedX *= -1; // X 방향 반전
    }
    if (enemy.y + enemy.height > canvas.height || enemy.y < 0) {
      enemy.speedY *= -1; // Y 방향 반전
    }
  });
}

// 플레이어 그리기
function drawPlayer() {
  ctx.drawImage(playerImg, playerX, playerY, 60, 60);
}

// 충돌 감지
function checkCollisions() {
  const player = { x: playerX, y: playerY, width: 50, height: 50 };

  enemies.forEach(enemy => {
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      backgroundMusic.pause();
      gameOverMusic.play();
      console.log('Collision detected!');
      isGameOver = true; // 게임 종료
    }
  });
}

// 생존 시간 표시
function drawTime() {
  if (!isGameOver) {
    currentTime = Date.now();
  }
  const elapsedTime = ((currentTime - startTime) / 1000).toFixed(2); // 경과 시간(초)
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Time: ${elapsedTime}s`, 10, 40);
  ctx.fillText(`High Record: ${highRecord}s`, 10, 60);
}

function updateHighRecord(){
  const elapsedTime = ((currentTime - startTime) / 1000).toFixed(2); // 현재 생존 시간
  if (elapsedTime > highRecord) {
    highRecord = elapsedTime; // 최고 기록 갱신
    localStorage.setItem('highRecord', highRecord); // 로컬 스토리지에 저장
    alert(`New High Record: ${highRecord}s !!`);
  } else {
    alert(`Game Over! Your time: ${elapsedTime}s. High Record: ${highRecord}s.`);
  }
}
// 게임 루프
function gameLoop() {
  if (isGameOver) {
    updateHighRecord();
    return; // 게임 루프 중단
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 초기화
  drawPlayer(); // 플레이어 그리기
  drawEnemies(); // 적 그리기
  moveEnemies(); // 적 이동
  checkCollisions(); // 충돌 감지
  drawTime(); // 생존 시간 표시
  requestAnimationFrame(gameLoop); // 다음 프레임 호출
}

// 키보드 입력 처리
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' && playerX < canvas.width - 50) playerX += 10; // 오른쪽 이동
  if (event.key === 'ArrowLeft' && playerX >= 10) playerX -= 10;                // 왼쪽 이동
  if (event.key === 'ArrowUp' && playerY >= 10) playerY -= 10;                  // 위로 이동
  if (event.key === 'ArrowDown' && playerY < canvas.height - 50) playerY += 10; // 아래로 이동
});

// 게임 시작
initializeEnemies(3); // 적 5명 생성
startTime = Date.now(); // 시작 시간 기록
gameLoop(); // 게임 루프 시작
