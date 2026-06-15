// 両手を SVG で描画し、次に使う指をハイライトする。
// 外部画像は使わず、指は角丸の縦バー、手のひらは角丸長方形で表現する。

// 指の定義: code, x位置, 高さ, 角度(親指のみ)
const LEFT = [
  { code: 'lp', x: 44, h: 58 },
  { code: 'lr', x: 80, h: 80 },
  { code: 'lm', x: 116, h: 92 },
  { code: 'li', x: 152, h: 76 },
];
const LEFT_THUMB = { code: 'thumb-l', x: 188, h: 50, rot: 38 };

const RIGHT = [
  { code: 'ri', x: 332, h: 76 },
  { code: 'rm', x: 368, h: 92 },
  { code: 'rr', x: 404, h: 80 },
  { code: 'rp', x: 440, h: 58 },
];
const RIGHT_THUMB = { code: 'thumb-r', x: 296, h: 50, rot: -38 };

const FW = 26;        // 指の幅
const BASE = 132;     // 指の付け根のy（手のひらに刺さる）

function fingerRect(f) {
  const top = BASE - f.h;
  return `<rect class="finger" data-finger="${f.code}" x="${f.x}" y="${top}" width="${FW}" height="${f.h + 30}" rx="${FW / 2}" />`;
}

function thumbRect(t, pivotX) {
  const top = BASE - t.h;
  // 付け根(下端中央)を軸に回転させて親指らしく内側へ倒す
  const cx = t.x + FW / 2;
  const cy = BASE;
  return `<rect class="finger" data-finger="${t.code}" x="${t.x}" y="${top}" width="${FW}" height="${t.h + 24}" rx="${FW / 2}" transform="rotate(${t.rot} ${cx} ${cy})" />`;
}

export function renderHands(container) {
  const leftFingers = LEFT.map(fingerRect).join('');
  const rightFingers = RIGHT.map(fingerRect).join('');
  const thumbs = thumbRect(LEFT_THUMB) + thumbRect(RIGHT_THUMB);

  container.innerHTML = `
  <svg class="hands-svg" viewBox="0 0 500 210" role="img" aria-label="両手">
    <!-- 手のひら -->
    <rect class="palm" x="36"  y="120" width="158" height="70" rx="26" />
    <rect class="palm" x="306" y="120" width="158" height="70" rx="26" />
    <!-- 指 -->
    ${thumbs}
    ${leftFingers}
    ${rightFingers}
  </svg>`;
}

// 指コードを受け取り該当の指を点灯。null で全消灯。
export function highlightFinger(finger) {
  const svg = document.querySelector('.hands-svg');
  if (!svg) return;
  // 'thumb' が来たら左右両方の親指を点灯
  const targets = finger === 'thumb' ? ['thumb-l', 'thumb-r'] : [finger];
  svg.querySelectorAll('.finger').forEach((el) => {
    el.classList.toggle('is-active', targets.includes(el.dataset.finger));
  });
}
