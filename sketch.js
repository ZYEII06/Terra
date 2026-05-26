// ============================================================
//  2050 地球學習旅程 — 主程式 sketch.js
//  技術：純 p5.js（無任何 framework）
//  整合：Scene 4 結束後觸發 index.html 的 showEnterSiteBtn()
// ============================================================

// ===== 全域變數 =====
let currentScene = 0;
let targetScene = 0;
let transitioning = false;
let transitionProgress = 0;
let transitionParticles = [];

let fontNoto, fontOrbitron;

const COL = {
  bg:     '#04070d',
  cyan:   '#38bdf8',
  purple: '#818cf8',
  gold:   '#fbbf24',
  red:    '#ff4466',
  green:  '#2dd4bf',
  white:  '#f1f5f9'
};

// ============================================================
//  p5.js 核心函式
// ============================================================
function preload() {}

function setup() {
  // 掛載到 #p5-container（由 index.html 提供）
  const container = document.getElementById('p5-container');
  let cnv;
  if (container) {
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('p5-container');
  } else {
    cnv = createCanvas(windowWidth, windowHeight);
  }
  cnv.position(0, 0);
  frameRate(60);
  colorMode(RGB, 255, 255, 255, 255);
  textFont('Noto Sans TC');

  initScene0();
  initScene1();
  initScene2();
  initScene3();
  initScene4();

  currentScene = 0;
  enterScene0();

  if (typeof window.updateNavDots === 'function') window.updateNavDots(0);

  setTimeout(() => {
    if (typeof window.hideLoadingScreen === 'function') window.hideLoadingScreen();
  }, 900);
}

function draw() {
  background(10, 10, 26);

  if (transitioning) {
    drawTransition();
    return;
  }

  switch (currentScene) {
    case 0: drawScene0(); break;
    case 1: drawScene1(); break;
    case 2: drawScene2(); break;
    case 3: drawScene3(); break;
    case 4: drawScene4(); break;
  }

  drawCursorGlow();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reinitOnResize();
}

function keyPressed() {
  if (currentScene === 0 && (key === 'Enter' || keyCode === ENTER)) goToScene(1);
  if (keyCode === RIGHT_ARROW && currentScene < 4) goToScene(currentScene + 1);
  if (keyCode === LEFT_ARROW  && currentScene > 0) goToScene(currentScene - 1);
  if (currentScene === 4) handleScene4KeyPress();
}

function mousePressed() {
  if (transitioning) return;
  switch (currentScene) {
    case 0: handleScene0Click(); break;
    case 1: handleScene1Click(); break;
    case 2: handleScene2Click(); break;
    case 3: handleScene3Click(); break;
    case 4: handleScene4Click(); break;
  }
}

function drawCursorGlow() {
  drawingContext.save();
  noStroke();
  fill(0, 245, 255, 8);
  ellipse(mouseX, mouseY, 80, 80);
  fill(0, 245, 255, 20);
  ellipse(mouseX, mouseY, 30, 30);
  drawingContext.restore();
}

// ============================================================
//  工具函式
// ============================================================
function glowText(txt, x, y, col, blurSize, sz) {
  drawingContext.save();
  drawingContext.shadowColor = col;
  drawingContext.shadowBlur  = blurSize || 20;
  fill(col);
  textSize(sz || 16);
  text(txt, x, y);
  drawingContext.restore();
}

function glowLine(x1, y1, x2, y2, col, w, blurSize) {
  drawingContext.save();
  drawingContext.shadowColor = col;
  drawingContext.shadowBlur  = blurSize || 15;
  stroke(col);
  strokeWeight(w || 1);
  line(x1, y1, x2, y2);
  drawingContext.restore();
}

function glowEllipse(x, y, w, h, fillCol, blurSize) {
  drawingContext.save();
  drawingContext.shadowColor = fillCol;
  drawingContext.shadowBlur  = blurSize || 20;
  fill(fillCol);
  noStroke();
  ellipse(x, y, w, h);
  drawingContext.restore();
}

function hexToP5Color(hex, alpha) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return color(r, g, b, alpha !== undefined ? alpha : 255);
}

function typewriterLen(totalLen, startFrame, framesPerChar) {
  let elapsed = frameCount - startFrame;
  return constrain(floor(elapsed / framesPerChar), 0, totalLen);
}

function reinitOnResize() {
  switch (currentScene) {
    case 0: initScene0(); break;
    case 1: initScene1(); break;
    case 2: initScene2(); break;
    case 3: initScene3(); break;
    case 4: initScene4(); break;
  }
}

// ============================================================
//  場景切換
// ============================================================
window.goToScene = function(idx) {
  if (transitioning || idx === currentScene) return;
  if (idx < 0 || idx > 4) return;
  targetScene = idx;
  startTransition();
};

function startTransition() {
  transitioning = true;
  transitionProgress = 0;
  transitionParticles = [];

  for (let i = 0; i < 300; i++) {
    let angle  = random(TWO_PI);
    let speed  = random(4, 20);
    let cols   = [COL.cyan, COL.purple, COL.gold, COL.white];
    transitionParticles.push({
      x: width / 2 + random(-100, 100),
      y: height / 2 + random(-100, 100),
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: 1.0,
      decay: random(0.012, 0.025),
      size: random(2, 8),
      col: random(cols)
    });
  }
  exitScene(currentScene);
}

function drawTransition() {
  transitionProgress += 0.018;

  if (transitionProgress < 0.5) {
    background(10, 10, 26, 40);
    for (let p of transitionParticles) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.94;
      p.life -= p.decay;
      drawingContext.save();
      drawingContext.shadowColor = p.col;
      drawingContext.shadowBlur  = 12;
      noStroke();
      let c = hexToP5Color(p.col, p.life * 255);
      fill(c);
      ellipse(p.x, p.y, p.size * p.life, p.size * p.life);
      drawingContext.restore();
    }
  } else if (transitionProgress >= 0.5 && transitionProgress < 0.52) {
    background(10, 10, 26);
    currentScene = targetScene;
    enterScene(currentScene);
    if (typeof window.updateNavDots === 'function') window.updateNavDots(currentScene);
  } else {
    background(10, 10, 26);
    drawCurrentSceneFaded(1 - (transitionProgress - 0.5) * 2);
    if (transitionProgress >= 1.0) {
      transitioning = false;
      transitionProgress = 0;
    }
  }
}

function drawCurrentSceneFaded(alpha) {
  switch (currentScene) {
    case 0: drawScene0(); break;
    case 1: drawScene1(); break;
    case 2: drawScene2(); break;
    case 3: drawScene3(); break;
    case 4: drawScene4(); break;
  }
  noStroke();
  fill(10, 10, 26, alpha * 255);
  rect(0, 0, width, height);
}

function enterScene(idx) {
  switch (idx) {
    case 0: enterScene0(); break;
    case 1: enterScene1(); break;
    case 2: enterScene2(); break;
    case 3: enterScene3(); break;
    case 4: enterScene4(); break;
  }
  const sdgMap = {
    0: [],
    1: ['SDG 3 健康福祉', 'SDG 4 優質教育'],
    2: ['SDG 4 優質教育', 'SDG 10 減少不平等', 'SDG 16 和平正義'],
    3: ['SDG 4 優質教育', 'SDG 11 永續城鄉'],
    4: ['SDG 4', 'SDG 13 氣候行動', 'SDG 10', 'SDG 17 全球夥伴']
  };
  if (typeof window.updateSDGBadge === 'function') {
    window.updateSDGBadge(sdgMap[idx] || []);
  }
}

function exitScene(idx) {
  switch (idx) {
    case 1: exitScene1(); break;
    case 3: exitScene3(); break;
    default: break;
  }
}

// ============================================================
//  SCENE 0 — 開場動畫
// ============================================================
let stars0 = [];
let typerFrame0 = 0;
let mainText0 = '你的一個選擇，能改變 2050 年的地球';
let subText0  = 'PRESS ENTER OR CLICK TO BEGIN';
let scene0Entered = false;
let s0GlowPulse = 0;

function initScene0() {
  stars0 = [];
  for (let i = 0; i < 200; i++) {
    stars0.push({
      x: random(width), y: random(height),
      size: random(0.5, 3), speed: random(0.05, 0.3),
      alpha: random(100, 255), twinkleOffset: random(TWO_PI)
    });
  }
  for (let i = 0; i < 5; i++) {
    stars0.push({
      x: random(width), y: random(height * 0.4),
      size: random(1, 2), speed: random(1.5, 3.5),
      alpha: 0, twinkleOffset: random(TWO_PI),
      isMeteor: true, len: random(60, 120)
    });
  }
}

