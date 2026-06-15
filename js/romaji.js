// かな→ローマ字オートマトン＋打鍵マッチャ（並列仮説方式）。
//
// 方針:
//  - 「両対応」: 正しいローマ字なら複数の打ち方を全部正解にする（し=si/shi/ci 等）。
//  - 見本表示(グレー)は訓令式・nn・子音重ねを canonical（各かなの先頭候補）に置く。
//  - 貪欲コミットせず、ノード境界をまたぐ「並列仮説」で判定する。
//    例: かんけい を kannkei(ん=nn) でも kankei(ん=n) でも通す。

// ===== かな→ローマ字テーブル（各配列の先頭が canonical=見本表示用） =====
// っ(促音) と ん(撥音) は edgesFrom 内で特別扱いするのでここには入れない。
const TABLE = {
  // 母音
  あ: ['a'], い: ['i'], う: ['u'], え: ['e'], お: ['o'],
  // か行/が行
  か: ['ka'], き: ['ki'], く: ['ku', 'cu'], け: ['ke'], こ: ['ko'],
  が: ['ga'], ぎ: ['gi'], ぐ: ['gu'], げ: ['ge'], ご: ['go'],
  // さ行/ざ行
  さ: ['sa'], し: ['si', 'shi', 'ci'], す: ['su'], せ: ['se'], そ: ['so'],
  ざ: ['za'], じ: ['zi', 'ji'], ず: ['zu'], ぜ: ['ze'], ぞ: ['zo'],
  // た行/だ行
  た: ['ta'], ち: ['ti', 'chi'], つ: ['tu', 'tsu'], て: ['te'], と: ['to'],
  だ: ['da'], ぢ: ['di'], づ: ['du', 'zu'], で: ['de'], ど: ['do'],
  // な行
  な: ['na'], に: ['ni'], ぬ: ['nu'], ね: ['ne'], の: ['no'],
  // は行/ば行/ぱ行
  は: ['ha'], ひ: ['hi'], ふ: ['hu', 'fu'], へ: ['he'], ほ: ['ho'],
  ば: ['ba'], び: ['bi'], ぶ: ['bu'], べ: ['be'], ぼ: ['bo'],
  ぱ: ['pa'], ぴ: ['pi'], ぷ: ['pu'], ぺ: ['pe'], ぽ: ['po'],
  // ま行
  ま: ['ma'], み: ['mi'], む: ['mu'], め: ['me'], も: ['mo'],
  // や行
  や: ['ya'], ゆ: ['yu'], よ: ['yo'],
  // ら行
  ら: ['ra'], り: ['ri'], る: ['ru'], れ: ['re'], ろ: ['ro'],
  // わ行
  わ: ['wa'], を: ['wo'], ゔ: ['vu'],
  // 小書き単独
  ぁ: ['xa', 'la'], ぃ: ['xi', 'li'], ぅ: ['xu', 'lu'], ぇ: ['xe', 'le'], ぉ: ['xo', 'lo'],
  ゃ: ['xya', 'lya'], ゅ: ['xyu', 'lyu'], ょ: ['xyo', 'lyo'], ゎ: ['xwa', 'lwa'],
  // 長音
  ー: ['-'],

  // ===== 拗音（2かな。canonical は訓令式） =====
  きゃ: ['kya'], きゅ: ['kyu'], きょ: ['kyo'],
  ぎゃ: ['gya'], ぎゅ: ['gyu'], ぎょ: ['gyo'],
  しゃ: ['sya', 'sha'], しゅ: ['syu', 'shu'], しょ: ['syo', 'sho'],
  じゃ: ['zya', 'ja', 'jya'], じゅ: ['zyu', 'ju', 'jyu'], じょ: ['zyo', 'jo', 'jyo'],
  ちゃ: ['tya', 'cha', 'cya'], ちゅ: ['tyu', 'chu', 'cyu'], ちょ: ['tyo', 'cho', 'cyo'],
  にゃ: ['nya'], にゅ: ['nyu'], にょ: ['nyo'],
  ひゃ: ['hya'], ひゅ: ['hyu'], ひょ: ['hyo'],
  びゃ: ['bya'], びゅ: ['byu'], びょ: ['byo'],
  ぴゃ: ['pya'], ぴゅ: ['pyu'], ぴょ: ['pyo'],
  みゃ: ['mya'], みゅ: ['myu'], みょ: ['myo'],
  りゃ: ['rya'], りゅ: ['ryu'], りょ: ['ryo'],

  // ===== 外来音（2かな。canonical はユーザーの流儀: でぃ=dhi 等） =====
  しぇ: ['sye', 'she'], ちぇ: ['tye', 'che'], じぇ: ['zye', 'je'],
  てぃ: ['thi'], でぃ: ['dhi'], てゅ: ['thu'], でゅ: ['dhu'],
  ふぁ: ['fa'], ふぃ: ['fi'], ふぇ: ['fe'], ふぉ: ['fo'], ふゅ: ['fyu'],
  うぃ: ['wi'], うぇ: ['we'], うぉ: ['wo'],
  ゔぁ: ['va'], ゔぃ: ['vi'], ゔぇ: ['ve'], ゔぉ: ['vo'],
  つぁ: ['tsa'], つぃ: ['tsi'], つぇ: ['tse'], つぉ: ['tso'],
};

