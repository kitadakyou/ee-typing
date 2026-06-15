# CLAUDE.md — タイピング練習ゲーム（e-typing クローン）

## このプロジェクト
e-typing（https://www.e-typing.ne.jp/）の「タイピング練習ゲーム部分」だけの Web クローン。
日本語ローマ字入力。会員機能・スコアランキング等は対象外。

- **技術**: 素の HTML/CSS/JS（ビルドツールなし、ES Modules）。依存ライブラリなし。
- **方針**: KISS / YAGNI。指示されたことだけ実装し、余計な機能追加・リファクタはしない。
- **リポジトリ**: github.com/kitadakyou/ee-typing（private, デフォルト main）。

## 構成
```
index.html        … スタート/プレイ/結果の3画面（お題/読み/ローマ字/キーボード/両手/明転）
css/styles.css    … 白基調・オレンジ(#f0a020)アクセント、3画面のスタイル
js/
  layout.js       … KEY_ROWS（キー配列）＋ KEY_TO_FINGER（キー→指）＋ FINGER_NAMES
  keyboard.js     … renderKeyboard() / highlightKeys()
  hands.js        … renderHands() / highlightFinger()  （'thumb'で左右親指）
  romaji.js       … かな→ローマ字オートマトン＋打鍵マッチャ（並列仮説方式）＋セルフテスト
  words.js        … お題データ {display, reading}（外来音を含む）＋ shuffled()
  stats.js        … 集計・スコア・ランク・苦手キー/指
  main.js         … ゲーム制御（3画面、keydown 連動）
```
指コード: `lp lr lm li`（左 小/薬/中/人）, `ri rm rr rp`（右 人/中/薬/小）, `thumb`（親指）。

## 開発状況
- **Stage 1（見た目サンプル）/ Stage 2（機能）ともに完了・動作確認済み。**
- セルフテスト33件PASS、ブラウザ（chrome-devtools MCP）で検証済み。

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
- お題の `reading` は `romaji.js` の TABLE 網羅内のかなだけ使う（未対応かなでエンジンが停止する）。
- 入力は**直接入力(IME OFF)前提**。`event.key` は小文字化して扱う。`key==="Process"`/IME合成中は無視。
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