function enterScene0() {
  scene0Entered = true;
  typerFrame0 = frameCount;
  if (typeof window.updateSDGBadge === 'function') window.updateSDGBadge([]);
}

function drawScene0() {
  background(10, 10, 26);
  for (let s of stars0) {
    s.isMeteor ? drawMeteor(s) : drawStar0(s);
  }
  drawEarthHint0();
  drawMainTitle0();
  drawSubTitle0();

  textAlign(RIGHT);
  textFont('Noto Sans TC');
  textSize(10);
  fill(100, 120, 140, 150);
  noStroke();
  text('2050 EARTH LEARNING JOURNEY  v1.0', width - 24, height - 20);
  textAlign(LEFT);
}

function drawStar0(s) {
  s.y -= s.speed * 0.3;
  if (s.y < -5) s.y = height + 5;
  let twinkle = sin(frameCount * 0.03 + s.twinkleOffset) * 40;
  let a = constrain(s.alpha + twinkle, 60, 255);
  noStroke();
  fill(200, 220, 255, a);
  ellipse(s.x, s.y, s.size, s.size);
}

function drawMeteor(s) {
  s.x += s.speed * 2;
  s.y += s.speed;
  s.alpha = sin(frameCount * 0.02 + s.twinkleOffset) * 127 + 128;
  if (s.x > width + 50) { s.x = random(-50, 0); s.y = random(height * 0.3); }
  for (let i = 0; i < 8; i++) {
    let tx = s.x - cos(atan2(s.speed, s.speed * 2)) * s.len * (i / 8);
    let ty = s.y - sin(atan2(s.speed, s.speed * 2)) * s.len * (i / 8);
    let ta = s.alpha * (1 - i / 8) * 0.6;
    noStroke(); fill(0, 245, 255, ta);
    ellipse(tx, ty, s.size * (1 - i / 10), s.size * (1 - i / 10));
  }
}

function drawEarthHint0() {
  let cx = width / 2, cy = height / 2 - 40;
  for (let r = 180; r > 0; r -= 20) {
    noStroke(); fill(0, 245, 255, map(r, 0, 180, 30, 0) * 0.3);
    ellipse(cx, cy, r * 2, r * 2);
  }
  drawingContext.save();
  drawingContext.shadowColor = COL.cyan;
  drawingContext.shadowBlur  = 8;
  noFill();
  stroke(0, 245, 255, 30);
  strokeWeight(0.5);
  ellipse(cx, cy, 320, 320);
  ellipse(cx, cy, 420, 420);
  drawingContext.restore();
}

function drawMainTitle0() {
  let elapsed = frameCount - typerFrame0;
  if (elapsed < 0) return;
  let showLen = constrain(floor(elapsed / 3), 0, mainText0.length);
  let displayText = mainText0.substring(0, showLen);
  textAlign(CENTER, CENTER);
  textFont('Noto Sans TC');
  textSize(width < 600 ? 20 : 28);
  drawingContext.save();
  drawingContext.shadowColor = COL.cyan;
  drawingContext.shadowBlur  = 25;
  fill(230, 245, 255, 240);
  noStroke();
  text(displayText, width / 2, height / 2 - 40);
  drawingContext.restore();
  if (showLen < mainText0.length) {
    let cursorVisible = (floor(frameCount / 20) % 2 === 0);
    if (cursorVisible) {
      fill(0, 245, 255);
      let tw = textWidth(displayText);
      rect(width / 2 + tw / 2 + 4, height / 2 - 56, 2, 24);
    }
  }
  textAlign(LEFT);
}

function drawSubTitle0() {
  let elapsed = frameCount - typerFrame0;
  if (elapsed < mainText0.length * 3 + 60) return;
  s0GlowPulse += 0.04;
  let glow = sin(s0GlowPulse) * 0.5 + 0.5;
  let a    = lerp(100, 220, glow);
  textAlign(CENTER, CENTER);
  textFont('Orbitron, monospace');
  textSize(12);
  drawingContext.save();
  drawingContext.shadowColor = COL.gold;
  drawingContext.shadowBlur  = glow * 20;
  fill(255, 215, 0, a);
  noStroke();
  text(subText0, width / 2, height / 2 + 60);
  drawingContext.restore();
  textAlign(LEFT);
}

function handleScene0Click() { goToScene(1); }

// ============================================================
//  SCENE 1 — AI 情緒打卡星球
// ============================================================
const EMOTIONS = [
  { id:'anxious', zh:'焦慮', emoji:'😰', col:'#ff4466',
    particle:{ speed:8, size:4, chaos:2.0, shape:'shard' },
    advice:['建議：短暫休息，進行 5 分鐘腹式呼吸','試試「番茄工作法」：專注 25 分鐘，休息 5 分鐘','現在適合觀看短片或聆聽輕音樂，讓大腦緩衝','AI 提醒：焦慮是學習的訊號，先接納它'] },
  { id:'calm', zh:'平靜', emoji:'😌', col:'#00f5ff',
    particle:{ speed:1.5, size:3, chaos:0.1, shape:'wave' },
    advice:['建議：現在是深度學習的最佳時機','試試閱讀長篇文章或解決複雜問題','冥想 10 分鐘能強化這種狀態','AI 提醒：平靜的心適合吸收新知識'] },
  { id:'excited', zh:'興奮', emoji:'🚀', col:'#ffd700',
    particle:{ speed:6, size:5, chaos:1.2, shape:'burst' },
    advice:['建議：把能量導向創意專案或小組討論','用心智圖記下所有靈感，不要過濾','現在適合學習新技能或嘗試挑戰性任務','AI 提醒：興奮狀態下學習記憶效率提升 40%'] },
  { id:'tired', zh:'疲倦', emoji:'😴', col:'#bf5fff',
    particle:{ speed:0.8, size:2, chaos:0.05, shape:'drift' },
    advice:['建議：先小睡 20 分鐘（超過會更累）','試試輕度活動：散步 10 分鐘','疲倦時適合複習舊知識，而非學新內容','AI 提醒：睡眠是記憶鞏固的關鍵過程'] }
];

let selectedEmotion1 = null;
let emotionParticles1 = [];
let planetPulse1 = 0;
let s1Initialized = false;
let adviceAlpha1  = 0;
let adviceIndex1  = 0;

function initScene1() {
  emotionParticles1 = [];
  selectedEmotion1  = null;
  adviceAlpha1      = 0;
  s1Initialized     = true;
}

function enterScene1() { spawnEmotionParticles1(EMOTIONS[1]); }
function exitScene1()  { emotionParticles1 = []; }

function drawScene1() {
  background(10, 10, 26);
  drawStarfield1();
  drawPlanet1();
  updateAndDrawParticles1();
  drawEmotionButtons1();
  if (selectedEmotion1 !== null) drawAdviceText1();
  drawSceneTitle1();
}

function drawStarfield1() {
  noStroke();
  for (let s of stars0) {
    if (!s.isMeteor) {
      let a = sin(frameCount * 0.02 + s.twinkleOffset) * 30 + 100;
      fill(180, 200, 255, a);
      ellipse(s.x, s.y, s.size * 0.8, s.size * 0.8);
    }
  }
}

function drawPlanet1() {
  let cx = width / 2, cy = height * 0.38;
  let baseR = min(width, height) * 0.13;
  planetPulse1 += 0.025;
  let breathe = sin(planetPulse1) * 0.06 + 1.0;
  let planetCol = selectedEmotion1 ? selectedEmotion1.col : COL.cyan;
  let c = hexToP5Color(planetCol);
  drawingContext.save();
  for (let r = 4; r > 0; r--) {
    drawingContext.shadowColor = planetCol;
    drawingContext.shadowBlur  = 40 * r;
    noStroke();
    fill(red(c), green(c), blue(c), map(r, 0, 4, 5, 25));
    ellipse(cx, cy, (baseR * breathe + 40 * r) * 2, (baseR * breathe + 40 * r) * 2);
  }
  drawingContext.restore();
  drawingContext.save();
  drawingContext.shadowColor = planetCol;
  drawingContext.shadowBlur  = 50;
  for (let i = 10; i > 0; i--) {
    let ratio = i / 10;
    fill(red(c) * ratio + 10 * (1-ratio), green(c) * ratio + 10 * (1-ratio), blue(c) * ratio + 10 * (1-ratio), 240);
    noStroke();
    ellipse(cx, cy, baseR * breathe * 2 * ratio, baseR * breathe * 2 * ratio);
  }
  drawingContext.restore();
  noStroke(); fill(255, 255, 255, 40);
  ellipse(cx - baseR * 0.25, cy - baseR * 0.25, baseR * 0.6, baseR * 0.4);
  drawingContext.save();
  drawingContext.shadowColor = planetCol;
  drawingContext.shadowBlur  = 10;
  noFill(); stroke(red(c), green(c), blue(c), 80); strokeWeight(1);
  push(); translate(cx, cy); rotate(0.4);
  ellipse(0, 0, baseR * 3.2, baseR * 0.8);
  pop();
  drawingContext.restore();
}

