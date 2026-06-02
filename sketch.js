let frogs = [];
const frogColors = ['#004b23', '#006400', '#007200', '#008000', '#38b000', '#70e000', '#9ef01a', '#ccff33'];
let lastSpawnTime = 0; // 記錄上次增加青蛙的時間
let missiles = [];     // 儲存飛彈的陣列
let explosions = [];   // 儲存爆炸效果的陣列
let score = 0;         // 分數
let gameState = 'START'; // 遊戲狀態: START, PLAY, GAMEOVER
let gameDuration = 30; // 遊戲時間 (秒)
let startTime;         // 遊戲開始的毫秒數
let difficultyMultiplier = 1.0; // 難度倍率

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetGame();
}

function resetGame() {
  frogs = [];
  missiles = [];
  explosions = [];
  score = 0;
  difficultyMultiplier = 1.0;
  for (let i = 0; i < 30; i++) {
    frogs.push(new Frog());
  }
  lastSpawnTime = millis();
}

function draw() {
  if (gameState === 'START') {
    drawStartScreen();
  } else if (gameState === 'PLAY') {
    runGame();
  } else if (gameState === 'GAMEOVER') {
    drawGameOverScreen();
  }
}

function runGame() {
  background(10, 30, 10, 80); // 加入透明度 (0-255) 來產生拖曳效果

  // 隨時間增加難度
  let timeElapsed = (millis() - startTime) / 1000;
  let timeLeft = max(0, gameDuration - timeElapsed);
  difficultyMultiplier = 1.0 + (timeElapsed / 10); // 每10秒速度增加一倍

  // 隨時間加速產生青蛙 (從 3 秒縮短到最快 0.5 秒一隻)
  let currentSpawnInterval = max(500, 3000 - (timeElapsed * 100));
  if (millis() - lastSpawnTime > currentSpawnInterval) {
    frogs.push(new Frog());
    lastSpawnTime = millis();
  }

  for (let frog of frogs) {
    frog.checkCollision(frogs); // 檢查與其他青蛙的碰撞
    frog.update(difficultyMultiplier);
    frog.display();
  }

  // 繪製中心指向箭頭
  drawPointerArrow();

  // 更新與繪製爆炸效果
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].display();
    if (explosions[i].isDone()) {
      explosions.splice(i, 1);
    }
  }

  // 更新與繪製飛彈，並偵測與青蛙的碰撞
  for (let i = missiles.length - 1; i >= 0; i--) {
    let m = missiles[i];
    m.update();
    m.display();
    
    for (let j = frogs.length - 1; j >= 0; j--) {
      let f = frogs[j];
      if (dist(m.pos.x, m.pos.y, f.pos.x, f.pos.y) < f.baseSize * 0.4) {
        explosions.push(new Explosion(f.pos.x, f.pos.y)); // 產生爆炸
        score += 10;        // 擊中得分
        frogs.splice(j, 1); // 移除青蛙
        m.dead = true;      // 標記飛彈銷毀
        break;
      }
    }
    if (m.dead) missiles.splice(i, 1);
  }

  // 繪製「青蛙派對」大型文字
  push();
  textAlign(CENTER, CENTER);
  textSize(min(windowWidth, windowHeight) * 0.15); // 根據視窗大小動態調整字體大小
  textStyle(BOLD);
  fill(255, 255, 255, 100); // 白色半透明，營造派對氛圍
  noStroke();
  text("青蛙派對", width / 2, height / 2);
  pop();

  // 繪製 UI (右上角分數與時間)
  drawUI(timeLeft);

  // 檢查遊戲結束
  if (timeLeft <= 0) {
    gameState = 'GAMEOVER';
  }
}

function drawUI(timeLeft) {
  push();
  textAlign(RIGHT, TOP);
  textSize(32);
  textStyle(BOLD);
  fill(0, 255, 255);
  text(`SCORE: ${score}`, width - 20, 20);
  fill(255, 100, 100);
  text(`TIME: ${ceil(timeLeft)}s`, width - 20, 60);
  pop();
}