const VOWELS = 'aiueo';
const isConsonant = (c) => c && !VOWELS.includes(c);

// 撥音「ん」の単独 n を許可してよいか。
// 次のかなが存在し、その先頭文字が母音でも 'y' でもない場合のみ許可。
// （な行=n 始まりは許可。これで みんな=minna / かんな=kanna が通る。
//   語末・母音前・や行前は nn 必須＝ほん=honn, れんあい は renn..., こんや は konnya）
function singleNAllowed(reading, i) {
  if (i + 1 >= reading.length) return false; // 語末は不可
  const nextEdges = edgesFrom(reading, i + 1);
  if (nextEdges.length === 0) return false;
  for (const e of nextEdges) {
    const head = e.token[0];
    if (VOWELS.includes(head) || head === 'y') return false;
  }
  return true;
}

// 位置 i から出るエッジ集合 [{ token, next }] を遅延生成する。
// 先頭エッジが canonical（見本表示用）になるよう並べる。
function edgesFrom(reading, i) {
  if (i >= reading.length) return [];
  const ch = reading[i];
  const ch2 = reading[i + 1];

  // --- 促音 っ ---
  if (ch === 'っ') {
    const edges = [];
    // 次エッジの先頭子音を重ねる（canonical: っか=kka）
    for (const e of edgesFrom(reading, i + 1)) {
      if (isConsonant(e.token[0])) edges.push({ token: e.token[0] + e.token, next: e.next });
    }
    // 単独表記（xtu/ltu 系）
    for (const t of ['xtu', 'ltu', 'xtsu', 'ltsu']) edges.push({ token: t, next: i + 1 });
    return edges;
  }

  // --- 撥音 ん ---
  if (ch === 'ん') {
    const edges = [{ token: 'nn', next: i + 1 }]; // canonical
    if (singleNAllowed(reading, i)) edges.push({ token: 'n', next: i + 1 });
    edges.push({ token: 'xn', next: i + 1 });
    return edges;
  }

  const edges = [];
  // 拗音・外来音（2かな）を先に（canonical を combined 形にする）
  if (ch2 && TABLE[ch + ch2]) {
    for (const t of TABLE[ch + ch2]) edges.push({ token: t, next: i + 2 });
  }
  // 単独かな（拗音も ki+xya のように分割打鍵できるよう常に追加）
  if (TABLE[ch]) {
    for (const t of TABLE[ch]) edges.push({ token: t, next: i + 1 });
  }
  return edges;
}

// 先頭エッジを辿った canonical ローマ字（idx 以降）
function canonicalFrom(reading, idx) {
  let s = '';
  let j = idx;
  while (j < reading.length) {
    const e = edgesFrom(reading, j)[0];
    if (!e) break;
    s += e.token;
    j = e.next;
  }
  return s;
}

// 仮説のキー（重複排除用）。境界仮説は edge=null。
function hypoKey(h) {
  return h.edge ? `${h.i}|${h.edge.token}|${h.edge.next}|${h.pos}` : `n${h.i}`;
}

