// お題データ。display=画面表示の文、reading=実際に打つひらがな読み。
// reading は romaji.js の対応表が網羅するかなだけを使う（外来音は でぃ/ふぁ/ゔぁ/てぃ 等）。
export const WORDS = [
  { display: '今日もいい天気', reading: 'きょうもいいてんき' },
  { display: 'プログラミング', reading: 'ぷろぐらみんぐ' },
  { display: 'ディレクトリを移動', reading: 'でぃれくとりをいどう' },
  { display: '関係者各位', reading: 'かんけいしゃかくい' },
  { display: '布団を干す', reading: 'ふとんをほす' },
  { display: '将軍の時代', reading: 'しょうぐんのじだい' },
  { display: '撥音と促音', reading: 'はつおんとそくおん' },
  { display: 'ファイルを保存', reading: 'ふぁいるをほぞん' },
  { display: '喫茶店でお茶', reading: 'きっさてんでおちゃ' },
  { display: '新しい靴', reading: 'あたらしいくつ' },
  { display: '学校へ行こう', reading: 'がっこうへいこう' },
  { display: '旅行の計画', reading: 'りょこうのけいかく' },
  { display: '真剣勝負', reading: 'しんけんしょうぶ' },
  { display: '電車が遅れる', reading: 'でんしゃがおくれる' },
  { display: 'ヴァイオリン演奏', reading: 'ゔぁいおりんえんそう' },
  { display: 'みんなで集まる', reading: 'みんなであつまる' },
  { display: 'ティーカップ', reading: 'てぃーかっぷ' },
];

// 配列をシャッフルした新配列を返す（Fisher-Yates）。
export function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