function drawStartScreen() {
  background(10, 30, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(60);
  text("青蛙防衛戰", width / 2, height / 2 - 50);
  textSize(24);
  text("點擊滑鼠左鍵發射飛彈，保護中心區域", width / 2, height / 2 + 20);
  fill(0, 255, 150);
  text("點擊任何地方開始遊戲", width / 2, height / 2 + 80);
}

function drawGameOverScreen() {
  fill(0, 0, 0, 10);
  rect(0, 0, width, height);
  push();
  textAlign(CENTER, CENTER);
  fill(255, 50, 50);
  textSize(80);
  text("GAME OVER", width / 2, height / 2 - 50);
  fill(255);
  textSize(40);
  text(`最終得分: ${score}`, width / 2, height / 2 + 30);
  textSize(20);
  text("點擊畫面重新開始", width / 2, height / 2 + 100);
  pop();
}

function drawPointerArrow() {
  let angle = atan2(mouseY - height / 2, mouseX - width / 2);
  push();
  translate(width / 2, height / 2);
  rotate(angle);
  
  // 繪製箭頭樣式
  fill(0, 255, 150);
  noStroke();
  rect(0, -15, 80, 30, 5); 
  triangle(80, -40, 80, 40, 130, 0);
  pop();
}

function mousePressed() {
  if (gameState === 'START') {
    gameState = 'PLAY';
    startTime = millis();
    resetGame();
  } else if (gameState === 'PLAY') {
    if (mouseButton === LEFT) {
      let angle = atan2(mouseY - height / 2, mouseX - width / 2);
      missiles.push(new Missile(width / 2, height / 2, angle));
    }
  } else if (gameState === 'GAMEOVER') {
    gameState = 'START';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Frog {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.speed = this.vel.mag(); // 記錄初始隨機速度
    this.baseSize = random(50, 100);
    this.currentSize = this.baseSize;
    this.bodyColor = color(random(frogColors));
    this.isScared = false;
    this.eyeGrowth = 1.0; // 眼睛放大倍率
  }

  update() {
    let mouseDist = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    
    // 互動邏輯：滑鼠靠近 (距離小於 150)
    if (mouseDist < 150) {
      this.isScared = true;
      this.eyeGrowth = lerp(this.eyeGrowth, 1.8, 0.2); // 眼睛快速放大
      
      // 產生逃跑的方向向量
      let flee = createVector(this.pos.x - mouseX, this.pos.y - mouseY);
      flee.setMag(5); // 逃跑速度
      this.pos.add(flee);
    } else {
      this.isScared = false;
      this.eyeGrowth = lerp(this.eyeGrowth, 1.0, 0.1); // 恢復正常大小
      this.vel.setMag(this.speed); // 確保速度維持恆定，不會變慢
      this.pos.add(this.vel); // 正常遊走
    }

    // 邊界碰撞偵測
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
  }

  // 檢查碰撞邏輯
  checkCollision(others) {
    for (let other of others) {
      if (other === this) continue;
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      let minDist = (this.baseSize + other.baseSize) * 0.4;
      if (d < minDist) {
        // 計算反彈方向
        let push = p5.Vector.sub(this.pos, other.pos);
        push.normalize();
        
        // 產生反彈力：將原本的速度加上反彈方向的向量
        this.vel.add(push.mult(0.5)); 
        this.vel.limit(5); // 限制最大速度，避免撞擊後飛得太快
      }
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    // 畫身體
    noStroke();
    fill(this.bodyColor);
    ellipse(0, 0, this.currentSize, this.currentSize * 0.8);

    // 畫眼睛 (眼白)
    let eyeOffset = this.currentSize * 0.25;
    let eyeSize = this.currentSize * 0.35 * this.eyeGrowth;
    fill(255);
    ellipse(-eyeOffset, -eyeOffset, eyeSize, eyeSize); // 左眼
    ellipse(eyeOffset, -eyeOffset, eyeSize, eyeSize);  // 右眼

    // 畫眼珠 (追蹤滑鼠)
    this.drawPupil(-eyeOffset, -eyeOffset, eyeSize);
    this.drawPupil(eyeOffset, -eyeOffset, eyeSize);

    // 畫嘴巴
    fill(255, 50, 50); // 紅色嘴巴
    if (this.isScared) {
      // 驚訝表情：圓形的 O 型嘴
      ellipse(0, eyeOffset * 0.5, eyeSize * 0.5, eyeSize * 0.6);
    } else {
      // 正常表情：紅色的笑臉
      stroke(255, 50, 50);
      strokeWeight(3);
      noFill();
      arc(0, 0, this.currentSize * 0.5, this.currentSize * 0.4, 0.2, PI - 0.2);
    }
    pop();
  }

  // 計算並繪製會動的眼珠
  drawPupil(x, y, eyeSize) {
    let angle = atan2(mouseY - (this.pos.y + y), mouseX - (this.pos.x + x));
    let pupilDist = eyeSize * 0.2;
    let px = x + cos(angle) * pupilDist;
    let py = y + sin(angle) * pupilDist;
    
    fill(0);
    noStroke();
    ellipse(px, py, eyeSize * 0.4, eyeSize * 0.4);
  }
}

class Missile {
  constructor(x, y, angle) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.fromAngle(angle).mult(12); // 飛彈速度
    this.dead = false;
    this.history = []; // 用於儲存路徑產生拖曳效果
  }

  update() {
    this.history.push(this.pos.copy());
    if (this.history.length > 10) this.history.shift();
    
    this.pos.add(this.vel);
    
    // 檢查是否超出螢幕
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
      this.dead = true;
    }
  }

  display() {
    // 繪製拖曳尾跡 (螢光藍色漸層)
    for (let i = 0; i < this.history.length; i++) {
      let alpha = map(i, 0, this.history.length, 20, 180);
      fill(0, 255, 255, alpha);
      noStroke();
      circle(this.history[i].x, this.history[i].y, 10);
    }
    
    // 繪製飛彈前端
    fill(100, 255, 255);
    circle(this.pos.x, this.pos.y, 14);
  }
}

class Explosion {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.timer = 255; // 消失倒數
  }
  update() {
    this.timer -= 10;
  }
  display() {
    push();
    noStroke();
    fill(255, 200, 50, this.timer);
    circle(this.pos.x, this.pos.y, (255 - this.timer) * 1.5);
    pop();
  }
  isDone() {
    return this.timer <= 0;
  }
}