function spawnEmotionParticles1(emotion) {
  emotionParticles1 = [];
  let cx = width / 2, cy = height * 0.38;
  for (let i = 0; i < 120; i++) {
    let angle = random(TWO_PI), dist = random(80, 200);
    let sp = emotion.particle;
    emotionParticles1.push({
      x: cx + cos(angle) * dist, y: cy + sin(angle) * dist,
      vx: cos(angle) * random(sp.speed * 0.2, sp.speed),
      vy: sin(angle) * random(sp.speed * 0.2, sp.speed) + random(-sp.chaos, sp.chaos),
      size: random(sp.size * 0.5, sp.size * 1.5), life: 1.0,
      decay: random(0.003, 0.012), col: emotion.col,
      angle, dist, orbitSpeed: random(-0.015, 0.015) * (sp.chaos + 0.1), shape: sp.shape
    });
  }
}

function updateAndDrawParticles1() {
  let cx = width / 2, cy = height * 0.38;
  if (selectedEmotion1 && emotionParticles1.length < 60) spawnEmotionParticles1(selectedEmotion1);
  drawingContext.save();
  for (let i = emotionParticles1.length - 1; i >= 0; i--) {
    let p = emotionParticles1[i];
    if (p.shape === 'wave') {
      p.angle += p.orbitSpeed;
      p.x = cx + cos(p.angle) * p.dist;
      p.y = cy + sin(p.angle) * p.dist;
    } else if (p.shape === 'shard') {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97;
    } else if (p.shape === 'burst') {
      p.angle += p.orbitSpeed * 2;
      p.dist = lerp(p.dist, p.dist + 0.3, 0.05);
      p.x = cx + cos(p.angle) * p.dist;
      p.y = cy + sin(p.angle) * p.dist;
    } else {
      p.x += p.vx * 0.5 + sin(frameCount * 0.01 + p.angle) * 0.3;
      p.y += p.vy * 0.3 + cos(frameCount * 0.01 + p.angle) * 0.3;
    }
    p.life -= p.decay;
    if (p.life <= 0) { emotionParticles1.splice(i, 1); continue; }
    let c = hexToP5Color(p.col);
    drawingContext.shadowColor = p.col;
    drawingContext.shadowBlur  = 10;
    fill(red(c), green(c), blue(c), p.life * 200);
    noStroke();
    ellipse(p.x, p.y, p.size * p.life, p.size * p.life);
  }
  drawingContext.restore();
}

function drawEmotionButtons1() {
  let bw = min(width * 0.18, 110), bh = 52;
  let gap = min(width * 0.05, 24);
  let totalW = EMOTIONS.length * bw + (EMOTIONS.length - 1) * gap;
  let startX = (width - totalW) / 2;
  let by = height * 0.72;
  for (let i = 0; i < EMOTIONS.length; i++) {
    let em = EMOTIONS[i], bx = startX + i * (bw + gap);
    let isSelected = selectedEmotion1 && selectedEmotion1.id === em.id;
    let hover = mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh;
    let c = hexToP5Color(em.col);
    drawingContext.save();
    drawingContext.shadowColor = em.col;
    drawingContext.shadowBlur  = isSelected ? 30 : (hover ? 15 : 5);
    if (isSelected) fill(red(c), green(c), blue(c), 60);
    else if (hover) fill(red(c), green(c), blue(c), 30);
    else fill(20, 20, 40, 180);
    stroke(red(c), green(c), blue(c), isSelected ? 200 : 80);
    strokeWeight(1.5);
    rect(bx, by, bw, bh, 8);
    noStroke(); fill(255);
    textAlign(CENTER, CENTER); textSize(22);
    text(em.emoji, bx + bw * 0.35, by + bh * 0.38);
    drawingContext.shadowBlur = isSelected ? 15 : 0;
    fill(red(c), green(c), blue(c), isSelected ? 255 : 180);
    textFont('Noto Sans TC'); textSize(13);
    text(em.zh, bx + bw * 0.65, by + bh * 0.62);
    drawingContext.restore();
  }
  textAlign(LEFT);
}

function drawAdviceText1() {
  if (adviceAlpha1 < 255) adviceAlpha1 = min(adviceAlpha1 + 4, 255);
  let advice = selectedEmotion1.advice;
  let rx = width * 0.65, ry = height * 0.3, rw = min(width * 0.28, 240);
  fill(10, 15, 30, 160);
  stroke(0, 245, 255, 40); strokeWeight(1);
  rect(rx, ry, rw, 180, 10);
  drawingContext.save();
  drawingContext.shadowColor = COL.cyan;
  drawingContext.shadowBlur  = 12;
  textFont('Orbitron, monospace'); textSize(9);
  fill(0, 245, 255, adviceAlpha1); noStroke(); textAlign(LEFT);
  text('AI LEARNING ADVISOR', rx + 14, ry + 22);
  drawingContext.restore();
  stroke(0, 245, 255, 40); strokeWeight(0.5);
  line(rx + 14, ry + 30, rx + rw - 14, ry + 30);
  noStroke(); textFont('Noto Sans TC'); textSize(11);
  for (let i = 0; i < advice.length; i++) {
    fill(200, 220, 255, constrain(adviceAlpha1 - i * 30, 0, 200));
    text(advice[i], rx + 14, ry + 50 + i * 34, rw - 28, 30);
  }
}

function drawSceneTitle1() {
  textAlign(LEFT);
  textFont('Orbitron, monospace'); textSize(10);
  drawingContext.save();
  drawingContext.shadowColor = COL.cyan;
  drawingContext.shadowBlur  = 15;
  fill(0, 245, 255, 180); noStroke();
  text('SCENE 01  ·  AI EMOTION CHECK-IN', 24, height * 0.12);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(width < 600 ? 18 : 24);
  drawingContext.save();
  drawingContext.shadowColor = COL.cyan;
  drawingContext.shadowBlur  = 20;
  fill(230, 245, 255, 220); noStroke();
  text('AI 情緒打卡星球', 24, height * 0.12 + 28);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(13);
  fill(160, 180, 200, 180); noStroke();
  text('點擊下方選擇今天的情緒，星球會回應你', 24, height * 0.12 + 52);
}

function handleScene1Click() {
  let bw = min(width * 0.18, 110), bh = 52;
  let gap = min(width * 0.05, 24);
  let totalW = EMOTIONS.length * bw + (EMOTIONS.length - 1) * gap;
  let startX = (width - totalW) / 2;
  let by = height * 0.72;
  for (let i = 0; i < EMOTIONS.length; i++) {
    let bx = startX + i * (bw + gap);
    if (mouseX > bx && mouseX < bx + bw && mouseY > by && mouseY < by + bh) {
      selectedEmotion1 = EMOTIONS[i];
      adviceAlpha1 = 0; adviceIndex1 = 0;
      spawnEmotionParticles1(EMOTIONS[i]);
      return;
    }
  }
  if (mouseY < height * 0.65) goToScene(2);
}

// ============================================================
//  SCENE 2 — 難民換位體驗地圖
// ============================================================
const CONTINENTS = [
  { name:'北美洲', pts:[[0.05,0.12],[0.22,0.08],[0.28,0.15],[0.30,0.30],[0.22,0.45],[0.15,0.42],[0.08,0.38],[0.04,0.22]], col:'#1a3a5c' },
  { name:'南美洲', pts:[[0.18,0.48],[0.28,0.44],[0.32,0.55],[0.30,0.72],[0.22,0.80],[0.14,0.72],[0.13,0.58]], col:'#1a3a5c' },
  { name:'歐洲',   pts:[[0.44,0.10],[0.56,0.08],[0.58,0.18],[0.54,0.28],[0.46,0.30],[0.42,0.22]], col:'#1a3a5c' },
  { name:'非洲',   pts:[[0.44,0.32],[0.56,0.28],[0.62,0.40],[0.60,0.60],[0.52,0.72],[0.44,0.65],[0.40,0.50]], col:'#1a3a5c' },
  { name:'亞洲',   pts:[[0.56,0.08],[0.85,0.06],[0.90,0.20],[0.85,0.38],[0.75,0.45],[0.65,0.42],[0.58,0.35],[0.54,0.22]], col:'#1a3a5c' },
  { name:'澳洲',   pts:[[0.75,0.55],[0.88,0.52],[0.92,0.65],[0.88,0.74],[0.78,0.76],[0.72,0.68]], col:'#1a3a5c' }
];

