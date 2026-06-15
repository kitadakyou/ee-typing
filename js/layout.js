// キー配列と「キー→指」マッピング。
// keyboard.js（描画）・hands.js（指ハイライト）・stats.js（指別集計）で共有する。
//
// 指コード:
//   lp=左小指, lr=左薬指, lm=左中指, li=左人差し指,
//   ri=右人差し指, rm=右中指, rr=右薬指, rp=右小指, thumb=親指(スペース)

export const FINGER_NAMES = {
  lp: '左こ指', lr: '左くすり指', lm: '左なか指', li: '左ひとさし指',
  ri: '右ひとさし指', rm: '右なか指', rr: '右くすり指', rp: '右こ指',
  thumb: '親指',
};

// 各行: { label, finger, width? }。label はキーに表示する文字（大文字）。
// 実際の打鍵キー(小文字 a-z, 数字, 記号)との対応は key プロパティで持つ。
export const KEY_ROWS = [
  // 数字段
  [
    { key: '1', label: '1', finger: 'lp' },
    { key: '2', label: '2', finger: 'lr' },
    { key: '3', label: '3', finger: 'lm' },
    { key: '4', label: '4', finger: 'li' },
    { key: '5', label: '5', finger: 'li' },
    { key: '6', label: '6', finger: 'ri' },
    { key: '7', label: '7', finger: 'ri' },
    { key: '8', label: '8', finger: 'rm' },
    { key: '9', label: '9', finger: 'rr' },
    { key: '0', label: '0', finger: 'rp' },
    { key: '-', label: '-', finger: 'rp' },
    { key: '^', label: '^', finger: 'rp' },
    { key: '\\', label: '¥', finger: 'rp' },
  ],
  // 上段
  [
    { key: 'q', label: 'Q', finger: 'lp' },
    { key: 'w', label: 'W', finger: 'lr' },
    { key: 'e', label: 'E', finger: 'lm' },
    { key: 'r', label: 'R', finger: 'li' },
    { key: 't', label: 'T', finger: 'li' },
    { key: 'y', label: 'Y', finger: 'ri' },
    { key: 'u', label: 'U', finger: 'ri' },
    { key: 'i', label: 'I', finger: 'rm' },
    { key: 'o', label: 'O', finger: 'rr' },
    { key: 'p', label: 'P', finger: 'rp' },
    { key: '@', label: '@', finger: 'rp' },
    { key: '[', label: '[', finger: 'rp' },
  ],
  // ホーム段
  [
    { key: 'a', label: 'A', finger: 'lp' },
    { key: 's', label: 'S', finger: 'lr' },
    { key: 'd', label: 'D', finger: 'lm' },
    { key: 'f', label: 'F', finger: 'li', home: true },
    { key: 'g', label: 'G', finger: 'li' },
    { key: 'h', label: 'H', finger: 'ri' },
    { key: 'j', label: 'J', finger: 'ri', home: true },
    { key: 'k', label: 'K', finger: 'rm' },
    { key: 'l', label: 'L', finger: 'rr' },
    { key: ';', label: ';', finger: 'rp' },
    { key: ':', label: ':', finger: 'rp' },
    { key: ']', label: ']', finger: 'rp' },
  ],
  // 下段
  [
    { key: 'z', label: 'Z', finger: 'lp' },
    { key: 'x', label: 'X', finger: 'lr' },
    { key: 'c', label: 'C', finger: 'lm' },
    { key: 'v', label: 'V', finger: 'li' },
    { key: 'b', label: 'B', finger: 'li' },
    { key: 'n', label: 'N', finger: 'ri' },
    { key: 'm', label: 'M', finger: 'ri' },
    { key: ',', label: ',', finger: 'rm' },
    { key: '.', label: '.', finger: 'rr' },
    { key: '/', label: '/', finger: 'rp' },
  ],
];

// key 文字 -> 指コード の早見表
export const KEY_TO_FINGER = (() => {
  const map = {};
  for (const row of KEY_ROWS) {
    for (const k of row) map[k.key] = k.finger;
  }
  map[' '] = 'thumb';
  return map;
})();

