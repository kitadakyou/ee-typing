// コード直打ちエンジン。romaji.js と同じインターフェイスを実装する。
//   setText / input / finished / nextChars / expectedKey / typedRomaji / remainingRomaji
//
// 仕様（ユーザー確定）:
//   - 行頭インデント（行の先頭の連続する空白/タブ）は自動スキップする。
//   - 行末では Enter（'\n'）を打って次行へ進む。空行は Enter のみ。
//   - 行内のトークン間スペースは通常どおり打鍵する。
// 並列仮説は不要（コードは決定的に1文字ずつ）。target 全文に対するカーソル方式。

export function createCodeEngine() {
  let target = ''; // インデント・改行込みの全文
  let pos = 0; // 次に打つ文字の位置

  // pos が「行頭」か（直前が改行、または先頭まで空白のみ）
  function atLineStart(p) {
    let q = p - 1;
    while (q >= 0 && (target[q] === ' ' || target[q] === '\t')) q--;
    return q < 0 || target[q] === '\n';
  }

  // 行頭にいるとき連続する空白/タブを自動消費する
  function skipIndent() {
    while (
      pos < target.length &&
      (target[pos] === ' ' || target[pos] === '\t') &&
      atLineStart(pos)
    ) {
      pos++;
    }
  }

  function setText(code) {
    target = String(code).replace(/\s+$/, ''); // 末尾の空白/改行を除去し finish をきれいに
    pos = 0;
    skipIndent();
  }

  function isFinished() {
    return pos >= target.length;
  }

  // 1打鍵を処理。{ ok, finished } を返す。改行は '\n' で渡す。
  function input(ch) {
    if (pos >= target.length) return { ok: false, finished: true };
    if (ch !== target[pos]) return { ok: false, finished: false };
    pos++;
    skipIndent();
    return { ok: true, finished: isFinished() };
  }

  function nextChars() {
    return pos < target.length ? [target[pos]] : [];
  }

  function expectedKey() {
    return pos < target.length ? target[pos] : null;
  }

  // 表示用（main 側で <pre> に出すと、自動スキップ済みインデントは typed 領域に入る）。
  function typedRomaji() {
    return target.slice(0, pos);
  }
  function remainingRomaji() {
    return target.slice(pos);
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

// ===== セルフテスト（import 時に console 出力） =====
function runSelfTest() {
  const eng = createCodeEngine();
  let pass = 0;
  let fail = 0;
  function check(name, cond) {
    if (cond) pass++;
    else {
      fail++;
      console.error(`[code-engine selftest] FAIL ${name}`);
    }
  }

  // 期待キーをそのまま打ち続けて完走できるか（自己整合・停止性）
  function autoType(code) {
    eng.setText(code);
    let guard = 0;
    while (!eng.finished()) {
      const c = eng.expectedKey();
      if (!eng.input(c).ok) return false;
      if (guard++ > 100000) return false;
    }
    return true;
  }

  // 行頭インデント自動スキップ
  eng.setText('    return 1;');
  check('skip-indent expectedKey', eng.expectedKey() === 'r');
  check('skip-indent typed', eng.typedRomaji() === '    ');

  // 行内スペースは打つ
  eng.setText('a b');
  eng.input('a');
  check('inner-space not skipped', eng.expectedKey() === ' ');
  check('inner-space accept', eng.input(' ').ok === true);
  check('inner-space then b', eng.expectedKey() === 'b');

  // 改行は '\n' で打つ
  eng.setText('a\nb');
  eng.input('a');
  check('newline expected', eng.expectedKey() === '\n');
  check('newline accept', eng.input('\n').ok === true);
  check('after-newline char', eng.expectedKey() === 'b');

  // 誤打は ok:false
  eng.setText('ab');
  check('reject wrong', eng.input('x').ok === false);
  check('reject keeps pos', eng.expectedKey() === 'a');

  // 改行後のインデントも自動スキップ
  eng.setText('if (x)\n{\n    y();\n}');
  for (const c of 'if (x)') eng.input(c);
  eng.input('\n');
  check('next-line brace', eng.expectedKey() === '{');
  eng.input('{');
  eng.input('\n');
  check('next-line indent skipped', eng.expectedKey() === 'y');

  // 記号を含む C#（Allman）を完走
  const csharp = [
    'public static int Factorial(int n)',
    '{',
    '    if (n <= 1)',
    '    {',
    '        return 1;',
    '    }',
    '',
    '    return n * Factorial(n - 1);',
    '}',
  ].join('\n');
  check('autoType C#', autoType(csharp) === true);

  // TS（standardjs・セミコロンなし・シングルクォート）を完走
  const ts = [
    "function greet (name) {",
    "  return 'hi ' + name",
    '}',
  ].join('\n');
  check('autoType TS', autoType(ts) === true);

  console.log(`[code-engine selftest] ${pass} passed, ${fail} failed`);
  return fail === 0;
}

runSelfTest();
