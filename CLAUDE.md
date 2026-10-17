# CLAUDE.md — ee-typing

e-typing（https://www.e-typing.ne.jp/）のタイピング練習部分だけを真似た Web アプリ。
モードは、日本語（青空文庫などの長文をローマ字入力）、C# / TypeScript のコード直打ち、
有名 OSS の小さな関数を言語混在で打つ「なんでもあり（OSS）」。
素の HTML / CSS / JS（ES Modules）で、ビルドツールも依存ライブラリも無い。

## 入力まわりの前提

- 物理キーを直接拾うので IME OFF が前提。日本語モードは `e.key` を小文字化し、コードモードは
  `(` と `9`、`A` と `a` を区別するため小文字化しない。
- キーボード見本はどのモードも US 配列（利用者が US 配列）。Shift 記号はベースキーと逆の手の Shift を
  点灯させる。日本語でもキー→文字の対応は日本語 IME のローマ字入力と同じにする（`「`=`[`、`！`=Shift+1 など）。
- ローマ字判定は並列仮説方式。貪欲に確定すると `かんけい` を `kannkei` と打ったときに詰む。
  単独の `n` は次が母音・`y` 以外のときだけ「ん」として通す。見本表示は各候補配列の先頭（訓令式・ん=nn）。

## お題を足すとき

お題データは表示と打鍵が別物なので、エンジンが止まらないことを機械的に確かめてから入れる。

- `reading` は `romaji.js` の TABLE にあるかなと記号だけで書く。`――` や `…` は TABLE に無いので
  `reading` からは除く（`display` には残す）。追加したら全 reading をエンジンに通して打ち切れるか確かめる。
  これは打てることしか保証しないので、読みそのものは目で確かめる。
- コードお題の文字はすべて `US_CHAR_TO_KEY` で引けること（引けない文字は指のハイライトが欠ける）。
  行中のタブは Tab キーで打てないので 1 スペースにする。
- エンジンを触ったら `romaji.js` / `code-engine.js` 末尾のセルフテストを通す
  （CLI なら `cp js/romaji.js $TMPDIR/x.mjs && node $TMPDIR/x.mjs`）。

### 日本語

- 原作の連続した一節にする（飛び飛びの抜粋にしない）。`display` は原文、`reading` は現代仮名。
- 青空文庫の本文は `curl` で XHTML を取り、`iconv -f SHIFT_JIS -t UTF-8` で変換する。
  WebFetch は要約されてルビが落ちるので使えない。漢字の読みはルビ（`<rt>`）を根拠にする。
- 外字（`<img class="gaiji">`）を含む段落は避ける（表示が崩れる）。
- 青空文庫はパブリックドメインでも CC でもよい。ただし ND は不可（読みを付けるのが改変に当たる）で、NC も避ける。
- Wikipedia の抜粋（`words-wikipedia.js`）は CC BY-SA 4.0。MIT のコードと別ファイルに分け、版（oldid）を README に書く。
  ルビが無いので読みは手で付ける。ライセンスは `license` に内部で持ち、画面の出典表示には出さない。

### OSS（なんでもあり）

- GitHub スター 5k 以上で、ライセンスが MIT / BSD / ISC / Apache-2.0 / PSF / パブリックドメインなどの許容系のもの。
  GPL / AGPL / LGPL / MPL / SSPL / EPL などコピーレフト系は弱いものも使わない。
  GitHub API の判定が NOASSERTION / null ならライセンス本文を読む。リポジトリの一部だけ別ライセンスのことがある
  （ランタイムだけ LGPL など）ので、抜き出すファイルに効く条件を確かめる。
- 1 プロジェクト 1〜2 関数、20 行程度まで。コメントと docstring を除き、インデントを関数単位で詰める以外は原文のまま。
  コメントに別作者の帰属表示がある関数は使わない（除去すると表示が消える）。
- ライセンスは各要素の `license` / `url`（コミット固定のパーマリンク）と `THIRD_PARTY_NOTICES.md` に持ち、画面には出さない。

### C# / TypeScript（手書きのお題）

- C# は dotnet/runtime のスタイル（Allman ブレース、4 スペース）、TS は standardjs（セミコロンなし、シングルクォート、
  宣言の括弧前スペース）。1 テストの中で言語を混ぜない（なんでもあり（OSS）だけは混ぜる）。

## CSS の罠

- `.code-view` の中の `<code>` は UA スタイルの `font-family: monospace` で継承が切れるので、
  `.code-view code { font-family: inherit }` が要る。
- 問題文のフォント（日本語は Zen Kaku Gothic New、コードは Source Code Pro）は、それぞれのモードページでだけ
  Google Fonts から読む。問題文以外の要素は既存のフォントのまま。

## 動かし方（WSL2 + Windows Chrome）

- 配信は `python3 -m http.server 3000 --bind 0.0.0.0`。3000 番を外へ公開している。sandbox の中で待ち受けると
  外から届かないので、起動だけは sandbox の外で行う。
- ブラウザ確認は chrome-devtools MCP。Chrome は
  `"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 '--remote-allow-origins=*' '--user-data-dir=C:\ChromeDebug'`
  で起動し、`http://localhost:9222/json/version` が JSON を返せばつながる。favicon.ico の 404 は無害。