const HOTSPOTS = [
  { x:0.59, y:0.28, name:'敘利亞', edu:'教育指數: 0.58', refugees:'680萬難民', story:'如果你是一個12歲的敘利亞難民\n你已經三年沒有上學\n你帶著一本算數課本逃過邊境\n那是你最珍貴的財產' },
  { x:0.52, y:0.18, name:'烏克蘭', edu:'教育指數: 0.81', refugees:'580萬難民', story:'如果你是一個12歲的烏克蘭孩子\n昨天你還在學校上數學課\n今天你坐在難民營的帳篷裡\n用手機接收老師傳來的作業' },
  { x:0.47, y:0.48, name:'蘇丹',   edu:'教育指數: 0.42', refugees:'380萬難民', story:'如果你是一個12歲的蘇丹女孩\n你走了300公里才找到一所學校\n學校只有一位老師\n卻有200個學生' },
  { x:0.73, y:0.42, name:'阿富汗', edu:'教育指數: 0.51', refugees:'260萬難民', story:'如果你是一個12歲的阿富汗女孩\n你冒著風險偷偷去上學\n因為有人說女孩不應該讀書\n但你知道知識是誰也搶不走的' }
];

const COUNTRY_DATA = [
  { x:0.10, y:0.22, name:'美國', edu:'教育指數: 0.90', pop:'3.3億', news:'SDG 13: 拜登政府投入百億推動綠能轉型', link:'https://www.un.org/sustainabledevelopment/climate-action/' },
  { x:0.50, y:0.18, name:'法國', edu:'教育指數: 0.88', pop:'6800萬', news:'SDG 7: 法國核能與再生能源並行計畫', link:'https://www.un.org/sustainabledevelopment/energy/' },
  { x:0.75, y:0.25, name:'中國', edu:'教育指數: 0.78', pop:'14億', news:'SDG 9: 智慧基礎建設與數位絲綢之路', link:'https://www.un.org/sustainabledevelopment/infrastructure-industrialization/' },
  { x:0.80, y:0.42, name:'印度', edu:'教育指數: 0.63', pop:'14億', news:'SDG 1: 印度農村數位金融普及計畫', link:'https://www.un.org/sustainabledevelopment/poverty/' },
  { x:0.84, y:0.62, name:'澳洲', edu:'教育指數: 0.93', pop:'2600萬', news:'SDG 14: 大堡礁珊瑚復育技術突破', link:'https://www.un.org/sustainabledevelopment/oceans/' },
  { x:0.50, y:0.50, name:'埃及', edu:'教育指數: 0.62', pop:'1億', news:'SDG 6: 尼羅河水資源管理與海水淡化', link:'https://www.un.org/sustainabledevelopment/water-and-sanitation/' }
];

let hoveredHotspot2 = null, hoveredCountry2 = null, clickedHotspot2 = null;
let shatterParticles2 = [], shatterProgress2 = 0, storyAlpha2 = 0, refugeeFlow2 = [];

function initScene2() {
  hoveredHotspot2 = null; hoveredCountry2 = null; clickedHotspot2 = null;
  shatterParticles2 = []; shatterProgress2 = 0; storyAlpha2 = 0;
  initRefugeeFlow2();
}

function enterScene2() { initRefugeeFlow2(); }

function initRefugeeFlow2() {
  refugeeFlow2 = [];
  for (let i = 0; i < 80; i++) {
    refugeeFlow2.push({
      x: random(width * 0.4, width * 0.7), y: random(height * 0.1, height * 0.5),
      tx: random(width * 0.3, width * 0.55), ty: random(height * 0.2, height * 0.6),
      speed: random(0.3, 0.9), size: random(1.5, 3.5),
      col: random([COL.gold, COL.white, COL.purple]), alpha: random(60, 160)
    });
  }
}

function drawScene2() {
  background(10, 10, 26);
  drawMapGrid2();
  drawContinents2();
  drawHotspots2();
  drawCountryPoints2();
  drawRefugeeFlow2();
  drawHoverBubble2();
  if (clickedHotspot2) { drawShatterEffect2(); drawStoryText2(); }
  drawSceneTitle2();
  drawHint2();
}

function drawMapGrid2() {
  stroke(0, 245, 255, 8); strokeWeight(0.5);
  for (let x = 0; x <= width; x += width / 18) line(x, 0, x, height);
  for (let y = 0; y <= height; y += height / 12) line(0, y, width, y);
}

function drawContinents2() {
  for (let cont of CONTINENTS) {
    let pts = cont.pts.map(p => [p[0] * width, p[1] * height]);
    drawingContext.save();
    drawingContext.shadowColor = COL.cyan;
    drawingContext.shadowBlur  = 8;
    fill(26, 58, 92, 180); stroke(0, 245, 255, 60); strokeWeight(1.2);
    beginShape();
    for (let [px, py] of pts) vertex(px, py);
    endShape(CLOSE);
    drawingContext.restore();
    let cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    let cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    textAlign(CENTER, CENTER); textFont('Noto Sans TC'); textSize(9);
    fill(100, 160, 200, 120); noStroke();
    text(cont.name, cx, cy);
  }
  textAlign(LEFT);
}

function drawHotspots2() {
  for (let hs of HOTSPOTS) {
    let hx = hs.x * width, hy = hs.y * height;
    let isHovered = (hoveredHotspot2 === hs);
    let pulse = sin(frameCount * 0.06) * 0.5 + 0.5;
    drawingContext.save();
    drawingContext.shadowColor = COL.red;
    drawingContext.shadowBlur  = 20;
    noFill(); stroke(255, 68, 102, 80 + pulse * 80); strokeWeight(1);
    ellipse(hx, hy, 20 + pulse * 15, 20 + pulse * 15);
    ellipse(hx, hy, 35 + pulse * 20, 35 + pulse * 20);
    fill(255, 68, 102, 200 + pulse * 55); noStroke();
    ellipse(hx, hy, 8, 8);
    drawingContext.restore();
    if (isHovered) {
      textAlign(CENTER); textFont('Noto Sans TC'); textSize(11);
      drawingContext.save();
      drawingContext.shadowColor = COL.red;
      drawingContext.shadowBlur  = 15;
      fill(255, 180, 180, 220); noStroke();
      text(hs.name, hx, hy - 28);
      drawingContext.restore();
    }
    textAlign(LEFT);
  }
  hoveredHotspot2 = null;
  for (let hs of HOTSPOTS) {
    if (dist(mouseX, mouseY, hs.x * width, hs.y * height) < 25) hoveredHotspot2 = hs;
  }
}

function drawRefugeeFlow2() {
  for (let p of refugeeFlow2) {
    p.x = lerp(p.x, p.tx + sin(frameCount * 0.01 + p.speed) * 20, 0.008);
    p.y = lerp(p.y, p.ty + cos(frameCount * 0.01 + p.speed) * 15, 0.008);
    if (dist(p.x, p.tx, p.y, p.ty) < 5) {
      p.tx = random(width * 0.3, width * 0.7);
      p.ty = random(height * 0.1, height * 0.6);
    }
    let c = hexToP5Color(p.col);
    noStroke(); fill(red(c), green(c), blue(c), p.alpha * 0.6);
    ellipse(p.x, p.y, p.size, p.size);
  }
}

function drawCountryPoints2() {
  for (let cd of COUNTRY_DATA) {
    let cx = cd.x * width, cy = cd.y * height;
    drawingContext.save();
    drawingContext.shadowColor = COL.cyan;
    drawingContext.shadowBlur  = 10;
    noStroke(); fill(hexToP5Color(COL.cyan, 220));
    ellipse(cx, cy, 6, 6);
    drawingContext.restore();
  }
}

