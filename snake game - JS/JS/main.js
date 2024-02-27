//DOM Elements
const gameCanvas = document.querySelector('.gameBoard .canvas');
const ctx = gameCanvas.getContext('2d');
const playerScore = document.querySelector('.playerScore');
const startGameBtn = document.querySelector('.startGame');
const resetGameBtn = document.querySelector('.resetGame');
const gameOverPopup = document.querySelector('.gameOverPopup');
const closeGameOver = document.querySelector('.closeGameOver');
const wrapper = document.querySelector('.wrapper');
const navButtons = document.querySelectorAll('.navButtons .arrowImg');
const settingsSVG = document.querySelector('.settingsSVG');
const settingsContainer = document.querySelector('.settingsContainer');
const settingList = document.querySelectorAll('.settingList');
const settingAdjustment = document.querySelector('.settingAdjustment');
const snakeSpeedEl = document.querySelector('.snakeSpeed input');
const enableWalls = document.querySelector('.enableWalls input');
const highScoreEl = document.querySelector('.highScore span');
const resetHighScore = document.querySelector('.resetHighScore');

const canvasWidth = gameCanvas.width;
const canvasHeight = gameCanvas.height;
const rootNum = 20;
let snakeXSpeed = rootNum, snakeYSpeed = 0;
let intervalId;
let gameRunning;
let foodX, foodY;
let snake;
let score = 0;
let snakeSpeed = 100;
let wallsEnabled = localStorage.getItem('isWallEnabled')||true;
let highScore = localStorage.getItem('gameHighScore')||0;
let popupId;

window.addEventListener('DOMContentLoaded', e => {
  if(e.target.readyState === 'interactive') {
    renderState();
  }
});

