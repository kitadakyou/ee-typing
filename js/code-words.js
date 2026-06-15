// プログラミングコードのお題。直打ちモードで使う。
//   C#  … dotnet/runtime コーディングスタイル（4スペース / Allman / 言語キーワード / PascalCase）。
//   TS  … standardjs（2スペース / セミコロンなし / シングルクォート / 宣言の括弧前スペース / ===）。
// 各要素 { title, code }。行数は packFunctions が code から算出する。
import { shuffled } from './words.js';

export const CSHARP_FUNCS = [
  {
    title: '階乗（再帰）',
    code: `
public static int Factorial(int n)
{
    if (n <= 1)
    {
        return 1;
    }

    return n * Factorial(n - 1);
}
`.trim(),
  },
  {
    title: 'FizzBuzz',
    code: `
public static string FizzBuzz(int n)
{
    if (n % 15 == 0)
    {
        return "FizzBuzz";
    }

    if (n % 3 == 0)
    {
        return "Fizz";
    }

    if (n % 5 == 0)
    {
        return "Buzz";
    }

    return n.ToString();
}
`.trim(),
  },
  {
    title: '配列の合計',
    code: `
public static int Sum(int[] values)
{
    int total = 0;
    foreach (int value in values)
    {
        total += value;
    }

    return total;
}
`.trim(),
  },
  {
    title: '最大値',
    code: `
public static int Max(int[] values)
{
    int max = values[0];
    for (int i = 1; i < values.Length; i++)
    {
        if (values[i] > max)
        {
            max = values[i];
        }
    }

    return max;
}
`.trim(),
  },
  {
    title: '文字列の反転',
    code: `
public static string Reverse(string text)
{
    char[] chars = text.ToCharArray();
    int left = 0;
    int right = chars.Length - 1;
    while (left < right)
    {
        char tmp = chars[left];
        chars[left] = chars[right];
        chars[right] = tmp;
        left++;
        right--;
    }

    return new string(chars);
}
`.trim(),
  },
  {
    title: '回文判定',
    code: `
public static bool IsPalindrome(string text)
{
    int left = 0;
    int right = text.Length - 1;
    while (left < right)
    {
        if (text[left] != text[right])
        {
            return false;
        }

        left++;
        right--;
    }

    return true;
}
`.trim(),
  },
  {
    title: '二分探索',
    code: `
public static int BinarySearch(int[] sorted, int target)
{
    int low = 0;
    int high = sorted.Length - 1;
    while (low <= high)
    {
        int mid = (low + high) / 2;
        if (sorted[mid] == target)
        {
            return mid;
        }

        if (sorted[mid] < target)
        {
            low = mid + 1;
        }
        else
        {
            high = mid - 1;
        }
    }

    return -1;
}
`.trim(),
  },
  {
    title: 'バブルソート',
    code: `
public static void BubbleSort(int[] values)
{
    for (int i = 0; i < values.Length - 1; i++)
    {
        for (int j = 0; j < values.Length - i - 1; j++)
        {
            if (values[j] > values[j + 1])
            {
                int tmp = values[j];
                values[j] = values[j + 1];
                values[j + 1] = tmp;
            }
        }
    }
}
`.trim(),
  },
  {
    title: '最大公約数',
    code: `
public static int Gcd(int a, int b)
{
    while (b != 0)
    {
        int tmp = b;
        b = a % b;
        a = tmp;
    }

    return a;
}
`.trim(),
  },
  {
    title: 'フィボナッチ',
    code: `
public static int Fibonacci(int n)
{
    int a = 0;
    int b = 1;
    for (int i = 0; i < n; i++)
    {
        int next = a + b;
        a = b;
        b = next;
    }

    return a;
}
`.trim(),
  },
  {
    title: 'クランプ',
    code: `
public static int Clamp(int value, int min, int max)
{
    return value < min ? min : value > max ? max : value;
}
`.trim(),
  },
  {
    title: '出現回数を数える',
    code: `
public static int Count(int[] values, int target)
{
    int count = 0;
    foreach (int value in values)
    {
        if (value == target)
        {
            count++;
        }
    }

    return count;
}
`.trim(),
  },
  {
    title: '素数判定',
    code: `
public static bool IsPrime(int n)
{
    if (n < 2)
    {
        return false;
    }

    for (int i = 2; i * i <= n; i++)
    {
        if (n % i == 0)
        {
            return false;
        }
    }

    return true;
}
`.trim(),
  },
  {
    title: '平均値',
    code: `
public static double Average(int[] values)
{
    int total = 0;
    foreach (int value in values)
    {
        total += value;
    }

    return (double)total / values.Length;
}
`.trim(),
  },
  {
    title: '先頭を大文字に',
    code: `
public static string Capitalize(string text)
{
    if (text.Length == 0)
    {
        return text;
    }

    return char.ToUpper(text[0]) + text.Substring(1);
}
`.trim(),
  },
  {
    title: 'べき乗',
    code: `
public static long Power(int baseValue, int exponent)
{
    long result = 1;
    for (int i = 0; i < exponent; i++)
    {
        result *= baseValue;
    }

    return result;
}
`.trim(),
  },
  {
    title: '含むか判定',
    code: `
public static bool Contains(int[] values, int target)
{
    foreach (int value in values)
    {
        if (value == target)
        {
            return true;
        }
    }

    return false;
}
`.trim(),
  },
  {
    title: '重複の除去',
    code: `
public static List<int> Distinct(int[] values)
{
    var seen = new HashSet<int>();
    var result = new List<int>();
    foreach (int value in values)
    {
        if (seen.Add(value))
        {
            result.Add(value);
        }
    }

    return result;
}
`.trim(),
  },
  {
    title: '最小値',
    code: `
public static int Min(int[] values)
{
    int min = values[0];
    for (int i = 1; i < values.Length; i++)
    {
        if (values[i] < min)
        {
            min = values[i];
        }
    }

    return min;
}
`.trim(),
  },
  {
    title: '絶対値',
    code: `
public static int Abs(int n)
{
    return n < 0 ? -n : n;
}
`.trim(),
  },
  {
    title: '偶数判定',
    code: `
public static bool IsEven(int n)
{
    return n % 2 == 0;
}
`.trim(),
  },
  {
    title: '符号',
    code: `
public static int Sign(int n)
{
    return n > 0 ? 1 : n < 0 ? -1 : 0;
}
`.trim(),
  },
  {
    title: '線形探索',
    code: `
public static int IndexOf(int[] values, int target)
{
    for (int i = 0; i < values.Length; i++)
    {
        if (values[i] == target)
        {
            return i;
        }
    }

    return -1;
}
`.trim(),
  },
  {
    title: '配列の積',
    code: `
public static long Product(int[] values)
{
    long result = 1;
    foreach (int value in values)
    {
        result *= value;
    }

    return result;
}
`.trim(),
  },
  {
    title: '桁数を数える',
    code: `
public static int CountDigits(int n)
{
    if (n < 0)
    {
        n = -n;
    }

    int count = 1;
    while (n >= 10)
    {
        count++;
        n /= 10;
    }

    return count;
}
`.trim(),
  },
  {
    title: '各桁の和',
    code: `
public static int DigitSum(int n)
{
    if (n < 0)
    {
        n = -n;
    }

    int sum = 0;
    while (n > 0)
    {
        sum += n % 10;
        n /= 10;
    }

    return sum;
}
`.trim(),
  },
  {
    title: '最小公倍数',
    code: `
public static int Lcm(int a, int b)
{
    int x = a;
    int y = b;
    while (y != 0)
    {
        int tmp = y;
        y = x % y;
        x = tmp;
    }

    return a / x * b;
}
`.trim(),
  },
  {
    title: '二乗の和',
    code: `
public static int SumOfSquares(int[] values)
{
    int total = 0;
    foreach (int value in values)
    {
        total += value * value;
    }

    return total;
}
`.trim(),
  },
  {
    title: '母音を数える',
    code: `
public static int CountVowels(string text)
{
    int count = 0;
    foreach (char c in text)
    {
        if ("aeiou".Contains(c))
        {
            count++;
        }
    }

    return count;
}
`.trim(),
  },
  {
    title: '文字列の繰り返し',
    code: `
public static string Repeat(string text, int times)
{
    string result = "";
    for (int i = 0; i < times; i++)
    {
        result += text;
    }

    return result;
}
`.trim(),
  },
  {
    title: '三角数',
    code: `
public static int Triangular(int n)
{
    int total = 0;
    for (int i = 1; i <= n; i++)
    {
        total += i;
    }

    return total;
}
`.trim(),
  },
  {
    title: '配列の逆順',
    code: `
public static int[] ReverseArray(int[] values)
{
    int[] result = new int[values.Length];
    for (int i = 0; i < values.Length; i++)
    {
        result[i] = values[values.Length - 1 - i];
    }

    return result;
}
`.trim(),
  },
  {
    title: '偶数を抽出',
    code: `
public static List<int> FilterEven(int[] values)
{
    var result = new List<int>();
    foreach (int value in values)
    {
        if (value % 2 == 0)
        {
            result.Add(value);
        }
    }

    return result;
}
`.trim(),
  },
  {
    title: '文字の出現回数',
    code: `
public static int CountChar(string text, char target)
{
    int count = 0;
    foreach (char c in text)
    {
        if (c == target)
        {
            count++;
        }
    }

    return count;
}
`.trim(),
  },
  {
    title: '累積和',
    code: `
public static List<int> RunningTotal(int[] values)
{
    var result = new List<int>();
    int sum = 0;
    foreach (int value in values)
    {
        sum += value;
        result.Add(sum);
    }

    return result;
}
`.trim(),
  },
  {
    title: '範囲内判定',
    code: `
public static bool IsInRange(int value, int min, int max)
{
    return value >= min && value <= max;
}
`.trim(),
  },
  {
    title: '2値の最大',
    code: `
public static int MaxOf(int a, int b)
{
    return a > b ? a : b;
}
`.trim(),
  },
  {
    title: '2値の最小',
    code: `
public static int MinOf(int a, int b)
{
    return a < b ? a : b;
}
`.trim(),
  },
];

