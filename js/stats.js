// 集計・スコア・苦手キー/指。
import { KEY_TO_FINGER, FINGER_NAMES } from './layout.js';

export function createStats(meta = {}) {
  let correct = 0;
  let miss = 0;
  let startTime = null;
  let endTime = null;
  const keyMiss = {}; // key文字 -> ミス回数
  const fingerMiss = {}; // 指コード -> ミス回数

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
      if (fg) fingerMiss[fg] = (fingerMiss[fg] || 0) + 1;
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
      weakKeys: topEntries(keyMiss, 5),
      weakFingers: topFingers(fingerMiss, 3),
    };
  }

  return { addCorrect, addMiss, finish, summary };
}

function rankOf(score) {
  if (score >= 350) return 'S';
  if (score >= 280) return 'A';
  if (score >= 200) return 'B';
  if (score >= 140) return 'C';
  if (score >= 80) return 'D';
  return 'E';
}

// {key:count} を多い順 top 件 [{label, count}] に。
function topEntries(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ label: keyLabel(key), count }));
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