function drawHoverBubble2() {
  hoveredCountry2 = null;
  for (let cd of COUNTRY_DATA) {
    let cx = cd.x * width, cy = cd.y * height;
    if (dist(mouseX, mouseY, cx, cy) < 30) {
      hoveredCountry2 = cd;
      let bw = 220, bh = 95;
      let bx = constrain(cx + 10, 10, width - bw - 10);
      let by = constrain(cy - 70, 10, height - bh - 10);
      drawingContext.save();
      drawingContext.shadowColor = COL.cyan;
      drawingContext.shadowBlur  = 15;
      fill(10, 20, 40, 210); stroke(0, 245, 255, 120); strokeWeight(1);
      rect(bx, by, bw, bh, 6);
      drawingContext.restore();
      noStroke(); textFont('Noto Sans TC'); textSize(12);
      fill(0, 245, 255, 220); text(cd.name, bx + 10, by + 18);
      textSize(10); fill(180, 200, 220, 180);
      text(cd.edu, bx + 10, by + 34); text('人口 ' + cd.pop, bx + 10, by + 50);
      stroke(0, 245, 255, 30); line(bx + 10, by + 58, bx + bw - 10, by + 58);
      noStroke(); fill(255, 215, 0, 220); textSize(9);
      text(cd.news, bx + 10, by + 72, bw - 20);
      fill(0, 245, 255, 150); text('點擊開啟官網資料 →', bx + 10, by + 86);
    }
  }
}

function drawShatterEffect2() {
  shatterProgress2 = min(shatterProgress2 + 0.015, 1);
  for (let p of shatterParticles2) {
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.96; p.vy *= 0.96;
    p.life -= 0.008; p.rot += p.rotSpeed;
    if (p.life > 0) {
      let c = hexToP5Color(p.col);
      drawingContext.save();
      drawingContext.shadowColor = p.col;
      drawingContext.shadowBlur  = 12;
      fill(red(c), green(c), blue(c), p.life * 180); noStroke();
      push(); translate(p.x, p.y); rotate(p.rot);
      rect(-p.w / 2, -p.h / 2, p.w, p.h);
      pop();
      drawingContext.restore();
    }
  }
  if (shatterProgress2 > 0.3) {
    fill(5, 5, 15, min((shatterProgress2 - 0.3) * 500, 200));
    noStroke(); rect(0, 0, width, height);
  }
}

function triggerShatter2(hs) {
  clickedHotspot2 = hs; shatterProgress2 = 0; storyAlpha2 = 0; shatterParticles2 = [];
  let hx = hs.x * width, hy = hs.y * height;
  for (let i = 0; i < 80; i++) {
    let angle = random(TWO_PI), speed = random(3, 12);
    shatterParticles2.push({
      x: hx, y: hy, vx: cos(angle) * speed, vy: sin(angle) * speed,
      life: 1.0, w: random(5, 25), h: random(2, 8),
      rot: random(TWO_PI), rotSpeed: random(-0.1, 0.1),
      col: random([COL.red, COL.gold, COL.white])
    });
  }
}

function drawStoryText2() {
  if (shatterProgress2 < 0.5) return;
  storyAlpha2 = min(storyAlpha2 + 3, 220);
  let hs = clickedHotspot2, lines = hs.story.split('\n');
  let cx = width / 2, cy = height / 2;
  drawingContext.save();
  drawingContext.shadowColor = COL.gold;
  drawingContext.shadowBlur  = 25;
  textAlign(CENTER, CENTER); textFont('Orbitron, monospace'); textSize(11);
  fill(255, 215, 0, storyAlpha2); noStroke();
  text('— ' + hs.name + ' —', cx, cy - 90);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(width < 600 ? 14 : 18);
  for (let i = 0; i < lines.length; i++) {
    let a = constrain(storyAlpha2 - i * 25, 0, 200);
    drawingContext.save();
    drawingContext.shadowColor = COL.white;
    drawingContext.shadowBlur  = 8;
    fill(230, 240, 255, a); noStroke();
    text(lines[i], cx, cy - 50 + i * 30);
    drawingContext.restore();
  }
  textSize(11); fill(255, 100, 100, storyAlpha2 * 0.7);
  text('🔴 ' + hs.edu + '  ·  ' + hs.refugees, cx, cy + 90);
  textSize(10); textFont('Orbitron, monospace');
  fill(100, 120, 140, constrain(storyAlpha2 - 100, 0, 150));
  text('CLICK ANYWHERE TO CLOSE', cx, cy + 120);
  textAlign(LEFT);
}

function drawSceneTitle2() {
  textAlign(LEFT); textFont('Orbitron, monospace'); textSize(10);
  drawingContext.save();
  drawingContext.shadowColor = COL.red;
  drawingContext.shadowBlur  = 15;
  fill(255, 68, 102, 180); noStroke();
  text('SCENE 02  ·  REFUGEE PERSPECTIVE MAP', 24, height * 0.12);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(width < 600 ? 18 : 24);
  drawingContext.save();
  drawingContext.shadowColor = COL.red;
  drawingContext.shadowBlur  = 18;
  fill(255, 200, 200, 220); noStroke();
  text('難民換位體驗地圖', 24, height * 0.12 + 28);
  drawingContext.restore();
}

function drawHint2() {
  textFont('Noto Sans TC'); textSize(11); fill(100, 130, 160, 140); noStroke();
  text('點擊閃爍紅點，進入難民視角', 24, height - 20);
}

function handleScene2Click() {
  if (clickedHotspot2) { clickedHotspot2 = null; shatterParticles2 = []; return; }
  if (hoveredCountry2) { window.open(hoveredCountry2.link, '_blank'); return; }
  for (let hs of HOTSPOTS) {
    if (dist(mouseX, mouseY, hs.x * width, hs.y * height) < 30) { triggerShatter2(hs); return; }
  }
  if (mouseY < height * 0.8 && !hoveredHotspot2) goToScene(3);
}

// ============================================================
//  SCENE 3 — 瀕危語言守護者
// ============================================================
const LANG_LEAVES = [
  { name:'阿美語',   word:'masakit（謝謝）',      col:'#00f5ff', alive:true  },
  { name:'泰雅語',   word:'lokah（你好）',          col:'#00ff88', alive:true  },
  { name:'排灣語',   word:'tjuaqativu（我愛你）',   col:'#bf5fff', alive:true  },
  { name:'布農語',   word:'mas-qaida（美麗）',      col:'#ffd700', alive:true  },
  { name:'魯凱語',   word:'malu（平安）',           col:'#ff9944', alive:true  },
  { name:'卑南語',   word:'uwari（朋友）',          col:'#44ffaa', alive:false },
  { name:'鄒語',     word:'cou（人）',             col:'#ff6688', alive:false },
  { name:'達悟語',   word:'karawtan（太陽）',       col:'#ffdd44', alive:false },
  { name:'賽夏語',   word:'boehoe\'（山）',          col:'#88aaff', alive:false },
  { name:'噶瑪蘭語', word:'qatiRa（水）',           col:'#ff88cc', alive:false },
  { name:'夏威夷語', word:'aloha（愛）',             col:'#ffaa55', alive:false },
  { name:'馬恩島語', word:'shee-joor（感謝）',      col:'#aaffdd', alive:false }
];

let leaves3 = [], activeLang3 = null, displayAlpha3 = 0;
let treeHealth3 = 0.5, leafParticles3 = [], countdownBlink3 = 0;

function initScene3() {
  leaves3 = []; activeLang3 = null; treeHealth3 = 0.4; leafParticles3 = [];
  generateLeaves3();
}

function enterScene3() { generateLeaves3(); }
function exitScene3()  { leafParticles3 = []; }

function generateLeaves3() {
  leaves3 = [];
  let treeX = width * 0.38, treeY = height * 0.85;
  const branchPositions = [
    { bx:-80, by:-280, angle:-0.4 }, { bx:90,  by:-260, angle:0.5  },
    { bx:-60, by:-200, angle:-0.6 }, { bx:70,  by:-180, angle:0.7  },
    { bx:-40, by:-320, angle:-0.2 }, { bx:50,  by:-340, angle:0.3  },
    { bx:-90, by:-150, angle:-0.8 }, { bx:85,  by:-140, angle:0.9  },
    { bx:-20, by:-370, angle:-0.1 }, { bx:30,  by:-380, angle:0.2  },
    { bx:-70, by:-230, angle:-0.5 }, { bx:60,  by:-210, angle:0.6  }
  ];
  for (let i = 0; i < LANG_LEAVES.length; i++) {
    let bp = branchPositions[i % branchPositions.length];
    let len = random(30, 70);
    let lx = treeX + bp.bx + sin(bp.angle) * len + random(-15, 15);
    let ly = treeY + bp.by - cos(bp.angle) * len + random(-15, 15);
    leaves3.push({
      lang: LANG_LEAVES[i], x: lx, y: ly, targetY: ly,
      size: random(28, 44), angle: random(-0.3, 0.3),
      wobble: random(TWO_PI), wobbleSpeed: random(0.02, 0.05),
      alive: LANG_LEAVES[i].alive, glowing: false, glowAmount: 0,
      fall: LANG_LEAVES[i].alive ? 0 : random(0.2, 1.0)
    });
  }
}