export const TS_FUNCS = [
  {
    title: '階乗（再帰）',
    code: `
function factorial (n) {
  if (n <= 1) {
    return 1
  }
  return n * factorial(n - 1)
}
`.trim(),
  },
  {
    title: 'FizzBuzz',
    code: `
function fizzBuzz (n) {
  if (n % 15 === 0) {
    return 'FizzBuzz'
  }
  if (n % 3 === 0) {
    return 'Fizz'
  }
  if (n % 5 === 0) {
    return 'Buzz'
  }
  return String(n)
}
`.trim(),
  },
  {
    title: '配列の合計',
    code: `
function sum (values) {
  let total = 0
  for (const value of values) {
    total += value
  }
  return total
}
`.trim(),
  },
  {
    title: '最大値',
    code: `
function max (values) {
  let result = values[0]
  for (let i = 1; i < values.length; i++) {
    if (values[i] > result) {
      result = values[i]
    }
  }
  return result
}
`.trim(),
  },
  {
    title: '文字列の反転',
    code: `
function reverse (text) {
  let result = ''
  for (const ch of text) {
    result = ch + result
  }
  return result
}
`.trim(),
  },
  {
    title: '回文判定',
    code: `
function isPalindrome (text) {
  let left = 0
  let right = text.length - 1
  while (left < right) {
    if (text[left] !== text[right]) {
      return false
    }
    left++
    right--
  }
  return true
}
`.trim(),
  },
  {
    title: '二分探索',
    code: `
function binarySearch (sorted, target) {
  let low = 0
  let high = sorted.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (sorted[mid] === target) {
      return mid
    }
    if (sorted[mid] < target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return -1
}
`.trim(),
  },
  {
    title: 'バブルソート',
    code: `
function bubbleSort (values) {
  for (let i = 0; i < values.length - 1; i++) {
    for (let j = 0; j < values.length - i - 1; j++) {
      if (values[j] > values[j + 1]) {
        const tmp = values[j]
        values[j] = values[j + 1]
        values[j + 1] = tmp
      }
    }
  }
  return values
}
`.trim(),
  },
  {
    title: '最大公約数',
    code: `
function gcd (a, b) {
  while (b !== 0) {
    const tmp = b
    b = a % b
    a = tmp
  }
  return a
}
`.trim(),
  },
  {
    title: 'フィボナッチ',
    code: `
function fibonacci (n) {
  let a = 0
  let b = 1
  for (let i = 0; i < n; i++) {
    const next = a + b
    a = b
    b = next
  }
  return a
}
`.trim(),
  },
  {
    title: 'クランプ',
    code: `
function clamp (value, min, max) {
  return value < min ? min : value > max ? max : value
}
`.trim(),
  },
  {
    title: '出現回数を数える',
    code: `
function count (values, target) {
  let result = 0
  for (const value of values) {
    if (value === target) {
      result++
    }
  }
  return result
}
`.trim(),
  },
  {
    title: '素数判定',
    code: `
function isPrime (n) {
  if (n < 2) {
    return false
  }
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      return false
    }
  }
  return true
}
`.trim(),
  },
  {
    title: '平均値',
    code: `
function average (values) {
  let total = 0
  for (const value of values) {
    total += value
  }
  return total / values.length
}
`.trim(),
  },
  {
    title: '先頭を大文字に',
    code: `
function capitalize (text) {
  if (text.length === 0) {
    return text
  }
  return text[0].toUpperCase() + text.slice(1)
}
`.trim(),
  },
  {
    title: '重複の除去',
    code: `
function unique (values) {
  const seen = new Set()
  const result = []
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result
}
`.trim(),
  },
  {
    title: '配列の分割',
    code: `
function chunk (items, size) {
  const result = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}
`.trim(),
  },
  {
    title: '連番の生成',
    code: `
function range (start, end) {
  const result = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}
`.trim(),
  },
  {
    title: '最小値',
    code: `
function min (values) {
  let result = values[0]
  for (let i = 1; i < values.length; i++) {
    if (values[i] < result) {
      result = values[i]
    }
  }
  return result
}
`.trim(),
  },
  {
    title: '絶対値',
    code: `
function abs (n) {
  return n < 0 ? -n : n
}
`.trim(),
  },
  {
    title: '偶数判定',
    code: `
function isEven (n) {
  return n % 2 === 0
}
`.trim(),
  },
  {
    title: '符号',
    code: `
function sign (n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0
}
`.trim(),
  },
  {
    title: '線形探索',
    code: `
function indexOf (values, target) {
  for (let i = 0; i < values.length; i++) {
    if (values[i] === target) {
      return i
    }
  }
  return -1
}
`.trim(),
  },
  {
    title: '配列の積',
    code: `
function product (values) {
  let result = 1
  for (const value of values) {
    result *= value
  }
  return result
}
`.trim(),
  },
  {
    title: '桁数を数える',
    code: `
function countDigits (n) {
  if (n < 0) {
    n = -n
  }
  let count = 1
  while (n >= 10) {
    count++
    n = Math.floor(n / 10)
  }
  return count
}
`.trim(),
  },
  {
    title: '各桁の和',
    code: `
function digitSum (n) {
  if (n < 0) {
    n = -n
  }
  let sum = 0
  while (n > 0) {
    sum += n % 10
    n = Math.floor(n / 10)
  }
  return sum
}
`.trim(),
  },
  {
    title: '最小公倍数',
    code: `
function lcm (a, b) {
  let x = a
  let y = b
  while (y !== 0) {
    const tmp = y
    y = x % y
    x = tmp
  }
  return a / x * b
}
`.trim(),
  },
  {
    title: '二乗の和',
    code: `
function sumOfSquares (values) {
  let total = 0
  for (const value of values) {
    total += value * value
  }
  return total
}
`.trim(),
  },
  {
    title: '母音を数える',
    code: `
function countVowels (text) {
  let count = 0
  for (const ch of text) {
    if ('aeiou'.includes(ch)) {
      count++
    }
  }
  return count
}
`.trim(),
  },
  {
    title: '文字列の繰り返し',
    code: `
function repeat (text, times) {
  let result = ''
  for (let i = 0; i < times; i++) {
    result += text
  }
  return result
}
`.trim(),
  },
  {
    title: '三角数',
    code: `
function triangular (n) {
  let total = 0
  for (let i = 1; i <= n; i++) {
    total += i
  }
  return total
}
`.trim(),
  },
  {
    title: '配列の逆順',
    code: `
function reverseArray (values) {
  const result = []
  for (let i = values.length - 1; i >= 0; i--) {
    result.push(values[i])
  }
  return result
}
`.trim(),
  },
  {
    title: '偶数を抽出',
    code: `
function filterEven (values) {
  const result = []
  for (const value of values) {
    if (value % 2 === 0) {
      result.push(value)
    }
  }
  return result
}
`.trim(),
  },
  {
    title: '文字の出現回数',
    code: `
function countChar (text, target) {
  let count = 0
  for (const ch of text) {
    if (ch === target) {
      count++
    }
  }
  return count
}
`.trim(),
  },
  {
    title: '累積和',
    code: `
function runningTotal (values) {
  const result = []
  let sum = 0
  for (const value of values) {
    sum += value
    result.push(sum)
  }
  return result
}
`.trim(),
  },
  {
    title: '範囲内判定',
    code: `
function isInRange (value, min, max) {
  return value >= min && value <= max
}
`.trim(),
  },
  {
    title: '2値の最大',
    code: `
function maxOf (a, b) {
  return a > b ? a : b
}
`.trim(),
  },
  {
    title: '2値の最小',
    code: `
function minOf (a, b) {
  return a < b ? a : b
}
`.trim(),
  },
];

// 言語キー -> お題プール
export const CODE_POOLS = {
  csharp: CSHARP_FUNCS,
  typescript: TS_FUNCS,
};

// 言語の表示名
export const LANG_LABELS = {
  csharp: 'C#',
  typescript: 'TypeScript',
};

function lineCount(code) {
  return code.replace(/\s+$/, '').split('\n').length;
}

// 関数を順に詰め合わせ、合計行数が 40 を超えた時点で停止（最低1個）。
export function packFunctions(pool) {
  const order = shuffled(pool);
  const picked = [];
  let total = 0;
  for (const f of order) {
    picked.push(f);
    total += lineCount(f.code);
    if (total > 40) break;
  }
  return picked;
}
