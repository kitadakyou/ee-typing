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
