// 画面上キーボードの描画と「次に打つキー」のハイライト。
import { KEY_ROWS } from './layout.js';

let keyEls = {}; // key文字 -> ボタン要素

// container にキーボードを描画する
export function renderKeyboard(container) {
  container.innerHTML = '';
  keyEls = {};
  for (const row of KEY_ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    for (const k of row) {
      const keyEl = document.createElement('div');
      keyEl.className = 'kb-key';
      keyEl.dataset.finger = k.finger;
      keyEl.dataset.key = k.key;
      if (k.home) keyEl.classList.add('is-home'); // F/J のホームポジション印
      keyEl.textContent = k.label;
      rowEl.appendChild(keyEl);
      keyEls[k.key] = keyEl;
    }
    container.appendChild(rowEl);
  }
}

// 指定キー群（配列または1文字）を次キーとして点灯。それ以外は消灯。
export function highlightKeys(keys) {
  const set = new Set(Array.isArray(keys) ? keys : [keys]);
  for (const [key, el] of Object.entries(keyEls)) {
    el.classList.toggle('is-next', set.has(key));
  }
}