function drawScene3() {
  background(10, 10, 26);
  for (let s of stars0) {
    if (!s.isMeteor && random() > 0.5) {
      let a = sin(frameCount * 0.02 + s.twinkleOffset) * 20 + 60;
      noStroke(); fill(180, 200, 255, a);
      ellipse(s.x, s.y, s.size * 0.7, s.size * 0.7);
    }
  }
  drawGroundGlow3();
  drawTree3();
  drawLeaves3();
  drawLeafParticles3();
  if (activeLang3) drawLangDisplay3();
  drawCountdown3();
  drawSceneTitle3();
}

function drawGroundGlow3() {
  let gx = width * 0.38, gy = height * 0.88;
  drawingContext.save();
  for (let r = 5; r > 0; r--) {
    drawingContext.shadowColor = '#00ff88';
    drawingContext.shadowBlur  = 20 * r;
    noStroke(); fill(0, 80, 40, 8);
    ellipse(gx, gy, 200 * r * 0.4, 40 * r * 0.3);
  }
  drawingContext.restore();
}

function drawTree3() {
  let tx = width * 0.38, ty = height * 0.85, trunkH = height * 0.45;
  drawingContext.save();
  drawingContext.shadowColor = '#4a3020';
  drawingContext.shadowBlur  = 15;
  stroke(60, 40, 20); strokeWeight(lerp(8, 18, treeHealth3));
  noFill();
  beginShape();
  curveVertex(tx, ty); curveVertex(tx, ty);
  curveVertex(tx - 10, ty - trunkH * 0.5);
  curveVertex(tx + 5, ty - trunkH * 0.8);
  curveVertex(tx, ty - trunkH); curveVertex(tx, ty - trunkH);
  endShape();
  const branches = [
    [tx, ty-trunkH*0.6, tx-80, ty-trunkH*0.85, 5],
    [tx, ty-trunkH*0.6, tx+90, ty-trunkH*0.8,  5],
    [tx, ty-trunkH*0.7, tx-60, ty-trunkH*1.0,  4],
    [tx, ty-trunkH*0.7, tx+70, ty-trunkH*0.95, 4],
    [tx, ty-trunkH*0.8, tx-40, ty-trunkH*1.1,  3],
    [tx, ty-trunkH*0.8, tx+50, ty-trunkH*1.05, 3],
    [tx, ty-trunkH*0.5, tx-90, ty-trunkH*0.65, 4],
    [tx, ty-trunkH*0.5, tx+85, ty-trunkH*0.62, 4]
  ];
  for (let [x1,y1,x2,y2,w] of branches) {
    stroke(lerp(40,80,treeHealth3), lerp(30,55,treeHealth3), 20);
    strokeWeight(w * lerp(0.5, 1.0, treeHealth3));
    line(x1, y1, x2, y2);
  }
  drawingContext.restore();
}

function drawLeaves3() {
  for (let leaf of leaves3) {
    leaf.wobble += leaf.wobbleSpeed;
    if (!leaf.alive && leaf.fall < 1.0) {
      leaf.fall = min(leaf.fall + 0.002, 1.0);
      leaf.targetY = leaf.y + leaf.fall * 60;
    }
    leaf.y = lerp(leaf.y, leaf.targetY, 0.02);
    leaf.glowAmount = leaf.glowing ? min(leaf.glowAmount + 0.05, 1.0) : max(leaf.glowAmount - 0.02, 0);
    let wobbleX = sin(leaf.wobble) * 3;
    let c = hexToP5Color(leaf.lang.col);
    drawingContext.save();
    drawingContext.shadowColor = leaf.lang.col;
    drawingContext.shadowBlur  = leaf.alive ? 8 + leaf.glowAmount * 25 : 2;
    push(); translate(leaf.x + wobbleX, leaf.y); rotate(leaf.angle + sin(leaf.wobble * 0.7) * 0.1);
    let a = leaf.alive ? lerp(160, 240, treeHealth3) : 80;
    let r = leaf.alive ? red(c)   : lerp(red(c), 80, leaf.fall);
    let g = leaf.alive ? green(c) : lerp(green(c), 60, leaf.fall);
    let b = leaf.alive ? blue(c)  : lerp(blue(c), 40, leaf.fall);
    fill(r, g, b, a); noStroke();
    ellipse(0, 0, leaf.size * 1.4, leaf.size * 0.8);
    stroke(r * 0.6, g * 0.6, b * 0.6, a * 0.5); strokeWeight(0.5);
    line(-leaf.size * 0.5, 0, leaf.size * 0.5, 0);
    noStroke(); fill(255, 255, 255, leaf.alive ? a * 0.9 : 60);
    textAlign(CENTER, CENTER); textFont('Noto Sans TC'); textSize(leaf.alive ? 9 : 7);
    text(leaf.lang.name, 0, 0);
    pop();
    drawingContext.restore();
    leaf.glowing = (dist(mouseX, mouseY, leaf.x + wobbleX, leaf.y) < leaf.size * 0.9);
  }
  textAlign(LEFT);
}