// ===== US(ANSI) 配列。プログラミングコード入力モードで使う =====
// 各キー: { key, label, finger, shift?, shiftLabel?, home?, wide? }
//   key      … 非シフト時に入る文字（英字は小文字）。特殊キーは 'shiftL'/'shiftR'/'enter'/'space'。
//   shift    … Shift 併用時に入る文字（シフト記号）。
//   wide     … 横幅の広い特殊キー（Shift/Enter/Space）。
export const US_KEY_ROWS = [
  // 数字段
  [
    { key: '`', label: '`', shift: '~', shiftLabel: '~', finger: 'lp' },
    { key: '1', label: '1', shift: '!', shiftLabel: '!', finger: 'lp' },
    { key: '2', label: '2', shift: '@', shiftLabel: '@', finger: 'lr' },
    { key: '3', label: '3', shift: '#', shiftLabel: '#', finger: 'lm' },
    { key: '4', label: '4', shift: '$', shiftLabel: '$', finger: 'li' },
    { key: '5', label: '5', shift: '%', shiftLabel: '%', finger: 'li' },
    { key: '6', label: '6', shift: '^', shiftLabel: '^', finger: 'ri' },
    { key: '7', label: '7', shift: '&', shiftLabel: '&', finger: 'ri' },
    { key: '8', label: '8', shift: '*', shiftLabel: '*', finger: 'rm' },
    { key: '9', label: '9', shift: '(', shiftLabel: '(', finger: 'rr' },
    { key: '0', label: '0', shift: ')', shiftLabel: ')', finger: 'rp' },
    { key: '-', label: '-', shift: '_', shiftLabel: '_', finger: 'rp' },
    { key: '=', label: '=', shift: '+', shiftLabel: '+', finger: 'rp' },
  ],
  // 上段
  [
    { key: 'q', label: 'Q', finger: 'lp' },
    { key: 'w', label: 'W', finger: 'lr' },
    { key: 'e', label: 'E', finger: 'lm' },
    { key: 'r', label: 'R', finger: 'li' },
    { key: 't', label: 'T', finger: 'li' },
    { key: 'y', label: 'Y', finger: 'ri' },
    { key: 'u', label: 'U', finger: 'ri' },
    { key: 'i', label: 'I', finger: 'rm' },
    { key: 'o', label: 'O', finger: 'rr' },
    { key: 'p', label: 'P', finger: 'rp' },
    { key: '[', label: '[', shift: '{', shiftLabel: '{', finger: 'rp' },
    { key: ']', label: ']', shift: '}', shiftLabel: '}', finger: 'rp' },
    { key: '\\', label: '\\', shift: '|', shiftLabel: '|', finger: 'rp' },
  ],
  // ホーム段
  [
    { key: 'a', label: 'A', finger: 'lp' },
    { key: 's', label: 'S', finger: 'lr' },
    { key: 'd', label: 'D', finger: 'lm' },
    { key: 'f', label: 'F', finger: 'li', home: true },
    { key: 'g', label: 'G', finger: 'li' },
    { key: 'h', label: 'H', finger: 'ri' },
    { key: 'j', label: 'J', finger: 'ri', home: true },
    { key: 'k', label: 'K', finger: 'rm' },
    { key: 'l', label: 'L', finger: 'rr' },
    { key: ';', label: ';', shift: ':', shiftLabel: ':', finger: 'rp' },
    { key: "'", label: "'", shift: '"', shiftLabel: '"', finger: 'rp' },
    { key: 'enter', label: 'Enter', finger: 'rp', wide: true },
  ],
  // 下段
  [
    { key: 'shiftL', label: 'Shift', finger: 'lp', wide: true },
    { key: 'z', label: 'Z', finger: 'lp' },
    { key: 'x', label: 'X', finger: 'lr' },
    { key: 'c', label: 'C', finger: 'lm' },
    { key: 'v', label: 'V', finger: 'li' },
    { key: 'b', label: 'B', finger: 'li' },
    { key: 'n', label: 'N', finger: 'ri' },
    { key: 'm', label: 'M', finger: 'ri' },
    { key: ',', label: ',', shift: '<', shiftLabel: '<', finger: 'rm' },
    { key: '.', label: '.', shift: '>', shiftLabel: '>', finger: 'rr' },
    { key: '/', label: '/', shift: '?', shiftLabel: '?', finger: 'rp' },
    { key: 'shiftR', label: 'Shift', finger: 'rp', wide: true },
  ],
  // スペース段
  [
    { key: 'space', label: 'Space', finger: 'thumb', wide: true },
  ],
];

// 入力文字 -> { keyId, finger, shift } の早見表（base と shift 記号の両方を登録）。
// keyId は物理キー識別子（base 文字／特殊キー名）。改行・スペースも含む。
export const US_CHAR_TO_KEY = (() => {
  const map = {};
  for (const row of US_KEY_ROWS) {
    for (const k of row) {
      if (k.key === 'shiftL' || k.key === 'shiftR') continue;
      if (k.key === 'enter') {
        map['\n'] = { keyId: 'enter', finger: k.finger, shift: false };
        continue;
      }
      if (k.key === 'space') {
        map[' '] = { keyId: 'space', finger: k.finger, shift: false };
        continue;
      }
      map[k.key] = { keyId: k.key, finger: k.finger, shift: false };
      if (k.shift) map[k.shift] = { keyId: k.key, finger: k.finger, shift: true };
      // 英字キーは大文字（Shift 併用）も登録する
      if (/^[a-z]$/.test(k.key)) {
        map[k.key.toUpperCase()] = { keyId: k.key, finger: k.finger, shift: true };
      }
    }
  }
  return map;
})();

// シフトを押す側の Shift キー（ベースと逆の手の小指）。
export function shiftKeyFor(finger) {
  return finger && finger[0] === 'l' ? 'shiftR' : 'shiftL';
}
// シフトを押す側の小指コード（逆手）。
export function shiftFingerFor(finger) {
  return finger && finger[0] === 'l' ? 'rp' : 'lp';
}