function renderState() {
  checkCompatibility();
  //check if the walls are enabled
  if (wallsEnabled == 'true') {
    wallsEnabled = true;
    enableWalls.checked = true;
  } else if (wallsEnabled == 'false') {
    wallsEnabled = false;
    enableWalls.checked = false;
  }

  //rotating settings feature
  settingsSVG.addEventListener('mouseenter', e => {
    settingsSVG.classList.remove('rotateLeft');
    settingsSVG.classList.add('rotateRight');
  });
  settingsSVG.addEventListener('mouseleave', e => {
    settingsSVG.classList.remove('rotateRight');
    settingsSVG.classList.add('rotateLeft');
  });
  //snake speed
  snakeSpeedEl.addEventListener('input', e => {
    snakeSpeed = e.target.value;
    let difficulty = document.querySelector('.snakeSpeed').querySelector('span');
    if (snakeSpeed <= 33) {
      snakeSpeed = 150;
      difficulty.textContent = 'Slow';
    } else if (snakeSpeed <= 67) {
      snakeSpeed = 100;
      difficulty.textContent = 'Medium';
    } else if (snakeSpeed <= 100) {
      snakeSpeed = 50;
      difficulty.textContent = 'Fast';
    } 
  });

  //displaying the settings
  window.addEventListener('keydown', e => {
    if ((e.key === 'i') && (e.altKey) && (e.ctrlKey)) {
      displaySettings();
    }
  });
  settingsSVG.addEventListener('click', displaySettings);
  function displaySettings() {
    settingsContainer.classList.remove('displayNone');
    wrapper.classList.add("focusRemoved");
    gameOverPopup.classList.add("displayNone");
    settingsSVG.classList.add("focusRemoved");

    document.querySelector('.closeSettings').addEventListener('click', e => {
      settingsContainer.classList.add('displayNone');
      wrapper.classList.remove("focusRemoved");
      settingsSVG.classList.remove("focusRemoved");
    });
  }


  settingList.forEach(setting => {
    setting.addEventListener('click', e => {
      settingList.forEach(sL => sL.classList.remove('settingSelected'));

      document.querySelectorAll('.settingDetail').forEach(detail => {
        detail.classList.add('displayNone');
      });

      setting.classList.add('settingSelected');
      const listDetail = e.target.textContent;

      if (listDetail === 'snake speed') {
        document.querySelector('.snakeSpeed').classList.remove('displayNone');
      } else if (listDetail === 'Enable Walls') {
        document.querySelector('.enableWalls').classList.remove('displayNone');
      } else if (listDetail === 'High Score') {
        document.querySelector('.highScore').classList.remove('displayNone');
      }
    });
  });
  enableWalls.addEventListener('input', e => {
    document.querySelector('.wallsEPopup').classList.remove('displayNone');

    resetGame();
    clearInterval(popupId);

     if (e.target.checked){
      wallsEnabled = true;
      localStorage.setItem('isWallEnabled', wallsEnabled);
      document.querySelector('.wallsEPopup').textContent = 'Walls Enabled';
       popupId = setTimeout(() => {
        document.querySelector('.wallsEPopup').classList.add('displayNone');
      }, 2000);
     } else {
     wallsEnabled = false;
      localStorage.setItem('isWallEnabled', wallsEnabled);
      document.querySelector('.wallsEPopup').textContent = 'Walls Disabled';
       popupId = setTimeout(() => {
        document.querySelector('.wallsEPopup').classList.add('displayNone');
      }, 2000);
     }
  });
  resetHighScore.addEventListener('click', e => {
    highScore = 0;
    highScoreEl.textContent = highScore;
    localStorage.setItem('gameHighScore', highScore);

    document.querySelector('.wallsEPopup').classList.remove('displayNone');
    document.querySelector('.wallsEPopup').textContent = 'High Score resetted';
    popupId = setTimeout(() => {
     document.querySelector('.wallsEPopup').classList.add('displayNone');
   }, 2000);
  });
  
  window.addEventListener('resize', checkCompatibility);
  highScoreEl.textContent = highScore;
  resetGameBtn.classList.add('buttonDisabled');
  startGameBtn.addEventListener('click', startGame);
}
function checkCompatibility() {
  if (window.innerWidth <= 350 || window.innerHeight <= 545) {
    alert('The height or the width of your device is too small to render the game. You might experience a sliced portion of the canvas.');
  }
}
function startGame() {
  gameRunning = true;
  resetGameBtn.classList.remove('buttonDisabled');
  startGameBtn.classList.add('buttonDisabled');
  startGameBtn.removeEventListener('click', startGame);
  resetGameBtn.addEventListener('click', resetGame);
  window.addEventListener('keyup', navigateSnake);
  navButtons.forEach(button => {
    button.addEventListener('click', e => {
      navigateSnake({key: (e.target.alt.split(' ').join(''))});
     });
  });
  generateAppleCoord();
  generateSnakeCoord();
  clearInterval(intervalId);

  intervalId = setInterval(() => {
    if (gameRunning) {
      paintGameBoard();
      renderApple();
      renderSnake();
      moveSnake();
      checkContact();
    } else {
      gameOver();
      clearInterval(intervalId);
    }
  }, snakeSpeed);
} 
function paintGameBoard() {
  ctx.fillStyle = getComputedStyle(gameCanvas).backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
} 
function generateSnakeCoord() {
  snake = [
    {x: rootNum * 2, y: 0},
    {x: rootNum, y: 0},
    {x: 0, y: 0}
  ];
}
function moveSnake() {
  snake.unshift({x: snake[0].x + snakeXSpeed, y: snake[0].y + snakeYSpeed});
  if ((snake[0].x === foodX) && (snake[0].y === foodY)) {
    //that means that the snake has eaten the apple
    score++;
    //highScore = (score > highScore)? score: highScore;
    if (score > highScore) {
      highScore = score;
    } else {
      highScore = highScore;
    }
    localStorage.setItem('gameHighScore', highScore);

    highScoreEl.textContent = highScore;
    playerScore.textContent = score;
    generateAppleCoord();
  } else {
    //remove the snake's tail since it has not eaten the apple
    snake.pop();
  }
}
function renderSnake() {
  ctx.fillStyle = '#90ee90';
  snake.forEach((part, i) => {
      ctx.fillRect(part.x, part.y, rootNum, rootNum);
  });
}
function generateAppleCoord () {
  //assign foodX and foodY to randomly generated apple coordinates
  const randomCoord = dimension => Math.round((Math.random() * dimension) / rootNum) * rootNum;
  foodX = randomCoord(canvasWidth - rootNum);
  foodY = randomCoord(canvasHeight - rootNum);
}
function renderApple() {
  ctx.fillStyle = '#ad0c0c';
  ctx.fillRect(foodX, foodY, rootNum, rootNum);
}
function navigateSnake(e) {
  const pressedKey = e.key;
  if ((pressedKey === 'ArrowUp') && ((snakeYSpeed !== rootNum))) {
   snakeXSpeed = 0, snakeYSpeed = -rootNum;
  } else if ((pressedKey === 'ArrowRight') && (snakeXSpeed !== -rootNum)) {
    snakeXSpeed = rootNum, snakeYSpeed = 0;
  } else if ((pressedKey === 'ArrowDown') && (snakeYSpeed !== -rootNum)) {
    snakeXSpeed = 0, snakeYSpeed = rootNum;
  } else if ((pressedKey === 'ArrowLeft') && (snakeXSpeed !== rootNum)) {
    snakeXSpeed = -rootNum, snakeYSpeed = 0;
  }
}
function checkContact() {
  if (wallsEnabled) {
    if (snake[0].x >= canvasWidth) {
      gameRunning = false;
    } else if (snake[0].x < 0) {
      gameRunning = false;
    } else if (snake[0].y < 0) {
      gameRunning = false; 
    } else if (snake[0].y >= canvasHeight) {
      gameRunning = false;
    }
  } else {
    if (snake[0].x >= canvasWidth) {
      snake[0].x = 0;
    } else if (snake[0].x < 0) {
      snake[0].x = canvasWidth;
    } else if (snake[0].y < 0) {
      snake[0].y = canvasHeight;
    } else if (snake[0].y >= canvasHeight) {
      snake[0].y = 0;
    }
  }
  
  for (let i = 1; i < snake.length; i++) {
    if ((snake[0].x === snake[i].x) && (snake[0].y === snake[i].y)) {
      gameRunning = false;
    }
 }
}
function gameOver() {
  gameOverPopup.classList.remove('displayNone');
  settingsContainer.classList.add('displayNone');
  wrapper.classList.add('focusRemoved');
  settingsSVG.classList.remove('focusRemoved');

  closeGameOver.addEventListener('click', e => {
    gameOverPopup.classList.add('displayNone');
    wrapper.classList.remove('focusRemoved');
  });
}
function resetGame() {
  gameOverPopup.classList.add('displayNone');
  settingsContainer.classList.add('displayNone');
  wrapper.classList.remove('focusRemoved');
  settingsSVG.classList.remove('focusRemoved');

  snakeXSpeed = rootNum, snakeYSpeed = 0;
  intervalId;
  gameRunning = false;
  wallsEnabled = enableWalls.checked;
  score = 0;
  playerScore.textContent = score;
  startGame();
}