function drawLeafParticles3() {
  drawingContext.save();
  for (let i = leafParticles3.length - 1; i >= 0; i--) {
    let p = leafParticles3[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life -= 0.02;
    if (p.life <= 0) { leafParticles3.splice(i, 1); continue; }
    let c = hexToP5Color(p.col);
    drawingContext.shadowColor = p.col; drawingContext.shadowBlur = 10;
    fill(red(c), green(c), blue(c), p.life * 200); noStroke();
    ellipse(p.x, p.y, p.size * p.life, p.size * p.life);
  }
  drawingContext.restore();
}

function drawLangDisplay3() {
  if (displayAlpha3 < 240) displayAlpha3 = min(displayAlpha3 + 5, 240);
  let lang = activeLang3.lang;
  let rx = width * 0.62, ry = height * 0.25, rw = min(width * 0.32, 260), rh = 160;
  drawingContext.save();
  drawingContext.shadowColor = lang.col;
  drawingContext.shadowBlur  = 20;
  fill(8, 12, 25, 210); stroke(hexToP5Color(lang.col, 100)); strokeWeight(1);
  rect(rx, ry, rw, rh, 12);
  drawingContext.restore();
  drawingContext.save();
  drawingContext.shadowColor = lang.col;
  drawingContext.shadowBlur  = 20;
  textAlign(LEFT); textFont('Noto Sans TC'); textSize(20);
  fill(hexToP5Color(lang.col, displayAlpha3)); noStroke();
  text(lang.name, rx + 18, ry + 34);
  drawingContext.restore();
  textSize(15); fill(230, 245, 255, displayAlpha3 * 0.9); noStroke();
  text(lang.word, rx + 18, ry + 62);
  let statusCol = lang.alive ? COL.green : '#ff6644';
  textSize(11); fill(hexToP5Color(statusCol, displayAlpha3));
  text(lang.alive ? '🟢 現用語言' : '🔴 瀕危語言', rx + 18, ry + 90);
  textSize(10); fill(160, 180, 200, displayAlpha3 * 0.6);
  text(lang.alive ? '繼續傳承這份文化遺產！' : '你的點擊讓它再次發光✨', rx + 18, ry + 115);
  drawingContext.save();
  drawingContext.shadowColor = lang.col;
  drawingContext.shadowBlur  = 15;
  textSize(28); textAlign(RIGHT);
  text('🍃', rx + rw - 14, ry + rh - 14);
  drawingContext.restore();
  textAlign(LEFT);
}

function drawCountdown3() {
  countdownBlink3 += 0.04;
  let blink = sin(countdownBlink3) * 0.5 + 0.5;
  let rx = width - 260, ry = height - 80;
  fill(20, 5, 5, 160); stroke(255, 68, 102, 80 + blink * 80); strokeWeight(1);
  rect(rx, ry, 240, 58, 8);
  drawingContext.save();
  drawingContext.shadowColor = COL.red;
  drawingContext.shadowBlur  = blink * 20;
  noStroke(); textFont('Noto Sans TC'); textSize(11);
  fill(255, 120, 120, 180 + blink * 75);
  text('⚠️ 全球每 14 天消失一種語言', rx + 12, ry + 22);
  textSize(10); fill(200, 100, 100, 150 + blink * 50);
  text('點擊葉片，守護瀕危語言的火種', rx + 12, ry + 42);
  drawingContext.restore();
}

function drawSceneTitle3() {
  textAlign(LEFT); textFont('Orbitron, monospace'); textSize(10);
  drawingContext.save();
  drawingContext.shadowColor = COL.green;
  drawingContext.shadowBlur  = 15;
  fill(0, 255, 136, 180); noStroke();
  text('SCENE 03  ·  ENDANGERED LANGUAGE GUARDIAN', 24, height * 0.12);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(width < 600 ? 18 : 24);
  drawingContext.save();
  drawingContext.shadowColor = COL.green;
  drawingContext.shadowBlur  = 18;
  fill(180, 255, 200, 220); noStroke();
  text('瀕危語言守護者', 24, height * 0.12 + 28);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(12);
  fill(120, 160, 140, 160); noStroke();
  text('點擊樹葉，讓瀕危語言重新發光', 24, height * 0.12 + 52);
}

function handleScene3Click() {
  for (let leaf of leaves3) {
    let wobbleX = sin(leaf.wobble) * 3;
    if (dist(mouseX, mouseY, leaf.x + wobbleX, leaf.y) < leaf.size * 0.9) {
      activeLang3 = leaf; displayAlpha3 = 0;
      leaf.alive = true; leaf.fall = 0; leaf.glowing = true;
      treeHealth3 = min(treeHealth3 + 0.05, 1.0);
      for (let i = 0; i < 20; i++) {
        let angle = random(TWO_PI), speed = random(1, 4);
        leafParticles3.push({
          x: leaf.x + wobbleX, y: leaf.y,
          vx: cos(angle) * speed, vy: sin(angle) * speed - 1,
          size: random(3, 8), life: 1.0, col: leaf.lang.col
        });
      }
      return;
    }
  }
  activeLang3 = null;
  if (mouseY < height * 0.75) goToScene(4);
}

// ============================================================
//  SCENE 4 — 2050 教室時光機
//  ★ 結果頁加入「進入 SDGs 知識宇宙」觸發邏輯
// ============================================================
const QUESTIONS4 = [
  { q:'你現在關心氣候變遷嗎？', opts:['非常關心，已採取行動','有些關心，但不知道怎麼做','還沒想過這個問題'] },
  { q:'你支持讓每個孩子都能接受教育嗎？', opts:['強烈支持，願意付出行動','支持，但覺得跟我沒什麼關係','沒有特別想法'] },
  { q:'如果你能改變一件事，你會選擇？', opts:['讓更多人有學習的機會','讓地球更乾淨、更健康','讓人們更加平等、互相理解'] }
];

const SDGS_ALL = [
  'SDG 1 消除貧窮','SDG 2 終止飢餓','SDG 3 健康福祉',
  'SDG 4 優質教育','SDG 5 性別平等','SDG 7 清潔能源',
  'SDG 10 減少不平等','SDG 11 永續城鄉','SDG 13 氣候行動',
  'SDG 16 和平正義','SDG 17 全球夥伴'
];

let s4Phase = 'quiz', s4QIndex = 0, s4Answers = [], s4Score = 0;
let s4BuildParticles = [], s4ResultAlpha = 0, s4QuizAlpha = 0;
let s4OptionHover = -1, s4BuildProgress = 0;
let s4EnterBtnShown = false; // 防止重複觸發

function initScene4() {
  s4Phase = 'quiz'; s4QIndex = 0; s4Answers = []; s4Score = 0;
  s4BuildParticles = []; s4ResultAlpha = 0; s4QuizAlpha = 0;
  s4BuildProgress = 0; s4EnterBtnShown = false;
}

function enterScene4() {
  s4Phase = 'quiz'; s4QIndex = 0; s4Answers = []; s4Score = 0;
  s4QuizAlpha = 0; s4ResultAlpha = 0; s4BuildParticles = []; s4EnterBtnShown = false;
}

function drawScene4() {
  background(10, 10, 26);
  drawStarfield1();
  if (s4Phase === 'quiz')     drawQuiz4();
  else if (s4Phase === 'building') drawBuilding4();
  else if (s4Phase === 'result')   drawResult4();
  drawSceneTitle4();
}

function drawQuiz4() {
  if (s4QuizAlpha < 255) s4QuizAlpha = min(s4QuizAlpha + 5, 255);
  let q = QUESTIONS4[s4QIndex], cx = width / 2, qy = height * 0.28;
  textAlign(CENTER); textFont('Orbitron, monospace'); textSize(10);
  drawingContext.save();
  drawingContext.shadowColor = COL.purple;
  drawingContext.shadowBlur  = 10;
  fill(191, 95, 255, s4QuizAlpha * 0.7); noStroke();
  text(`QUESTION ${s4QIndex + 1} / ${QUESTIONS4.length}`, cx, qy - 30);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(width < 600 ? 18 : 22);
  drawingContext.save();
  drawingContext.shadowColor = COL.white;
  drawingContext.shadowBlur  = 15;
  fill(230, 245, 255, s4QuizAlpha); noStroke();
  text(q.q, cx - (width * 0.7) / 2, qy, width * 0.7, 60);
  drawingContext.restore();
  s4OptionHover = -1;
  let bw = min(width * 0.55, 420), bh = 52, gap = 16, by = height * 0.46;
  for (let i = 0; i < q.opts.length; i++) {
    let bx = (width - bw) / 2, _by = by + i * (bh + gap);
    let isHover = mouseX > bx && mouseX < bx + bw && mouseY > _by && mouseY < _by + bh;
    if (isHover) s4OptionHover = i;
    let glowC = isHover ? COL.purple : COL.cyan;
    drawingContext.save();
    drawingContext.shadowColor = glowC;
    drawingContext.shadowBlur  = isHover ? 20 : 6;
    fill(isHover ? 40 : 15, isHover ? 40 : 15, isHover ? 100 : 38, 200);
    stroke(hexToP5Color(glowC, isHover ? 160 : 60)); strokeWeight(1.2);
    rect(bx, _by, bw, bh, 8);
    drawingContext.restore();
    textFont('Orbitron, monospace'); textSize(11);
    fill(hexToP5Color(glowC, isHover ? 220 : 120)); noStroke(); textAlign(LEFT);
    text(String.fromCharCode(65 + i), bx + 20, _by + bh / 2 + 5);
    textFont('Noto Sans TC'); textSize(14);
    fill(200, 220, 255, s4QuizAlpha * (isHover ? 1 : 0.85));
    text(q.opts[i], bx + 44, _by + bh / 2 + 5);
  }
  textAlign(LEFT);
}

function handleScene4Click() {
  if (s4Phase === 'quiz') handleQuizClick4();
  else if (s4Phase === 'result') { initScene4(); enterScene4(); }
}

function handleScene4KeyPress() {
  if (s4Phase === 'result' && (key === 'r' || key === 'R')) { initScene4(); enterScene4(); }
}

function handleQuizClick4() {
  let q = QUESTIONS4[s4QIndex];
  let bw = min(width * 0.55, 420), bh = 52, gap = 16, by = height * 0.46;
  for (let i = 0; i < q.opts.length; i++) {
    let bx = (width - bw) / 2, _by = by + i * (bh + gap);
    if (mouseX > bx && mouseX < bx + bw && mouseY > _by && mouseY < _by + bh) {
      s4Answers.push(i);
      if (i === 0) s4Score++;
      s4QIndex++; s4QuizAlpha = 0;
      if (s4QIndex >= QUESTIONS4.length) {
        s4Phase = 'building'; s4BuildProgress = 0;
        spawnBuildParticles4();
      }
      return;
    }
  }
}

function spawnBuildParticles4() {
  s4BuildParticles = [];
  let isUtopia = s4Score >= 2;
  for (let i = 0; i < 250; i++) {
    let targetX = random(width * 0.2, width * 0.8);
    let targetY = random(height * 0.25, height * 0.75);
    s4BuildParticles.push({
      x: isUtopia ? random(width) : targetX,
      y: isUtopia ? random(height) : targetY,
      tx: isUtopia ? targetX : random(-100, width + 100),
      ty: isUtopia ? targetY : random(-100, height + 100),
      size: random(3, 10),
      col: isUtopia
        ? random([COL.cyan, COL.gold, COL.green, COL.purple])
        : random(['#ff4444','#884422','#442211','#222222']),
      life: 1.0, speed: random(0.01, 0.04)
    });
  }
}

function drawBuilding4() {
  s4BuildProgress += 0.008;
  let isUtopia = s4Score >= 2, done = true;
  for (let p of s4BuildParticles) {
    p.x = lerp(p.x, p.tx, p.speed);
    p.y = lerp(p.y, p.ty, p.speed);
    if (dist(p.x, p.tx, p.y, p.ty) > 3) done = false;
    let c = hexToP5Color(p.col);
    drawingContext.save();
    drawingContext.shadowColor = p.col;
    drawingContext.shadowBlur  = isUtopia ? 10 : 5;
    fill(red(c), green(c), blue(c), p.life * 200); noStroke();
    ellipse(p.x, p.y, p.size, p.size);
    drawingContext.restore();
  }
  if (s4BuildProgress > 3.5 || done) { s4Phase = 'result'; s4ResultAlpha = 0; }
  textAlign(CENTER); textFont('Orbitron, monospace'); textSize(12);
  let pulse = sin(frameCount * 0.08) * 0.5 + 0.5;
  let buildCol = isUtopia ? COL.cyan : COL.red;
  drawingContext.save();
  drawingContext.shadowColor = buildCol;
  drawingContext.shadowBlur  = pulse * 20;
  fill(hexToP5Color(buildCol, 180 + pulse * 75)); noStroke();
  text(isUtopia ? 'CONSTRUCTING FUTURE...' : 'ANALYZING CONSEQUENCES...', width / 2, height / 2);
  drawingContext.restore();
  textAlign(LEFT);
}

function drawResult4() {
  if (s4ResultAlpha < 240) s4ResultAlpha = min(s4ResultAlpha + 2.5, 240);

  // ★ 結果頁完全顯示後，觸發「進入網站」按鈕
  if (s4ResultAlpha >= 200 && !s4EnterBtnShown) {
    s4EnterBtnShown = true;
    if (typeof window.showEnterSiteBtn === 'function') {
      window.showEnterSiteBtn();
    }
  }

  let isUtopia = s4Score >= 2, cx = width / 2;
  if (isUtopia) drawUtopiaBG4(); else drawRuinBG4();

  let mainTitle = isUtopia ? '🌟 2050：科技烏托邦教室' : '💔 2050：廢墟中的教室';
  let subTitle  = isUtopia
    ? '你的選擇讓世界走向光明！'
    : '每一個選擇都有後果，但改變永遠不嫌晚。';

  textAlign(CENTER, CENTER); textFont('Noto Sans TC');
  textSize(width < 600 ? 22 : 30);
  let titleCol = isUtopia ? COL.gold : '#ff6644';
  drawingContext.save();
  drawingContext.shadowColor = titleCol;
  drawingContext.shadowBlur  = 30;
  fill(hexToP5Color(titleCol, s4ResultAlpha)); noStroke();
  text(mainTitle, cx, height * 0.22);
  drawingContext.restore();
  textSize(15); fill(200, 220, 255, s4ResultAlpha * 0.85);
  text(subTitle, cx, height * 0.32);

  drawSDGList4(isUtopia);
  drawCallToAction4(isUtopia);

  // 操作提示（改為「進入網站」或「重玩」）
  textSize(10); textFont('Orbitron, monospace');
  fill(100, 120, 140, s4ResultAlpha * 0.5);
  text('CLICK TO RESTART  ·  OR ENTER SITE BELOW', cx, height * 0.95);
  textAlign(LEFT);
}

function drawUtopiaBG4() {
  for (let i = 0; i < 8; i++) {
    let x = (i + 0.5) * width / 8;
    let pulse = sin(frameCount * 0.03 + i * 0.8) * 0.5 + 0.5;
    let col = [COL.cyan, COL.purple, COL.gold, COL.green][i % 4];
    let c = hexToP5Color(col);
    drawingContext.save();
    drawingContext.shadowColor = col;
    drawingContext.shadowBlur  = 20;
    fill(red(c), green(c), blue(c), 8 + pulse * 15); noStroke();
    rect(x - 20, 0, 40, height);
    drawingContext.restore();
  }
  for (let i = 0; i < 30; i++) {
    let x = (sin(frameCount * 0.01 + i) * 0.4 + 0.5) * width;
    let y = (cos(frameCount * 0.008 + i * 1.3) * 0.3 + 0.5) * height;
    glowEllipse(x, y, 4, 4, [COL.cyan, COL.gold][i % 2], 10);
  }
}

function drawRuinBG4() {
  drawingContext.save();
  drawingContext.shadowColor = '#ff4444';
  drawingContext.shadowBlur  = 8;
  stroke(200, 50, 50, 30); strokeWeight(1);
  for (let i = 0; i < 20; i++) {
    let x1 = random(width), y1 = random(height);
    line(x1, y1, x1 + random(-80, 80), y1 + random(-80, 80));
  }
  drawingContext.restore();
  for (let i = 0; i < 20; i++) {
    let x = (sin(frameCount * 0.005 + i * 0.7) * 0.45 + 0.5) * width;
    let y = ((frameCount * 0.2 + i * 60) % height);
    noStroke(); fill(150, 100, 80, 40); ellipse(x, y, 2, 2);
  }
}

function drawSDGList4(isUtopia) {
  let cx = width / 2, sy = height * 0.52;
  textFont('Orbitron, monospace'); textSize(9);
  fill(hexToP5Color(COL.gold, s4ResultAlpha * 0.7)); noStroke();
  textAlign(CENTER);
  text('RELATED SUSTAINABLE DEVELOPMENT GOALS', cx, sy - 20);
  let cols = isUtopia
    ? [COL.cyan, COL.gold, COL.green, COL.purple]
    : ['#ff6644','#aa4422','#884422','#664422'];
  let bw = min(width * 0.17, 130), bh = 28, gap = 8;
  let perRow = floor(width * 0.72 / (bw + gap));
  let startX = cx - (perRow * (bw + gap) - gap) / 2;
  for (let i = 0; i < SDGS_ALL.length; i++) {
    let row = floor(i / perRow), col = i % perRow;
    let bx = startX + col * (bw + gap), by = sy + row * (bh + 8);
    let c = hexToP5Color(cols[i % cols.length]);
    drawingContext.save();
    drawingContext.shadowColor = cols[i % cols.length];
    drawingContext.shadowBlur  = 8;
    fill(red(c), green(c), blue(c), 20);
    stroke(red(c), green(c), blue(c), 100); strokeWeight(0.8);
    rect(bx, by, bw, bh, 4);
    textFont('Noto Sans TC'); textSize(9); noStroke();
    fill(red(c), green(c), blue(c), s4ResultAlpha * 0.85);
    textAlign(CENTER, CENTER);
    text(SDGS_ALL[i], bx + bw / 2, by + bh / 2);
    drawingContext.restore();
  }
  textAlign(LEFT);
}

function drawCallToAction4(isUtopia) {
  let cx = width / 2;
  let msg = isUtopia
    ? '你已踏出改變的第一步。\n繼續探索 SDGs 知識宇宙，看見更多可能。'
    : '現在行動，還不算晚。\n進入 SDGs 知識宇宙，找到你的行動起點。';
  textAlign(CENTER); textFont('Noto Sans TC'); textSize(13);
  let col = isUtopia ? COL.cyan : COL.gold;
  drawingContext.save();
  drawingContext.shadowColor = col;
  drawingContext.shadowBlur  = 15;
  fill(hexToP5Color(col, s4ResultAlpha * 0.9)); noStroke();
  text(msg, cx - (width * 0.6) / 2, height * 0.88, width * 0.6, 60);
  drawingContext.restore();
  textAlign(LEFT);
}

function drawSceneTitle4() {
  if (s4Phase === 'result') return;
  textAlign(LEFT); textFont('Orbitron, monospace'); textSize(10);
  drawingContext.save();
  drawingContext.shadowColor = COL.purple;
  drawingContext.shadowBlur  = 15;
  fill(191, 95, 255, 180); noStroke();
  text('SCENE 04  ·  2050 TIME MACHINE', 24, height * 0.12);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(width < 600 ? 18 : 24);
  drawingContext.save();
  drawingContext.shadowColor = COL.purple;
  drawingContext.shadowBlur  = 18;
  fill(230, 200, 255, 220); noStroke();
  text('2050 教室時光機', 24, height * 0.12 + 28);
  drawingContext.restore();
  textFont('Noto Sans TC'); textSize(12);
  fill(160, 140, 180, 160); noStroke();
  text('回答三個問題，看見你選擇的未來', 24, height * 0.12 + 52);
}