export function createEngine() {
  let reading = '';
  let state = []; // 生存仮説 [{ i, edge|null, pos }]
  let typed = ''; // 受理した実打鍵（typedRomaji 表示用）

  function setText(hiragana) {
    reading = hiragana;
    state = [{ i: 0, edge: null, pos: 0 }];
    typed = '';
  }

  // 1打鍵を処理。{ ok, finished } を返す。
  function input(rawCh) {
    const ch = rawCh;
    const next = [];
    let accepted = false;
    for (const h of state) {
      // 境界仮説はその場でエッジ群へ展開、エッジ仮説はそのまま。
      const conts = h.edge ? [h] : edgesFrom(reading, h.i).map((e) => ({ i: h.i, edge: e, pos: 0 }));
      for (const c of conts) {
        if (c.edge.token[c.pos] !== ch) continue;
        accepted = true;
        if (c.pos + 1 === c.edge.token.length) {
          next.push({ i: c.edge.next, edge: null, pos: 0 }); // エッジ完了→次ノード境界
        } else {
          next.push({ i: c.i, edge: c.edge, pos: c.pos + 1 });
        }
      }
    }
    if (!accepted) return { ok: false, finished: false };
    // 重複排除
    const seen = new Set();
    state = next.filter((h) => {
      const k = hypoKey(h);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    typed += ch;
    return { ok: true, finished: isFinished() };
  }

  function isFinished() {
    return state.some((h) => !h.edge && h.i >= reading.length);
  }

  // 次に打てる文字の集合（全生存仮説の和）
  function nextChars() {
    const set = new Set();
    for (const h of state) {
      if (h.edge) set.add(h.edge.token[h.pos]);
      else for (const e of edgesFrom(reading, h.i)) set.add(e.token[0]);
    }
    return [...set];
  }

  // 最も進んでいる仮説（表示・苦手キー帰属の canonical 用）
  function bestHypo() {
    let best = state[0];
    let bestScore = -1;
    for (const h of state) {
      const score = h.i * 100 + (h.edge ? h.pos : 0);
      if (score > bestScore) {
        bestScore = score;
        best = h;
      }
    }
    return best;
  }

  // canonical な「次に打つべき1文字」
  function expectedKey() {
    const h = bestHypo();
    if (!h) return null;
    if (h.edge) return h.edge.token[h.pos];
    const e = edgesFrom(reading, h.i)[0];
    return e ? e.token[0] : null;
  }

  function typedRomaji() {
    return typed;
  }

  // 残りローマ字（canonical 表示）
  function remainingRomaji() {
    const h = bestHypo();
    if (!h) return '';
    if (h.edge) return h.edge.token.slice(h.pos) + canonicalFrom(reading, h.edge.next);
    return canonicalFrom(reading, h.i);
  }

  return {
    setText,
    input,
    finished: isFinished,
    nextChars,
    expectedKey,
    typedRomaji,
    remainingRomaji,
  };
}

// ===== セルフテスト（UI 配線前に通す。import 時に console 出力） =====
function runSelfTest() {
  const eng = createEngine();
  // reading を romaji で打ち切れて finished になるか
  function canType(reading, romaji) {
    eng.setText(reading);
    for (const ch of romaji) {
      if (!eng.input(ch).ok) return false;
    }
    return eng.finished();
  }
  const cases = [
    ['accept', 'し', 'si'],
    ['accept', 'し', 'shi'],
    ['accept', 'し', 'ci'],
    ['accept', 'つ', 'tu'],
    ['accept', 'つ', 'tsu'],
    ['accept', 'ふ', 'hu'], // ユーザー流儀
    ['accept', 'ふ', 'fu'],
    ['accept', 'じ', 'zi'],
    ['accept', 'じ', 'ji'],
    ['accept', 'がっこう', 'gakkou'], // 促音=子音重ね
    ['accept', 'がっこう', 'gaxtukou'], // 促音=xtu
    ['accept', 'かんけい', 'kankei'], // ん=単独n
    ['accept', 'かんけい', 'kannkei'], // ん=nn（貪欲だと落ちる回帰）
    ['accept', 'かんな', 'kanna'], // な行前の単独n
    ['accept', 'かんな', 'kannna'], // ん=nn でも可
    ['reject', 'かんな', 'kana'], // ん欠落
    ['accept', 'みんな', 'minna'],
    ['accept', 'ほん', 'honn'], // 語末は nn
    ['reject', 'ほん', 'hon'], // 語末の単独n不可
    ['accept', 'ふとん', 'hutonn'], // ユーザー流儀
    ['accept', 'ふとん', 'futonn'],
    ['accept', 'きゃ', 'kya'],
    ['accept', 'きゃ', 'kixya'], // 分割打鍵
    ['accept', 'しゃ', 'sya'],
    ['accept', 'しゃ', 'sha'],
    ['accept', 'しょうぐん', 'syougunn'], // ユーザー流儀
    ['accept', 'でぃ', 'dhi'], // 外来音 ディ
    ['accept', 'でぃ', 'dexi'], // de+xi 分割
    ['accept', 'でぃ', 'deli'],
    ['accept', 'ふぁ', 'fa'],
    ['accept', 'ふぁ', 'huxa'],
    ['accept', 'てぃ', 'thi'],
    ['accept', 'ゔぁ', 'va'],
  ];
  let pass = 0;
  let fail = 0;
  for (const [kind, reading, romaji] of cases) {
    const got = canType(reading, romaji);
    const ok = kind === 'accept' ? got === true : got === false;
    if (ok) {
      pass++;
    } else {
      fail++;
      console.error(`[romaji selftest] FAIL ${kind} ${reading} <- "${romaji}" (got ${got})`);
    }
  }
  console.log(`[romaji selftest] ${pass} passed, ${fail} failed`);
  return fail === 0;
}

runSelfTest();
