# 引き継ぎ（e-typing クローン / タイピング練習ゲーム）

## このプロジェクトは何か
e-typing（https://www.e-typing.ne.jp/）の「タイピング練習ゲーム部分」だけの Web クローン。
会員機能などは不要。素の HTML/CSS/JS（ビルド不要、ES Modules）。`/home/hikaru/typing` 直下。

承認済みの詳細計画はここ：
`/home/hikaru/.claude/plans/https-www-e-typing-ne-jp-1-starry-giraffe.md`
**Stage 2 を始める前に必ずこの計画ファイルを読むこと。** 以下はその要約＋現状。

## 進め方（ユーザー指定の重要な作法）
- **段階リリース**。見た目サンプルを先に作って確認 → OK後に機能、という順序。
- **Stage 1（見た目サンプル）は完了・ユーザー承認済み（「完璧です」）。**
- 次は **Stage 2（機能実装）**。これは次コンテキストに引き継ぐ。

## 確定済みの仕様（ユーザー回答）
- 入力方式：**日本語ローマ字入力**
- ローマ字判定：**複数パターン許容**（し=shi/si、ん=n/nn、っ=促音 等）
- 指ガイド：**両手イラスト＋次の指ハイライト**
- 技術：素の HTML/CSS/JS。`python3 -m http.server` で配信
- 追加要件：**結果画面（正打数・WPM・スコア・ランクA/B/C…）＋苦手なキー＋苦手な指**

## 現状（Stage 1 で作成済みファイル）
```
/home/hikaru/typing/
├── index.html        … お題/読み/ローマ字/キーボード/両手/明転オーバーレイ/デモバー
├── css/styles.css    … 白基調・オレンジ(#f0a020)アクセント、ローマ字色分け、
│                        .kb-key.is-next（次キー点灯）、.finger.is-active（次指点灯）、
│                        #flash.flash-overlay + @keyframes flash-anim（画面全体の明転）
└── js/
    ├── layout.js     … KEY_ROWS（フルキーボード配列）＋ KEY_TO_FINGER（キー→指）。
    │                    FINGER_NAMES（指の日本語名）。指コード: lp/lr/lm/li/ri/rm/rr/rp/thumb
    ├── keyboard.js   … renderKeyboard(container) / highlightKeys(keys)
    ├── hands.js      … renderHands(container) / highlightFinger(finger)  ※'thumb'で左右親指
    └── sample.js     … ★Stage1専用の固定表示。Stage2で main.js に置き換える
```
見た目は参照画像（e-typing 実画面）にほぼ一致することをブラウザ確認済み。
明転（白フラッシュ）も全画面に被さることを確認済み。

## Stage 2 でやること
計画の「★核心」「結果・スコア」「ゲーム制御」節に従う。要点：

1. **`js/romaji.js`（最重要）**: かな→ローマ字オートマトン＋打鍵マッチャ。
   - **並列仮説方式（貪欲コミット禁止）**で実装すること。
     貪欲だと `かんけい` を `kannkei`（ん=nn）で打つと失敗する致命バグ。
   - 公開API例: `setText(hiragana)`, `input(char)->{ok,advanced,finished}`,
     `nextChars()`(次に打てる文字の集合), `typedRomaji()`, `remainingRomaji()`
   - **UI配線前にセルフテストを通す**（識別ケース）:
     し→shi/si両方、っか→kka/xtuka両方、**かんけい→kankei/kannkei両方**、
     かんな→kanna可/kana不可、ほん→honn可/hon不可、きゃ→kya、しゃ→sha/sya
   - 促音っ＝次子音重ね＋xtu/ltu系。撥音ん＝nn/xn、単独nは「次が母音/n/y以外の子音」のみ可。
   - お題のかなは romaji.js の対応表内に収める（っち=tchiや外来音ふぁ/てぃ/ヴは未対応＝v1で使わない）。

2. **`js/words.js`**: `{display:"...", reading:"ひらがな"}` を10〜20件。readingは実際に打つ読み。

3. **`js/stats.js`**: correct/miss/経過時間。
   - 苦手なキー＝誤打時、nextChars()が複数候補なら**最初の正準候補1つ**にmiss帰属。
   - 苦手な指＝その正準キーの finger（layout.js の KEY_TO_FINGER）で集計。
   - WPM=(correct/5)/分。スコア=round(KPM×accuracy^3)。ランクS/A/B/C/D/E（閾値は体感調整）。

4. **`js/main.js`**: スタート/プレイ/結果の3画面。`sample.js` を置き換える形で同じDOM/クラスを動的更新。
   - keydownで1文字ずつengineへ。正打→ローマ字色分け更新＋次キー＆次指ハイライト。
     誤打→stats.miss++＋該当キー集計＋**画面全体を明転**（#flash に .flash を付け直す。sample.jsの doFlash() を流用）。
   - **IME前提**: 直接入力(IME OFF)前提。スタート画面に「IMEをオフ」と明記。`key==="Process"`/IME合成中は無視。
   - `event.key` は**小文字化**して扱う（Shift/CapsLockで誤ミス計上しない）。
   - 1文字目の打鍵で計測開始。セット（例5文）終了で結果画面へ。リトライボタン。

## 既存コードの再利用ポイント
- 次キー点灯 = `highlightKeys(nextChars())`（keyboard.js）。
- 次指点灯 = nextChars の正準キー → `KEY_TO_FINGER[key]` → `highlightFinger(finger)`（hands.js）。
- 明転 = sample.js の `doFlash()` 相当（#flash の .flash 付け直し）。main.js に移植。
- ローマ字の色分けDOM: index.html の `#romaji-typed`(.typed) と `#romaji-rest`(.rest) を
  打鍵進捗に応じて分割表示する（typedRomaji/remainingRomaji を流し込む）。

## 動かし方・検証
- 配信: `cd /home/hikaru/typing && python3 -m http.server 8000`（※前コンテキストで既に起動済みの可能性あり。
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/` で確認、ダメなら起動し直す）
- Chrome debug 起動（CLAUDE.md手順）:
  `"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --remote-debugging-port=9222 '--remote-allow-origins=*' '--user-data-dir=C:\ChromeDebug' &`
  → `http://localhost:9222/json/version` がJSONを返せばOK。
- chrome-devtools MCP: `navigate_page http://localhost:8000` → `take_screenshot` → `list_console_messages`。
  ※`press_key`/`evaluate_script` はIMEをバイパスするので自動入力テストはそのまま通る。
- favicon.ico の404は無害（既知）。

## 注意 / ハマりどころ
- 貪欲コミット禁止（上記）。並列仮説で実装。
- お題の読みは対応表内のかなだけ使う（未対応かなでエンジンが停止する）。
- スコア式はe-typing完全一致を目指さない。A/B/C…のランクが出れば十分（ユーザー了承済み）。
