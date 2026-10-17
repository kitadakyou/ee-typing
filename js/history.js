// 結果の履歴（localStorage）と、キーごとのミス率の比較。
// スコアやランクは保存せず、正打数・ミス数・秒数から毎回計算する（基準を変えても過去と比べられるように）。
import { measure, keyLabel, fingerNameOf } from './stats.js';

const STORAGE_KEY = 'ee-typing:history:v1';
const MIN_STROKES = 20; // ミス率を出すのに要る打鍵数
const RECENT_RUNS = 5; // 「直近」とみなす回数

// 記録の単位。日本語は 'romaji'、コードは言語ごと（速さの水準が違うので混ぜない）。
export function groupOf(s) {
  return s.mode === 'code' ? s.lang : s.mode;
}

function loadAll() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(all) ? all : [];
  } catch {
    return [];
  }
}

// 今回の結果を保存し、同じ単位の履歴（古い順、最後が今回）を返す。
// 保存できなくても、今回分を含めた履歴は返す。
export function saveRun(s) {
  const run = {
    at: Date.now(),
    group: groupOf(s),
    correct: s.correct,
    miss: s.miss,
    seconds: s.seconds,
    keys: s.keys,
  };
  const all = loadAll();
  all.push(run);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // 容量超過やブラウザの設定で保存できないときは、今回の表示だけ行う
  }
  return all.filter((r) => r.group === run.group).map(withScores);
}

function withScores(r) {
  const { kpm, score } = measure(r.correct, r.miss, r.seconds);
  return { ...r, kpm, score };
}

// 複数回分のキー集計を足し合わせる。{ key: [打鍵数, ミス数] }
function sumKeys(runs) {
  const sum = {};
  for (const r of runs) {
    for (const [k, [n, m]] of Object.entries(r.keys || {})) {
      const t = sum[k] || (sum[k] = [0, 0]);
      t[0] += n;
      t[1] += m;
    }
  }
  return sum;
}

const rateOf = ([n, m]) => m / n;

// ミス率の高い順。打鍵数が足りないキーとミス 0 のキーは除く。
function rankByRate(sum) {
  return Object.entries(sum)
    .filter(([, t]) => t[0] >= MIN_STROKES && t[1] > 0)
    .sort((a, b) => rateOf(b[1]) - rateOf(a[1]));
}

function keyInfo(k) {
  return { key: k, label: keyLabel(k), finger: fingerNameOf(k) };
}

// 結果画面の苦手なキーの材料。runs は saveRun の戻り値（最後が今回）。
export function keyInsights(runs) {
  const current = runs[runs.length - 1];

  // 累計の苦手なキーと、今回のミス率
  const cumulative = rankByRate(sumKeys(runs))
    .slice(0, 5)
    .map(([k, t]) => {
      const now = current.keys?.[k];
      const nowRate = now ? rateOf(now) : null;
      let trend = null;
      if (nowRate !== null) {
        const diff = nowRate - rateOf(t);
        trend = Math.abs(diff) < 0.01 ? 'flat' : diff < 0 ? 'down' : 'up';
      }
      return { ...keyInfo(k), rate: rateOf(t), now: now ? { n: now[0], m: now[1], rate: nowRate } : null, trend };
    });

  // 上達・悪化は「直近 5 回」と「それより前」を比べる
  const better = [];
  const worse = [];
  if (runs.length > RECENT_RUNS) {
    const before = sumKeys(runs.slice(0, -RECENT_RUNS));
    const recent = sumKeys(runs.slice(-RECENT_RUNS));
    const enough = (k) => before[k]?.[0] >= MIN_STROKES && recent[k]?.[0] >= MIN_STROKES;

    for (const [k] of rankByRate(before).slice(0, 5)) {
      if (!enough(k)) continue;
      const from = rateOf(before[k]);
      const to = rateOf(recent[k]);
      if (to <= from * 0.5) better.push({ ...keyInfo(k), from, to, overcome: true });
      else if (to <= from * 0.8) better.push({ ...keyInfo(k), from, to, overcome: false });
    }

    for (const k of Object.keys(recent)) {
      if (!enough(k)) continue;
      const from = rateOf(before[k]);
      const to = rateOf(recent[k]);
      if (to >= 0.03 && to >= from * 1.5) worse.push({ ...keyInfo(k), from, to });
    }
    worse.sort((a, b) => b.to - a.to);
    worse.splice(3);
  }

  return { cumulative, better, worse };
}
