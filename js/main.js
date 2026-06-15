// ゲーム制御（スタート / プレイ / 結果 の3画面）。
import { renderKeyboard, highlightKeys } from './keyboard.js';
import { renderHands, highlightFinger } from './hands.js';
import { createEngine } from './romaji.js';
import { WORDS, shuffled } from './words.js';
import { createStats } from './stats.js';
import { KEY_TO_FINGER } from './layout.js';

const SET_SIZE = 5; // 1セットの問題数

// ---- DOM 参照 ----
const screens = {
  start: document.getElementById('screen-start'),
  play: document.getElementById('screen-play'),
  result: document.getElementById('screen-result'),
};
const el = {
  flash: document.getElementById('flash'),
  display: document.getElementById('display'),
  reading: document.getElementById('reading'),
  romajiTyped: document.getElementById('romaji-typed'),
  romajiRest: document.getElementById('romaji-rest'),
  progress: document.getElementById('progress'),
  liveAcc: document.getElementById('live-acc'),
  startCount: document.getElementById('start-count'),
  btnStart: document.getElementById('btn-start'),
  btnRetry: document.getElementById('btn-retry'),
};

// ---- 初期描画 ----
renderKeyboard(document.getElementById('keyboard'));
renderHands(document.getElementById('hands'));
el.startCount.textContent = SET_SIZE;

// ---- ゲーム状態 ----
const engine = createEngine();
let stats = null;
let queue = []; // 今セットのお題（{display, reading}）
let index = 0; // 何問目か（0始まり）
let phase = 'start'; // 'start' | 'play' | 'result'

function showScreen(name) {
  phase = name;
  for (const [key, node] of Object.entries(screens)) {
    node.classList.toggle('is-active', key === name);
  }
}

function startSet() {
  queue = shuffled(WORDS).slice(0, SET_SIZE);
  index = 0;
  stats = createStats();
  showScreen('play');
  loadWord();
}

function loadWord() {
  const w = queue[index];
  engine.setText(w.reading);
  el.display.textContent = w.display;
  el.reading.textContent = w.reading;
  el.progress.textContent = `${index + 1} / ${SET_SIZE}`;
  updateRomaji();
  updateGuide();
  updateLiveAcc();
}

// ローマ字の打鍵済み/残りを色分け表示
function updateRomaji() {
  el.romajiTyped.textContent = engine.typedRomaji();
  el.romajiRest.textContent = engine.remainingRomaji();
}

// 次キー・次指のハイライト
function updateGuide() {
  highlightKeys(engine.nextChars());
  const key = engine.expectedKey();
  highlightFinger(key ? KEY_TO_FINGER[key] : null);
}

function updateLiveAcc() {
  const s = stats.summary();
  el.liveAcc.textContent = `正確率 ${Math.round(s.accuracy * 100)}%`;
}

function doFlash() {
  el.flash.classList.remove('flash');
  void el.flash.offsetWidth; // リフローでアニメ再始動
  el.flash.classList.add('flash');
}

function nextWord() {
  index++;
  if (index >= SET_SIZE) {
    finishSet();
  } else {
    loadWord();
  }
}

function finishSet() {
  stats.finish();
  highlightKeys([]);
  highlightFinger(null);
  showResult(stats.summary());
}

function showResult(s) {
  document.getElementById('result-rank').textContent = s.rank;
  document.getElementById('result-score').textContent = s.score;
  document.getElementById('result-wpm').textContent = s.wpm;
  document.getElementById('result-kpm').textContent = s.kpm;
  document.getElementById('result-acc').textContent = `${Math.round(s.accuracy * 100)}%`;
  document.getElementById('result-correct').textContent = s.correct;
  document.getElementById('result-miss').textContent = s.miss;
  renderWeakList(document.getElementById('weak-keys'), s.weakKeys, '回');
  renderWeakList(document.getElementById('weak-fingers'), s.weakFingers, '回');
  showScreen('result');
}

function renderWeakList(ul, items, unit) {
  ul.innerHTML = '';
  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'weak-none';
    li.textContent = 'なし（ミスなし）';
    ul.appendChild(li);
    return;
  }
  for (const it of items) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="weak-name">${it.label}</span><span class="weak-count">${it.count}${unit}</span>`;
    ul.appendChild(li);
  }
}

// ---- 入力処理 ----
document.addEventListener('keydown', (e) => {
  // スタート/結果画面: Space または Enter で開始
  if (phase !== 'play') {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      startSet();
    }
    return;
  }

  // プレイ中
  if (e.isComposing || e.key === 'Process') return; // IME 合成中は無視
  if (e.ctrlKey || e.metaKey || e.altKey) return; // ショートカットは無視
  if (e.key.length !== 1) return; // 印字されない特殊キーは無視

  const ch = e.key.toLowerCase(); // Shift/CapsLock で誤ミス計上しない
  e.preventDefault();

  const res = engine.input(ch);
  if (res.ok) {
    stats.addCorrect();
    updateRomaji();
    updateLiveAcc();
    if (res.finished) {
      nextWord();
    } else {
      updateGuide();
    }
  } else {
    stats.addMiss(engine.expectedKey());
    updateLiveAcc();
    doFlash();
  }
});

// ボタンでも開始できるように
el.btnStart.addEventListener('click', startSet);
el.btnRetry.addEventListener('click', startSet);
