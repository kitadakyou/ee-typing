// ゲーム制御（スタート / プレイ / 結果 の3画面）。
// 日本語ローマ字モードと、プログラミングコード直打ちモード（C# / TypeScript）を切り替える。
import { renderKeyboard, highlightKeys } from './keyboard.js';
import { renderHands, highlightFinger } from './hands.js';
import { createEngine } from './romaji.js';
import { createCodeEngine } from './code-engine.js';
import { WORDS, shuffled } from './words.js';
import { CODE_POOLS, LANG_LABELS, packFunctions } from './code-words.js';
import { createStats } from './stats.js';
import {
  KEY_ROWS,
  KEY_TO_FINGER,
  US_KEY_ROWS,
  US_CHAR_TO_KEY,
  shiftKeyFor,
  shiftFingerFor,
} from './layout.js';

const SET_SIZE = 5; // 日本語モードの1セット問題数

// ---- DOM 参照 ----
const screens = {
  start: document.getElementById('screen-start'),
  play: document.getElementById('screen-play'),
  result: document.getElementById('screen-result'),
};
const kbEl = document.getElementById('keyboard');
const boardEl = document.getElementById('board');
const codeSectionEl = document.getElementById('code-section');
const el = {
  flash: document.getElementById('flash'),
  display: document.getElementById('display'),
  reading: document.getElementById('reading'),
  romajiTyped: document.getElementById('romaji-typed'),
  romajiRest: document.getElementById('romaji-rest'),
  codeTitle: document.getElementById('code-title'),
  codeTyped: document.getElementById('code-typed'),
  codeCursor: document.getElementById('code-cursor'),
  codeRest: document.getElementById('code-rest'),
  progress: document.getElementById('progress'),
  liveAcc: document.getElementById('live-acc'),
  resultLang: document.getElementById('result-lang'),
  btnRetry: document.getElementById('btn-retry'),
};

// ---- 初期描画 ----
renderKeyboard(kbEl);
renderHands(document.getElementById('hands'));

// ---- ゲーム状態 ----
const romajiEngine = createEngine();
const codeEngine = createCodeEngine();
let engine = romajiEngine;
let stats = null;
let queue = []; // 今セットのお題（romaji:{display,reading} / code:{title,code}）
let index = 0; // 何問目か（0始まり）
let phase = 'start'; // 'start' | 'play' | 'result'
let mode = 'romaji'; // 'romaji' | 'code'
let lang = null; // 'csharp' | 'typescript'（code 時）
let lastMode = 'romaji'; // リトライ用
let lastLang = null;

function showScreen(name) {
  phase = name;
  for (const [key, node] of Object.entries(screens)) {
    node.classList.toggle('is-active', key === name);
  }
}

function startSet(m, l) {
  mode = m;
  lang = l || null;
  lastMode = m;
  lastLang = lang;

  if (mode === 'code') {
    engine = codeEngine;
    queue = packFunctions(CODE_POOLS[lang]);
    renderKeyboard(kbEl, US_KEY_ROWS);
    kbEl.classList.add('is-us');
    boardEl.hidden = true;
    codeSectionEl.hidden = false;
  } else {
    engine = romajiEngine;
    queue = shuffled(WORDS).slice(0, SET_SIZE);
    renderKeyboard(kbEl, KEY_ROWS);
    kbEl.classList.remove('is-us');
    boardEl.hidden = false;
    codeSectionEl.hidden = true;
  }

  index = 0;
  stats = createStats({ mode, lang });
  showScreen('play');
  loadWord();
}

function loadWord() {
  const w = queue[index];
  if (mode === 'code') {
    engine.setText(w.code);
    el.codeTitle.textContent = `${LANG_LABELS[lang]} — ${w.title}`;
  } else {
    engine.setText(w.reading);
    el.display.textContent = w.display;
    el.reading.textContent = w.reading;
  }
  el.progress.textContent = `${index + 1} / ${queue.length}`;
  updateView();
  updateGuide();
  updateLiveAcc();
}

// 打鍵済み/残りの色分け表示（モードで出力先を切り替え）
function updateView() {
  if (mode === 'code') {
    const rest = engine.remainingRomaji();
    const cur = rest.length ? rest[0] : '';
    el.codeTyped.textContent = engine.typedRomaji();
    el.codeCursor.textContent = cur === '\n' ? '↵\n' : cur; // 改行は ↵ で見せる
    el.codeRest.textContent = rest.slice(1);
  } else {
    el.romajiTyped.textContent = engine.typedRomaji();
    el.romajiRest.textContent = engine.remainingRomaji();
  }
}

// 次キー・次指のハイライト
function updateGuide() {
  if (mode === 'code') {
    const ch = engine.expectedKey();
    const info = ch != null ? US_CHAR_TO_KEY[ch] : null;
    if (!info) {
      highlightKeys([]);
      highlightFinger(null);
      return;
    }
    if (info.shift) {
      // 記号: ベースキー＋逆手の Shift、指もベース＋逆手小指の2本
      highlightKeys([info.keyId, shiftKeyFor(info.finger)]);
      highlightFinger([info.finger, shiftFingerFor(info.finger)]);
    } else {
      highlightKeys([info.keyId]);
      highlightFinger(info.finger);
    }
  } else {
    highlightKeys(engine.nextChars());
    const key = engine.expectedKey();
    highlightFinger(key ? KEY_TO_FINGER[key] : null);
  }
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
  if (index >= queue.length) {
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
  const langText = s.mode === 'code' ? LANG_LABELS[s.lang] : '日本語ローマ字';
  el.resultLang.textContent = `モード: ${langText}`;
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
  // 結果画面: Space または Enter で同じモードをもう一度
  if (phase !== 'play') {
    if (phase === 'result' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      startSet(lastMode, lastLang);
    }
    return;
  }

  // プレイ中
  if (e.isComposing || e.key === 'Process') return; // IME 合成中は無視
  if (e.ctrlKey || e.metaKey || e.altKey) return; // ショートカットは無視

  let ch;
  if (mode === 'code' && e.key === 'Enter') {
    ch = '\n'; // コードモードは Enter で改行を打つ
  } else if (e.key.length !== 1) {
    return; // 印字されない特殊キーは無視
  } else {
    ch = mode === 'code' ? e.key : e.key.toLowerCase(); // code は大小・記号をそのまま
  }
  e.preventDefault();

  const res = engine.input(ch);
  if (res.ok) {
    stats.addCorrect();
    updateView();
    updateLiveAcc();
    if (res.finished) {
      nextWord();
    } else {
      updateGuide();
    }
  } else {
    const exp = engine.expectedKey();
    if (mode === 'code') {
      const info = exp != null ? US_CHAR_TO_KEY[exp] : null;
      stats.addMiss(exp, info ? info.finger : undefined);
    } else {
      stats.addMiss(exp);
    }
    updateLiveAcc();
    doFlash();
  }
});

// スタート画面のモードボタン
document.querySelectorAll('.btn-mode').forEach((btn) => {
  btn.addEventListener('click', () => startSet(btn.dataset.mode, btn.dataset.lang));
});
// 結果画面のもう一度ボタン
el.btnRetry.addEventListener('click', () => startSet(lastMode, lastLang));
