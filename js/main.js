// ゲーム制御（スタート / プレイ / 結果 の3画面）。
// 日本語ローマ字モードと、プログラミングコード直打ちモード（C# / TypeScript）を切り替える。
import { renderKeyboard, highlightKeys } from './keyboard.js';
import { renderHands, highlightFinger } from './hands.js';
import { createEngine } from './romaji.js';
import { createCodeEngine } from './code-engine.js';
import { PASSAGES, packPassages } from './words.js';
import { CODE_POOLS, LANG_LABELS, packFunctions } from './code-words.js';
import { createStats } from './stats.js';
import {
  US_KEY_ROWS,
  US_CHAR_TO_KEY,
  shiftKeyFor,
  shiftFingerFor,
} from './layout.js';

// ---- DOM 参照 ----
const screens = {
  start: document.getElementById('screen-start'),
  play: document.getElementById('screen-play'),
  result: document.getElementById('screen-result'),
};
const kbEl = document.getElementById('keyboard');
const jpSectionEl = document.getElementById('jp-section');
const boardEl = document.getElementById('board');
const codeSectionEl = document.getElementById('code-section');
const el = {
  flash: document.getElementById('flash'),
  source: document.getElementById('source'),
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
let queue = []; // 今セットのお題（romaji:{source,sentences[]} / code:{title,code}）
let index = 0; // 何問目か＝何作品目か（0始まり）
let sentenceIndex = 0; // 日本語モード: 作品内で何文目か（0始まり）
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
    jpSectionEl.hidden = true;
    codeSectionEl.hidden = false;
  } else {
    engine = romajiEngine;
    queue = packPassages(PASSAGES);
    renderKeyboard(kbEl, US_KEY_ROWS, { singleLabel: true }); // US 配列・1段ラベル
    kbEl.classList.add('is-us');
    jpSectionEl.hidden = false;
    codeSectionEl.hidden = true;
  }

  index = 0;
  stats = createStats({ mode, lang });
  showScreen('play');
  loadWord();
}

function loadWord() {
  el.progress.textContent = `${index + 1} / ${queue.length}`;
  if (mode === 'code') {
    const w = queue[index];
    engine.setText(w.code);
    el.codeTitle.textContent = `${LANG_LABELS[lang]} — ${w.title}`;
    updateView();
    updateGuide();
    updateLiveAcc();
    return;
  }
  // 日本語: 作品をロードして文単位で進行する
  el.source.textContent = queue[index].source;
  sentenceIndex = 0;
  loadSentence();
  boardEl.scrollTop = 0; // 作品先頭（冒頭の文）から表示
}

// 本文全文を文ごとの span で描画。現在文だけ黒（.s-cur）、他は淡色（.s-dim）。
function renderDisplay() {
  const ss = queue[index].sentences;
  el.display.innerHTML = ss
    .map((s, i) => {
      const cls = i === sentenceIndex ? 's-cur' : 's-dim';
      const id = i === sentenceIndex ? ' id="s-cur"' : '';
      return `<span class="${cls}"${id}>${escapeHtml(s.display)}</span>`;
    })
    .join('');
}

// 現在文をエンジンにセットし、本文ハイライト・読み・ローマ字・ガイドを更新する。
function loadSentence() {
  const s = queue[index].sentences[sentenceIndex];
  engine.setText(s.reading);
  el.reading.textContent = s.reading;
  renderDisplay();
  updateView();
  updateGuide();
  updateLiveAcc();
  const cur = document.getElementById('s-cur');
  if (cur) cur.scrollIntoView({ block: 'nearest' }); // 現在文を本文枠内に表示
}

function escapeHtml(str) {
  return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
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
    // 長文時、打鍵位置（未打ローマ字の先頭）がパネル内に見えるよう追従
    el.romajiRest.scrollIntoView({ block: 'nearest' });
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
    // 日本語も US 配列で点灯。
    const key = engine.expectedKey();
    const info = key != null ? US_CHAR_TO_KEY[key] : null;
    if (info && info.shift) {
      // Shift 記号（！？（）など）: ベースキー＋逆手 Shift、指もベース＋逆手小指の2本
      highlightKeys([info.keyId, shiftKeyFor(info.finger)]);
      highlightFinger([info.finger, shiftFingerFor(info.finger)]);
    } else {
      // 非 Shift（かな・「」、。/）: 複数仮説のキーをまとめて点灯
      const keyIds = engine.nextChars().map((c) => (US_CHAR_TO_KEY[c] ? US_CHAR_TO_KEY[c].keyId : c));
      highlightKeys(keyIds);
      highlightFinger(info ? info.finger : null);
    }
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

// 日本語: 作品内の次の文へ。最後の文を終えたら次の作品へ。
function nextSentence() {
  sentenceIndex++;
  if (sentenceIndex >= queue[index].sentences.length) {
    nextWord();
  } else {
    loadSentence();
  }
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
  const langText = s.mode === 'code' ? LANG_LABELS[s.lang] : '日本語（長文）';
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
      if (mode === 'code') nextWord();
      else nextSentence();
    } else {
      updateGuide();
    }
  } else {
    const exp = engine.expectedKey();
    const info = exp != null ? US_CHAR_TO_KEY[exp] : null;
    stats.addMiss(exp, info ? info.finger : undefined);
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
