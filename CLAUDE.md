# CLAUDE.md — タイピング練習ゲーム（e-typing クローン）

## このプロジェクト
e-typing（https://www.e-typing.ne.jp/）の「タイピング練習ゲーム部分」だけの Web クローン。
日本語ローマ字入力。会員機能・スコアランキング等は対象外。
加えて、オリジナルにはない **プログラミング言語（C# / TypeScript）コード直打ちモード** を持つ。

- **技術**: 素の HTML/CSS/JS（ビルドツールなし、ES Modules）。依存ライブラリなし。
- **方針**: KISS / YAGNI。指示されたことだけ実装し、余計な機能追加・リファクタはしない。
- **リポジトリ**: github.com/kitadakyou/ee-typing（private, デフォルト main）。

## 構成
```
index.html        … スタート/プレイ/結果の3画面（お題/読み/ローマ字/キーボード/両手/明転）
css/styles.css    … 白基調・オレンジ(#f0a020)アクセント、3画面のスタイル
js/
  layout.js       … KEY_ROWS/KEY_TO_FINGER（JIS・日本語用）＋ US_KEY_ROWS/US_CHAR_TO_KEY（US・コード用）
                    ＋ shiftKeyFor()/shiftFingerFor()（逆手Shift導出）＋ FINGER_NAMES
  keyboard.js     … renderKeyboard(container, rows)（rows で配列差替）/ highlightKeys()。記号は2段ラベル
  hands.js        … renderHands() / highlightFinger()（'thumb'で左右親指、配列で複数指同時）
  romaji.js       … かな→ローマ字オートマトン＋打鍵マッチャ（並列仮説方式）＋セルフテスト
  code-engine.js  … コード直打ちエンジン（romaji.js と同一IF、カーソル方式）＋セルフテスト
  words.js        … 日本語お題 {display, reading}（外来音を含む）＋ shuffled()
  code-words.js   … コードお題 {title, code}（C#/TS 各約18問）＋ packFunctions()
  stats.js        … 集計・スコア・ランク・苦手キー/指（createStats(meta) で言語を保持）
  main.js         … ゲーム制御（3画面、mode='romaji'|'code'、keydown 連動）
```
指コード: `lp lr lm li`（左 小/薬/中/人）, `ri rm rr rp`（右 人/中/薬/小）, `thumb`（親指）。

## 開発状況
- **Stage 1（見た目サンプル）/ Stage 2（機能）ともに完了・動作確認済み。**
- **コードモード（C#/TS）も実装済み・動作確認済み。**
- セルフテスト（romaji 33件 / code-engine 14件）PASS、ブラウザ（chrome-devtools MCP）で検証済み。

## コードモードの確定仕様（重要）
- **目的**: プログラミングの打鍵速度・記号の正確性の練習。**US 配列のみ**対応。
- **エンジン**: ローマ字変換を介さず、コード文字列を1文字ずつ**そのまま**判定（`code-engine.js`、決定的カーソル方式）。
  `e.key` を小文字化せず使い、`(` と `9`・`A` と `a` を区別する（main.js の keydown 分岐）。
- **空白・改行**: 行頭インデントは**自動スキップ**、各行末で **Enter**（`e.key==='Enter'`→`'\n'`）を打つ。
  行内のトークン間スペースは通常どおり打鍵。空行は Enter のみ。
- **Shift/記号の可視化**: Shift は**ベースキーと逆の手**（左手キー→右Shift、右手キー→左Shift）。
  記号入力時は **ベースキー＋Shiftキーの2点灯**、指も **ベース指＋逆手小指の2本**点灯（`US_CHAR_TO_KEY` / `shiftKeyFor` / `shiftFingerFor`）。
  US キーボードは記号を2段ラベルで表示、Shift/Enter/Space は幅広キー（`.keyboard.is-us`）。
- **1テストの構成**: 関数を詰め合わせ**合計が40行を超えたら**停止（`packFunctions`）。**1テスト内で言語は混在させない**。
- **お題のスタイル厳守**（`code-words.js`）:
  - C# = dotnet/runtime（4スペース / **Allman ブレース** / 言語キーワード / PascalCase / `var` は new・キャスト時のみ）。
  - TS = standardjs（2スペース / **セミコロンなし** / **シングルクォート** / 宣言の括弧前スペース `function foo (n)` / `===`）。
- **結果**: `createStats({mode, lang})` で言語を保持し、結果画面に「モード: C#/TypeScript」を表示。

## ローマ字判定の確定仕様（重要）
- **両対応**: 正しいローマ字ならどの打ち方でも正解にする（し=`si`/`shi`/`ci`、つ=`tu`/`tsu`、
  ん=`n`/`nn`、っ=子音重ね/`xtu` 等）。**並列仮説方式**（貪欲コミット禁止）で実装。
  貪欲だと `かんけい` を `kannkei`(ん=nn) で打つと失敗する。
- **見本表示（グレーの残りローマ字）は訓令式・ん=nn・っ=子音重ねを canonical** にする
  （`si/ti/tu/zi/hu`、`kka`、`syougunn`、でぃ=`dhi`）。各かなの候補配列の先頭が canonical。
- **外来音対応**: ディ=`dhi`、ファ=`fa`、ティ=`thi`、ヴ=`vu` 等（`romaji.js` の TABLE 参照）。
  `dexi`/`deli` のような分割打鍵も自動で通る。
- **単独 n** は「次が母音/`y` 以外」のとき許可（な行=n始まりは許可 → `みんな`=minna 可、
  `かんな`=kanna 可）。語末・母音前・や行前は nn 必須（`ほん`=honn）。

## 実装上の必須ルール
- ローマ字エンジンを触ったら **`romaji.js` 末尾のセルフテストを必ず通す**
  （ブラウザは import 時に自動実行。CLIなら `cp js/romaji.js /tmp/x.mjs && node /tmp/x.mjs`）。
- コードエンジンを触ったら **`code-engine.js` 末尾のセルフテストを必ず通す**
  （CLIなら `cp js/code-engine.js /tmp/x.mjs && node /tmp/x.mjs`）。
- お題の `reading` は `romaji.js` の TABLE 網羅内のかなだけ使う（未対応かなでエンジンが停止する）。
- コードお題に使う文字はすべて `US_CHAR_TO_KEY` で解決できること（未登録文字は指ハイライトが欠ける）。
- 入力は**直接入力(IME OFF)前提**。`key==="Process"`/IME合成中は無視。
  日本語モードは `event.key` を小文字化、**コードモードは小文字化せずそのまま**扱う。
- ミス演出は**画面全体の明転（白フラッシュ）**。`#flash` に `.flash` を付け直す。

## 動かし方・確認（WSL2 + Windows Chrome）
```bash
# 配信
cd /home/hikaru/typing && python3 -m http.server 8000
# Chrome を debug モードで起動
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 \
  '--remote-allow-origins=*' '--user-data-dir=C:\ChromeDebug' &
# 接続確認: http://localhost:9222/json/version がJSONを返せばOK
```
- 確認は chrome-devtools MCP: `navigate_page http://localhost:8000` →
  `take_screenshot`（/tmp配下に保存）→ `list_console_messages`。
- favicon.ico の 404 は無害（既知）。
