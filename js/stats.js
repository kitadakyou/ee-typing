// 集計・スコア・苦手キー/指。
import { KEY_TO_FINGER, FINGER_NAMES } from './layout.js';

export function createStats(meta = {}) {
  let correct = 0;
  let miss = 0;
  let startTime = null;
  let endTime = null;
  const keyMiss = {}; // key文字 -> ミス回数
  const fingerMiss = {}; // 指コード -> ミス回数
  const keyFinger = {}; // key文字 -> 指コード

  // 最初の打鍵で計測開始
  function ensureStarted() {
    if (startTime === null) startTime = performance.now();
  }

  function addCorrect() {
    ensureStarted();
    correct++;
  }

  // 誤打。expectedKey = engine.expectedKey()（canonical な期待キー1つ）。
  // finger を渡せばそれを使い、無ければ KEY_TO_FINGER から引く（コードモードの記号用）。
  function addMiss(expectedKey, finger) {
    ensureStarted();
    miss++;
    if (expectedKey) {
      keyMiss[expectedKey] = (keyMiss[expectedKey] || 0) + 1;
      const fg = finger || KEY_TO_FINGER[expectedKey];
      if (fg) {
        fingerMiss[fg] = (fingerMiss[fg] || 0) + 1;
        keyFinger[expectedKey] = fg;
      }
    }
  }

  function finish() {
    endTime = performance.now();
  }

  // 集計結果を算出して返す。
  function summary() {
    const elapsedMs = (endTime ?? performance.now()) - (startTime ?? performance.now());
    const minutes = Math.max(elapsedMs / 60000, 1 / 60000); // 0除算回避
    const total = correct + miss;
    const accuracy = total > 0 ? correct / total : 0;
    const kpm = correct / minutes; // 1分あたり正打鍵
    const wpm = correct / 5 / minutes; // 標準的な単語換算
    const score = Math.round(kpm * Math.pow(accuracy, 3));
    const rank = rankOf(score);

    return {
      correct,
      miss,
      seconds: elapsedMs / 1000,
      accuracy,
      kpm: Math.round(kpm),
      wpm: Math.round(wpm),
      score,
      rank,
      mode: meta.mode || 'romaji',
      lang: meta.lang || null,
      weakKeys: topEntries(keyMiss, 5).map((e) => ({
        ...e,
        finger: keyFinger[e.key] ? FINGER_NAMES[keyFinger[e.key]] : null,
      })),
      weakFingers: topFingers(fingerMiss, 3),
    };
  }

  return { addCorrect, addMiss, finish, summary };
}

// 高い順。最後の E は下限なし。
const RANKS = [
  { rank: 'S', min: 350 },
  { rank: 'A', min: 280 },
  { rank: 'B', min: 200 },
  { rank: 'C', min: 140 },
  { rank: 'D', min: 80 },
  { rank: 'E', min: 0 },
];

function rankOf(score) {
  return RANKS.find((r) => score >= r.min).rank;
}

// 結果画面に出す、ランクの理由（計算式と、ミスと速さのどちらが足を引っ張ったか）。
export function rankReason(s) {
  const factor = Math.pow(s.accuracy, 3);
  const perSec = Math.floor(s.kpm / 6) / 10; // 1 秒あたりの打数（小数 1 桁）
  const formula = `速さ 1 秒に ${perSec.toFixed(1)} 打（KPM ${s.kpm}）× 正確率 ${Math.round(s.accuracy * 100)}% の 3 乗（×${factor.toFixed(2)}）→ スコア ${s.score}`;
  const loss = s.kpm - s.score;
  const perfectRank = rankOf(s.kpm);

  if (s.rank === 'S') {
    return [formula, `最高ランクです。ミスによる減点は ${loss} 点でした。`];
  }
  if (perfectRank !== s.rank) {
    return [formula, `ミスで ${loss} 点下がっています。正確率 100% なら ${s.kpm} 点で ${perfectRank} でした。`];
  }
  const next = RANKS[RANKS.findIndex((r) => r.rank === s.rank) - 1];
  const needPerSec = Math.ceil(next.min / factor / 6) / 10;
  return [
    formula,
    `ミスによる減点は ${loss} 点で、ランクは変わっていません。${next.rank}（${next.min} 点）に上がるには、この正確率のままなら 1 秒にあと ${(needPerSec - perSec).toFixed(1)} 打（1 秒に ${needPerSec.toFixed(1)} 打）必要です。`,
  ];
}

// {key:count} を多い順 top 件 [{label, count}] に。
function topEntries(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, label: keyLabel(key), count }));
}

// 表示用のキーラベル（空白・改行は読めるように）。
function keyLabel(key) {
  if (key === ' ') return 'Space';
  if (key === '\n') return 'Enter';
  return key.length === 1 ? key.toUpperCase() : key;
}

function topFingers(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([finger, count]) => ({ label: FINGER_NAMES[finger] || finger, count }));
}
