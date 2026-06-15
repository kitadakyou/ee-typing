# CLAUDE.md — タイピング練習ゲーム（e-typing クローン）

## このプロジェクト
e-typing（https://www.e-typing.ne.jp/）の「タイピング練習ゲーム部分」だけの Web クローン。
日本語ローマ字入力。会員機能・スコアランキング等は対象外。

- **技術**: 素の HTML/CSS/JS（ビルドツールなし、ES Modules）。依存ライブラリなし。
- **方針**: KISS / YAGNI。指示されたことだけ実装し、余計な機能追加・リファクタはしない。

## 構成
```
index.html        … 画面（お題/読み/ローマ字/キーボード/両手/明転オーバーレイ）
css/styles.css    … 白基調・オレンジ(#f0a020)アクセント
js/
  layout.js       … KEY_ROWS（キー配列）＋ KEY_TO_FINGER（キー→指）＋ FINGER_NAMES
  keyboard.js     … renderKeyboard() / highlightKeys()
  hands.js        … renderHands() / highlightFinger()  （'thumb'で左右親指）
  sample.js       … Stage1の見た目サンプル（Stage2で main.js に置換予定）
  romaji.js       … 【Stage2】かな→ローマ字オートマトン＋打鍵マッチャ
  words.js        … 【Stage2】お題データ {display, reading}
  stats.js        … 【Stage2】集計・スコア・苦手キー/指
  main.js         … 【Stage2】ゲーム制御（3画面）
```
指コード: `lp lr lm li`（左 小/薬/中/人）, `ri rm rr rp`（右 人/中/薬/小）, `thumb`（親指）。

## 開発状況
- **Stage 1（見た目サンプル）= 完了・承認済み。**
- **Stage 2（機能）= これから。** 詳細は `HANDOFF.md` と承認済み計画
  `~/.claude/plans/https-www-e-typing-ne-jp-1-starry-giraffe.md` を参照。

## 進め方の作法（重要）
- **段階リリース**: まず見た目サンプルを作って確認を取り、OK後に機能を実装する。
  いきなり全機能を書かない。

## 実装上の必須ルール（Stage 2）
- ローマ字判定は**並列仮説方式**で実装する（貪欲コミット禁止）。
  貪欲だと `かんけい` を `kannkei`(ん=nn) で打つと失敗する。
- ローマ字エンジンは**UI配線前にセルフテストを通す**（し=shi/si、かんけい=kankei/kannkei 両方 等）。
- お題の `reading` は romaji.js の対応表内のかなだけ使う（未対応かなでエンジンが停止する）。
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
