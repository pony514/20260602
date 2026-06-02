let frogs = [];
const frogColors = ['#004b23', '#006400', '#007200', '#008000', '#38b000', '#70e000', '#9ef01a', '#ccff33'];
let lastSpawnTime = 0; // 記錄上次增加青蛙的時間

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化青蛙數量
  for (let i = 0; i < 40; i++) {
    frogs.push(new Frog());
  }
  lastSpawnTime = millis(); // 初始化計時器
}

function draw() {
  background(10, 30, 10, 80); // 加入透明度 (0-255) 來產生拖曳效果

  // 每三秒增加一隻青蛙
  if (millis() - lastSpawnTime > 3000) {
    frogs.push(new Frog());
    lastSpawnTime = millis();
  }

  for (let frog of frogs) {
    frog.checkCollision(frogs); // 檢查與其他青蛙的碰撞
    frog.update();
    frog.display();
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
