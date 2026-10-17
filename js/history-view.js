// 結果画面の「これまでの推移」グラフと、上達・悪化・累計の苦手なキーの描画。
const NS = 'http://www.w3.org/2000/svg';
const CHART_RUNS = 20; // グラフに出す回数
const RANK_LINES = [['S', 350], ['A', 280], ['B', 200], ['C', 140], ['D', 80]];
const METRICS = [
  { key: 'score', label: 'スコア', ranks: true },
  { key: 'kpm', label: 'KPM' },
  { key: 'miss', label: 'ミス数' },
];
const H = 90, PAD_L = 30, PAD_R = 8, PAD_T = 8, PAD_B = 16;

const pct = (r) => `${(r * 100).toFixed(1)}%`;

function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function fmtDate(t) {
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 推移グラフ。履歴が今回分しかなければ節ごと隠す。
export function renderTrends(section, note, grid, runs) {
  const shown = runs.slice(-CHART_RUNS);
  section.hidden = shown.length < 2;
  if (section.hidden) return;
  note.textContent = `直近 ${shown.length} 回`;
  const draw = () => {
    grid.innerHTML = '';
    for (const m of METRICS) {
      const card = document.createElement('div');
      card.className = 'chart';
      grid.appendChild(card);
      renderChart(card, m, shown);
    }
  };
  draw();
  // 幅に合わせて描き直す（viewBox を実寸にして文字を拡縮させないため）
  window.onresize = () => {
    if (!section.hidden && section.offsetParent) draw();
  };
}

function renderChart(card, m, runs) {
  const W = card.clientWidth - 24;
  const vals = runs.map((r) => r[m.key]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = (max - min) * 0.15 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const x = (i) => PAD_L + (i / (runs.length - 1)) * (W - PAD_L - PAD_R);
  const y = (v) => PAD_T + (1 - (v - lo) / (hi - lo)) * (H - PAD_T - PAD_B);

  const now = vals[vals.length - 1];
  const diff = now - vals[vals.length - 2];
  card.innerHTML = `<div class="chart-head"><span>${m.label}</span><span><span class="chart-now">${now}</span><span class="chart-delta">前回比 ${diff >= 0 ? '+' : ''}${diff}</span></span></div>`;

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${m.label}の推移` });
  // 横線: スコアはランクの境目、それ以外は最小値と最大値
  const lines = m.ranks
    ? RANK_LINES.filter(([, v]) => v > lo && v < hi).map(([r, v]) => [v, r])
    : [...new Set([min, max])].map((v) => [v, `${v}`]);
  for (const [v, text] of lines) {
    svg.appendChild(svgEl('line', { class: 'grid', x1: PAD_L, x2: W - PAD_R, y1: y(v), y2: y(v) }));
    const t = svgEl('text', { class: 'axis-text', x: PAD_L - 6, y: y(v) + 3, 'text-anchor': 'end' });
    t.textContent = text;
    svg.appendChild(t);
  }
  const first = svgEl('text', { class: 'axis-text', x: PAD_L, y: H - 2 });
  first.textContent = `${runs.length - 1} 回前`;
  const last = svgEl('text', { class: 'axis-text', x: W - PAD_R, y: H - 2, 'text-anchor': 'end' });
  last.textContent = '今回';
  svg.append(first, last);

  const pts = vals.map((v, i) => `${x(i)},${y(v)}`);
  svg.appendChild(svgEl('path', { class: 'area', d: `M${x(0)},${H - PAD_B} L${pts.join(' L')} L${x(vals.length - 1)},${H - PAD_B} Z` }));
  svg.appendChild(svgEl('path', { class: 'line', d: `M${pts.join(' L')}` }));
  svg.appendChild(svgEl('circle', { class: 'now-dot', cx: x(vals.length - 1), cy: y(now), r: 4.5 }));

  // ホバー: いちばん近い回の値と日時
  const hLine = svgEl('line', { class: 'hover-line', y1: PAD_T, y2: H - PAD_B, visibility: 'hidden' });
  const hDot = svgEl('circle', { class: 'hover-dot', r: 4.5, visibility: 'hidden' });
  svg.append(hLine, hDot);
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.hidden = true;
  svg.addEventListener('pointermove', (e) => {
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(runs.length - 1, Math.round(((sx - PAD_L) / (W - PAD_L - PAD_R)) * (runs.length - 1))));
    for (const el of [hLine, hDot]) el.setAttribute('visibility', 'visible');
    hLine.setAttribute('x1', x(i));
    hLine.setAttribute('x2', x(i));
    hDot.setAttribute('cx', x(i));
    hDot.setAttribute('cy', y(vals[i]));
    tip.innerHTML = `<b>${vals[i]}</b> <span class="tip-sub">${i === runs.length - 1 ? '今回' : fmtDate(runs[i].at)}</span>`;
    tip.style.left = `${x(i) + 12}px`;
    tip.style.top = `${svg.offsetTop + y(vals[i]) - 6}px`;
    tip.hidden = false;
  });
  svg.addEventListener('pointerleave', () => {
    for (const el of [hLine, hDot]) el.setAttribute('visibility', 'hidden');
    tip.hidden = true;
  });

  card.append(svg, tip);
}

const keyHtml = (k) => `<b>${escapeHtml(k.label)}</b>${k.finger ? `（${k.finger}）` : ''}`;

function escapeHtml(str) {
  return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// 上達しているキー・苦手になってきているキー。該当がなければ枠ごと隠す。
export function renderKeyNotes(betterBox, worseBox, { better, worse }) {
  betterBox.hidden = better.length === 0;
  betterBox.querySelector('ul').innerHTML = better
    .map((k) => k.overcome
      ? `<li><span class="key-note-icon" aria-hidden="true">✓</span><span>${keyHtml(k)}は苦手でしたが、ミス率が ${pct(k.from)} から ${pct(k.to)} まで下がりました。克服です。</span></li>`
      : `<li><span class="key-note-icon" aria-hidden="true">↘</span><span>${keyHtml(k)}は苦手でしたが、だんだんミス率が下がっています（${pct(k.from)} → ${pct(k.to)}）。</span></li>`)
    .join('');

  worseBox.hidden = worse.length === 0;
  worseBox.querySelector('ul').innerHTML = worse
    .map((k) => `<li><span class="key-note-icon" aria-hidden="true">↗</span><span>${keyHtml(k)}は、前よりミス率が上がっています（${pct(k.from)} → ${pct(k.to)}）。</span></li>`)
    .join('');
}

const TREND_MARK = { down: '↓', up: '↑', flat: '→' };

// 累計の苦手なキー（ミス率の高い順）と、今回のミス率。
export function renderCumulative(ul, cumulative) {
  if (cumulative.length === 0) {
    ul.innerHTML = '<li class="weak-none">まだ記録が足りません</li>';
    return;
  }
  ul.innerHTML = cumulative
    .map((k) => {
      const finger = k.finger ? `<span class="weak-finger">${k.finger}</span>` : '';
      const now = k.now
        ? `今回 ${pct(k.now.rate)} ${TREND_MARK[k.trend]}（${k.now.n} 打中 ${k.now.m}）`
        : '今回 打鍵なし';
      return `<li><span class="weak-name">${escapeHtml(k.label)}${finger}</span><span class="cum"><span class="weak-count">${pct(k.rate)}</span><span class="cum-trend">${now}</span></span></li>`;
    })
    .join('');
}
