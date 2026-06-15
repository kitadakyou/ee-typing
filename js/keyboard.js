// 画面上キーボードの描画と「次に打つキー」のハイライト。
import { KEY_ROWS } from './layout.js';

let keyEls = {}; // key文字 -> ボタン要素

// container にキーボードを描画する。rows を渡せば別レイアウト（US 配列など）も描ける。
// singleLabel=true のときは shift 記号の2段ラベルを描かず、素のキー（k.label）だけ表示する
// （日本語ローマ字モード用。Shift を使わないので上段記号ラベルは不要）。
export function renderKeyboard(container, rows = KEY_ROWS, { singleLabel = false } = {}) {
  container.innerHTML = '';
  keyEls = {};
  for (const row of rows) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    for (const k of row) {
      const keyEl = document.createElement('div');
      keyEl.className = 'kb-key';
      keyEl.dataset.finger = k.finger;
      keyEl.dataset.key = k.key;
      if (k.home) keyEl.classList.add('is-home'); // F/J のホームポジション印
      if (k.wide) keyEl.classList.add('is-wide'); // Shift / Enter / Space
      if (k.shift && !singleLabel) {
        // 2段ラベル（上=シフト記号、下=非シフト文字）
        keyEl.classList.add('has-shift');
        const sh = document.createElement('span');
        sh.className = 'kb-shift';
        sh.textContent = k.shiftLabel;
        const base = document.createElement('span');
        base.className = 'kb-base';
        base.textContent = k.label;
        keyEl.append(sh, base);
      } else {
        keyEl.textContent = k.label;
      }
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
