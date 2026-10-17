// 「なんでもあり」モードのお題。GitHub のスター 5k 以上・GPL 系以外のライセンスの OSS から、
// 小さな関数をそのまま抜き出したもの（コメントと docstring は除去し、インデントは関数単位で詰め、
// 行中の連続空白・タブは 1 スペースにした）。
// 各要素 { lang, title, repo, license, url, code }。url は抜き出し元のコミット固定のパーマリンク。
// ライセンス本文と著作権表示は THIRD_PARTY_NOTICES.md にまとめている。
export const OSS_FUNCS = [
  {
    lang: 'Go',
    title: 'strings.Count',
    repo: 'golang/go',
    license: 'BSD-3-Clause',
    url: 'https://github.com/golang/go/blob/dfc6f7db9bd75868ffb5cbc9501a2f4899122d2f/src/strings/strings.go#L42-L59',
    code: `
func Count(s, substr string) int {
	if len(substr) == 0 {
		return utf8.RuneCountInString(s) + 1
	}
	if len(substr) == 1 {
		return bytealg.CountString(s, substr[0])
	}
	n := 0
	for {
		i := Index(s, substr)
		if i == -1 {
			return n
		}
		n++
		s = s[i+len(substr):]
	}
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'sort.Search',
    repo: 'golang/go',
    license: 'BSD-3-Clause',
    url: 'https://github.com/golang/go/blob/dfc6f7db9bd75868ffb5cbc9501a2f4899122d2f/src/sort/search.go#L58-L73',
    code: `
func Search(n int, f func(int) bool) int {
	i, j := 0, n
	for i < j {
		h := int(uint(i+j) >> 1)
		if !f(h) {
			i = h + 1
		} else {
			j = h
		}
	}
	return i
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'utf8.RuneLen',
    repo: 'golang/go',
    license: 'BSD-3-Clause',
    url: 'https://github.com/golang/go/blob/dfc6f7db9bd75868ffb5cbc9501a2f4899122d2f/src/unicode/utf8/utf8.go#L347-L363',
    code: `
func RuneLen(r rune) int {
	switch {
	case r < 0:
		return -1
	case r <= rune1Max:
		return 1
	case r <= rune2Max:
		return 2
	case surrogateMin <= r && r <= surrogateMax:
		return -1
	case r <= rune3Max:
		return 3
	case r <= MaxRune:
		return 4
	}
	return -1
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'utf8.ValidRune',
    repo: 'golang/go',
    license: 'BSD-3-Clause',
    url: 'https://github.com/golang/go/blob/dfc6f7db9bd75868ffb5cbc9501a2f4899122d2f/src/unicode/utf8/utf8.go#L570-L578',
    code: `
func ValidRune(r rune) bool {
	switch {
	case 0 <= r && r < surrogateMin:
		return true
	case surrogateMax < r && r <= MaxRune:
		return true
	}
	return false
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'math.Abs',
    repo: 'golang/go',
    license: 'BSD-3-Clause',
    url: 'https://github.com/golang/go/blob/dfc6f7db9bd75868ffb5cbc9501a2f4899122d2f/src/math/abs.go#L13-L15',
    code: `
func Abs(x float64) float64 {
	return Float64frombits(Float64bits(x) &^ signMask)
}
`.trim(),
  },
  {
    lang: 'Python',
    title: 'bisect.bisect_right',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/bisect.py#L21-L54',
    code: `
def bisect_right(a, x, lo=0, hi=None, *, key=None):
    if lo < 0:
        raise ValueError('lo must be non-negative')
    if hi is None:
        hi = len(a)
    if key is None:
        while lo < hi:
            mid = (lo + hi) // 2
            if x < a[mid]:
                hi = mid
            else:
                lo = mid + 1
    else:
        while lo < hi:
            mid = (lo + hi) // 2
            if x < key(a[mid]):
                hi = mid
            else:
                lo = mid + 1
    return lo
`.trim(),
  },
  {
    lang: 'Python',
    title: 'heapq.heappush',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/heapq.py#L133-L136',
    code: `
def heappush(heap, item):
    heap.append(item)
    _siftdown(heap, 0, len(heap)-1)
`.trim(),
  },
  {
    lang: 'Python',
    title: 'heapq.heappop',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/heapq.py#L138-L146',
    code: `
def heappop(heap):
    lastelt = heap.pop()
    if heap:
        returnitem = heap[0]
        heap[0] = lastelt
        _siftup(heap, 0)
        return returnitem
    return lastelt
`.trim(),
  },
  {
    lang: 'Python',
    title: 'heapq.heappushpop',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/heapq.py#L164-L169',
    code: `
def heappushpop(heap, item):
    if heap and heap[0] < item:
        item, heap[0] = heap[0], item
        _siftup(heap, 0)
    return item
`.trim(),
  },
  {
    lang: 'Python',
    title: 'heapq._siftdown',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/heapq.py#L221-L233',
    code: `
def _siftdown(heap, startpos, pos):
    newitem = heap[pos]
    while pos > startpos:
        parentpos = (pos - 1) >> 1
        parent = heap[parentpos]
        if newitem < parent:
            heap[pos] = parent
            pos = parentpos
            continue
        break
    heap[pos] = newitem
`.trim(),
  },
  {
    lang: 'Python',
    title: 'statistics.median',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/statistics.py#L329-L350',
    code: `
def median(data):
    data = sorted(data)
    n = len(data)
    if n == 0:
        raise StatisticsError("no median for empty data")
    if n % 2 == 1:
        return data[n // 2]
    else:
        i = n // 2
        return (data[i - 1] + data[i]) / 2
`.trim(),
  },
  {
    lang: 'Python',
    title: 'statistics.median_high',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/statistics.py#L378-L394',
    code: `
def median_high(data):
    data = sorted(data)
    n = len(data)
    if n == 0:
        raise StatisticsError("no median for empty data")
    return data[n // 2]
`.trim(),
  },
  {
    lang: 'Python',
    title: 'textwrap.dedent',
    repo: 'python/cpython',
    license: 'PSF-2.0',
    url: 'https://github.com/python/cpython/blob/010bebbf9fd12bba1e3f40bdbddacd51a9c2bf20/Lib/textwrap.py#L416-L444',
    code: `
def dedent(text):
    try:
        lines = text.split('\\n')
    except (AttributeError, TypeError):
        msg = f'expected str object, not {type(text).__qualname__!r}'
        raise TypeError(msg) from None

    non_blank_lines = [l for l in lines if l and not l.isspace()]
    l1 = min(non_blank_lines, default='')
    l2 = max(non_blank_lines, default='')
    margin = 0
    for margin, c in enumerate(l1):
        if c != l2[margin] or c not in ' \\t':
            break

    return '\\n'.join([l[margin:] if not l.isspace() else '' for l in lines])
`.trim(),
  },
  {
    lang: 'Python',
    title: 'get_debug_flag',
    repo: 'pallets/flask',
    license: 'BSD-3-Clause',
    url: 'https://github.com/pallets/flask/blob/d086db856be187255b8ec61ef409357393020f32/src/flask/helpers.py#L28-L33',
    code: `
def get_debug_flag() -> bool:
    val = os.environ.get("FLASK_DEBUG")
    return bool(val and val.lower() not in {"0", "false", "no"})
`.trim(),
  },
  {
    lang: 'Python',
    title: 'get_load_dotenv',
    repo: 'pallets/flask',
    license: 'BSD-3-Clause',
    url: 'https://github.com/pallets/flask/blob/d086db856be187255b8ec61ef409357393020f32/src/flask/helpers.py#L36-L48',
    code: `
def get_load_dotenv(default: bool = True) -> bool:
    val = os.environ.get("FLASK_SKIP_DOTENV")

    if not val:
        return default

    return val.lower() in ("0", "false", "no")
`.trim(),
  },
  {
    lang: 'Python',
    title: '_split_blueprint_path',
    repo: 'pallets/flask',
    license: 'BSD-3-Clause',
    url: 'https://github.com/pallets/flask/blob/d086db856be187255b8ec61ef409357393020f32/src/flask/helpers.py#L645-L651',
    code: `
def _split_blueprint_path(name: str) -> list[str]:
    out: list[str] = [name]

    if "." in name:
        out.extend(_split_blueprint_path(name.rpartition(".")[0]))

    return out
`.trim(),
  },
  {
    lang: 'JavaScript (Flow)',
    title: 'is',
    repo: 'react/react',
    license: 'MIT',
    url: 'https://github.com/react/react/blob/098d2e87a1f7142947418d15f63f975b58c4685b/packages/shared/objectIs.js#L14-L18',
    code: `
function is(x: any, y: any) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
  );
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'setCharset',
    repo: 'expressjs/express',
    license: 'MIT',
    url: 'https://github.com/expressjs/express/blob/a419aa7350389a275ab45fde2e849ed1f02449ef/lib/utils.js#L225-L238',
    code: `
exports.setCharset = function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  var parsed = contentType.parse(type);

  parsed.parameters.charset = charset;

  return contentType.format(parsed);
};
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'createETagGenerator',
    repo: 'expressjs/express',
    license: 'MIT',
    url: 'https://github.com/expressjs/express/blob/a419aa7350389a275ab45fde2e849ed1f02449ef/lib/utils.js#L249-L257',
    code: `
function createETagGenerator (options) {
  return function generateETag (body, encoding) {
    var buf = !Buffer.isBuffer(body)
      ? Buffer.from(body, encoding)
      : body

    return etag(buf, options)
  }
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'arrayMap',
    repo: 'lodash/lodash',
    license: 'MIT',
    url: 'https://github.com/lodash/lodash/blob/2b5e6f7399a7b48005140b5d5c6bc6c0e62919a8/lodash.js#L648-L657',
    code: `
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'arrayEvery',
    repo: 'lodash/lodash',
    license: 'MIT',
    url: 'https://github.com/lodash/lodash/blob/2b5e6f7399a7b48005140b5d5c6bc6c0e62919a8/lodash.js#L568-L578',
    code: `
function arrayEvery(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false;
    }
  }
  return true;
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'baseFindIndex',
    repo: 'lodash/lodash',
    license: 'MIT',
    url: 'https://github.com/lodash/lodash/blob/2b5e6f7399a7b48005140b5d5c6bc6c0e62919a8/lodash.js#L812-L822',
    code: `
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'baseClamp',
    repo: 'lodash/lodash',
    license: 'MIT',
    url: 'https://github.com/lodash/lodash/blob/2b5e6f7399a7b48005140b5d5c6bc6c0e62919a8/lodash.js#L2639-L2649',
    code: `
function baseClamp(number, lower, upper) {
  if (number === number) {
    if (upper !== undefined) {
      number = number <= upper ? number : upper;
    }
    if (lower !== undefined) {
      number = number >= lower ? number : lower;
    }
  }
  return number;
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'compact',
    repo: 'lodash/lodash',
    license: 'MIT',
    url: 'https://github.com/lodash/lodash/blob/2b5e6f7399a7b48005140b5d5c6bc6c0e62919a8/lodash.js#L6969-L6982',
    code: `
function compact(array) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (value) {
      result[resIndex++] = value;
    }
  }
  return result;
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'chunk',
    repo: 'lodash/lodash',
    license: 'MIT',
    url: 'https://github.com/lodash/lodash/blob/2b5e6f7399a7b48005140b5d5c6bc6c0e62919a8/lodash.js#L6934-L6952',
    code: `
function chunk(array, size, guard) {
  if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
    size = 1;
  } else {
    size = nativeMax(toInteger(size), 0);
  }
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  var index = 0,
      resIndex = 0,
      result = Array(nativeCeil(length / size));

  while (index < length) {
    result[resIndex++] = baseSlice(array, index, (index += size));
  }
  return result;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'luaS_eqstr',
    repo: 'lua/lua',
    license: 'MIT',
    url: 'https://github.com/lua/lua/blob/8cb93bada561977eb370819e39d7d644e5fd0a3f/lstring.c#L44-L50',
    code: `
int luaS_eqstr (TString *a, TString *b) {
  size_t len1, len2;
  const char *s1 = getlstr(a, len1);
  const char *s2 = getlstr(b, len2);
  return ((len1 == len2) &&
          (memcmp(s1, s2, len1) == 0));
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'luaS_hash',
    repo: 'lua/lua',
    license: 'MIT',
    url: 'https://github.com/lua/lua/blob/8cb93bada561977eb370819e39d7d644e5fd0a3f/lstring.c#L53-L58',
    code: `
static unsigned luaS_hash (const char *str, size_t l, unsigned seed) {
  unsigned int h = seed ^ cast_uint(l);
  for (; l > 0; l--)
    h ^= ((h<<5) + (h>>2) + cast_byte(str[l - 1]));
  return h;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'luaL_newmetatable',
    repo: 'lua/lua',
    license: 'MIT',
    url: 'https://github.com/lua/lua/blob/8cb93bada561977eb370819e39d7d644e5fd0a3f/lauxlib.c#L317-L327',
    code: `
LUALIB_API int luaL_newmetatable (lua_State *L, const char *tname) {
  if (luaL_getmetatable(L, tname) != LUA_TNIL)
    return 0;
  lua_pop(L, 1);
  lua_createtable(L, 0, 2);
  lua_pushstring(L, tname);
  lua_setfield(L, -2, "__name");
  lua_pushvalue(L, -1);
  lua_setfield(L, LUA_REGISTRYINDEX, tname);
  return 1;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'luaL_checknumber',
    repo: 'lua/lua',
    license: 'MIT',
    url: 'https://github.com/lua/lua/blob/8cb93bada561977eb370819e39d7d644e5fd0a3f/lauxlib.c#L426-L432',
    code: `
LUALIB_API lua_Number luaL_checknumber (lua_State *L, int arg) {
  int isnum;
  lua_Number d = lua_tonumberx(L, arg, &isnum);
  if (l_unlikely(!isnum))
    tag_error(L, arg, LUA_TNUMBER);
  return d;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'skipBOM',
    repo: 'lua/lua',
    license: 'MIT',
    url: 'https://github.com/lua/lua/blob/8cb93bada561977eb370819e39d7d644e5fd0a3f/lauxlib.c#L792-L798',
    code: `
static int skipBOM (FILE *f) {
  int c = getc(f);
  if (c == 0xEF && getc(f) == 0xBB && getc(f) == 0xBF)
    return getc(f);
  else
    return c;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'sqlite3Strlen30',
    repo: 'sqlite/sqlite',
    license: 'Public Domain',
    url: 'https://github.com/sqlite/sqlite/blob/3bc2ad344b6b4121bfd9f3cc73d66c5cb72ce7fe/src/util.c#L99-L102',
    code: `
int sqlite3Strlen30(const char *z){
  if( z==0 ) return 0;
  return 0x3fffffff & (int)strlen(z);
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'sqlite3Dequote',
    repo: 'sqlite/sqlite',
    license: 'Public Domain',
    url: 'https://github.com/sqlite/sqlite/blob/3bc2ad344b6b4121bfd9f3cc73d66c5cb72ce7fe/src/util.c#L305-L326',
    code: `
void sqlite3Dequote(char *z){
  char quote;
  int i, j;
  if( z==0 ) return;
  quote = z[0];
  if( !sqlite3Isquote(quote) ) return;
  if( quote=='[' ) quote = ']';
  for(i=1, j=0;; i++){
    assert( z[i] );
    if( z[i]==quote ){
      if( z[i+1]==quote ){
        z[j++] = quote;
        i++;
      }else{
        break;
      }
    }else{
      z[j++] = z[i];
    }
  }
  z[j] = 0;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'sqlite3_stricmp',
    repo: 'sqlite/sqlite',
    license: 'Public Domain',
    url: 'https://github.com/sqlite/sqlite/blob/3bc2ad344b6b4121bfd9f3cc73d66c5cb72ce7fe/src/util.c#L415-L422',
    code: `
int sqlite3_stricmp(const char *zLeft, const char *zRight){
  if( zLeft==0 ){
    return zRight ? -1 : 0;
  }else if( zRight==0 ){
    return 1;
  }
  return sqlite3StrICmp(zLeft, zRight);
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'sqlite3StrICmp',
    repo: 'sqlite/sqlite',
    license: 'Public Domain',
    url: 'https://github.com/sqlite/sqlite/blob/3bc2ad344b6b4121bfd9f3cc73d66c5cb72ce7fe/src/util.c#L423-L441',
    code: `
int sqlite3StrICmp(const char *zLeft, const char *zRight){
  unsigned char *a, *b;
  int c, x;
  a = (unsigned char *)zLeft;
  b = (unsigned char *)zRight;
  for(;;){
    c = *a;
    x = *b;
    if( c==x ){
      if( c==0 ) break;
    }else{
      c = (int)UpperToLower[c] - (int)UpperToLower[x];
      if( c ) break;
    }
    a++;
    b++;
  }
  return c;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'sqlite3AbsInt32',
    repo: 'sqlite/sqlite',
    license: 'Public Domain',
    url: 'https://github.com/sqlite/sqlite/blob/3bc2ad344b6b4121bfd9f3cc73d66c5cb72ce7fe/src/util.c#L2012-L2016',
    code: `
int sqlite3AbsInt32(int x){
  if( x>=0 ) return x;
  if( x==(int)0x80000000 ) return 0x7fffffff;
  return -x;
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'util.ToKebabCase',
    repo: 'junegunn/fzf',
    license: 'MIT',
    url: 'https://github.com/junegunn/fzf/blob/55c122f1a0e1340546c8709682bea5561fe0e8fd/src/util/util.go#L125-L134',
    code: `
func ToKebabCase(s string) string {
	name := ""
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			name += "-"
		}
		name += string(r)
	}
	return strings.ToLower(name)
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'util.RunOnce',
    repo: 'junegunn/fzf',
    license: 'MIT',
    url: 'https://github.com/junegunn/fzf/blob/55c122f1a0e1340546c8709682bea5561fe0e8fd/src/util/util.go#L83-L90',
    code: `
func RunOnce(f func()) func() {
	once := Once(true)
	return func() {
		if once() {
			f()
		}
	}
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'first_wday_of',
    repo: 'jqlang/jq',
    license: 'MIT',
    url: 'https://github.com/jqlang/jq/blob/633ae6058a05b0240c798f6b7b60d3b0a87cab8e/src/util.c#L586-L591',
    code: `
static int
first_wday_of(int yr)
{
    return ((2 * (3 - (yr / 100) % 4)) + (yr % 100) + ((yr % 100) / 4) +
        (isleap(yr) ? 6 : 0) + 1) % 7;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'Curl_strntoupper',
    repo: 'curl/curl',
    license: 'curl',
    url: 'https://github.com/curl/curl/blob/eaa9103225bff16bdf1bb2842f312897b1342e85/lib/strcase.c#L77-L85',
    code: `
void Curl_strntoupper(char *dest, const char *src, size_t n)
{
  if(n < 1)
    return;

  do {
    *dest++ = Curl_raw_toupper(*src);
  } while(*src++ && --n);
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'Curl_safecmp',
    repo: 'curl/curl',
    license: 'curl',
    url: 'https://github.com/curl/curl/blob/eaa9103225bff16bdf1bb2842f312897b1342e85/lib/strcase.c#L105-L110',
    code: `
bool Curl_safecmp(const char *a, const char *b)
{
  if(a && b)
    return !strcmp(a, b);
  return !a && !b;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'xstrdup',
    repo: 'tmux/tmux',
    license: 'ISC',
    url: 'https://github.com/tmux/tmux/blob/2e4a4db4e9fe6b976a0a956af88e427fcbbe44ba/xmalloc.c#L86-L94',
    code: `
char *
xstrdup(const char *str)
{
	char *cp;

	if ((cp = strdup(str)) == NULL)
		fatal("xstrdup");
	return cp;
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'utf8_strlen',
    repo: 'tmux/tmux',
    license: 'ISC',
    url: 'https://github.com/tmux/tmux/blob/2e4a4db4e9fe6b976a0a956af88e427fcbbe44ba/utf8.c#L885-L893',
    code: `
size_t
utf8_strlen(const struct utf8_data *s)
{
	size_t i;

	for (i = 0; s[i].size != 0; i++)
		;
	return (i);
}
`.trim(),
  },
  {
    lang: 'Ruby',
    title: 'Utils.pluralize',
    repo: 'Homebrew/brew',
    license: 'BSD-2-Clause',
    url: 'https://github.com/Homebrew/brew/blob/19fe946b9a257cb41ebb5cef5c592ba7923d1f3b/Library/Homebrew/utils.rb#L107-L120',
    code: `
def self.pluralize(stem, count, plural: "s", singular: "", include_count: false)
  case stem
  when "formula"
    plural = "e"
  when "dependency", "try"
    stem = stem.delete_suffix("y")
    plural = "ies"
    singular = "y"
  end

  prefix = include_count ? "#{count} " : ""
  suffix = (count == 1) ? singular : plural
  "#{prefix}#{stem}#{suffix}"
end
`.trim(),
  },
  {
    lang: 'Ruby',
    title: 'Utils.demodulize',
    repo: 'Homebrew/brew',
    license: 'BSD-2-Clause',
    url: 'https://github.com/Homebrew/brew/blob/19fe946b9a257cb41ebb5cef5c592ba7923d1f3b/Library/Homebrew/utils.rb#L33-L37',
    code: `
def self.demodulize(path)
  raise ArgumentError, "No constant path provided" if path.nil?

  path.rpartition("::").last
end
`.trim(),
  },
  {
    lang: 'C',
    title: 'ngx_strlow',
    repo: 'nginx/nginx',
    license: 'BSD-2-Clause',
    url: 'https://github.com/nginx/nginx/blob/1725db9059e8d4057ce8d5090673d16e20713b45/src/core/ngx_string.c#L22-L31',
    code: `
void
ngx_strlow(u_char *dst, u_char *src, size_t n)
{
    while (n) {
        *dst = ngx_tolower(*src);
        dst++;
        src++;
        n--;
    }
}
`.trim(),
  },
  {
    lang: 'C',
    title: 'ngx_hex_dump',
    repo: 'nginx/nginx',
    license: 'BSD-2-Clause',
    url: 'https://github.com/nginx/nginx/blob/1725db9059e8d4057ce8d5090673d16e20713b45/src/core/ngx_string.c#L1172-L1183',
    code: `
u_char *
ngx_hex_dump(u_char *dst, u_char *src, size_t len)
{
    static u_char hex[] = "0123456789abcdef";

    while (len--) {
        *dst++ = hex[*src >> 4];
        *dst++ = hex[*src++ & 0xf];
    }

    return dst;
}
`.trim(),
  },
  {
    lang: 'Python',
    title: 'utils.dotted_netmask',
    repo: 'psf/requests',
    license: 'Apache-2.0',
    url: 'https://github.com/psf/requests/blob/611c6162cbc4ac2020a2f91c7cfa4f3abf9bbb60/src/requests/utils.py#L741-L749',
    code: `
def dotted_netmask(mask: int) -> str:
    bits = 0xFFFFFFFF ^ (1 << 32 - mask) - 1
    return socket.inet_ntoa(struct.pack(">I", bits))
`.trim(),
  },
  {
    lang: 'Python',
    title: 'utils.is_ipv4_address',
    repo: 'psf/requests',
    license: 'Apache-2.0',
    url: 'https://github.com/psf/requests/blob/611c6162cbc4ac2020a2f91c7cfa4f3abf9bbb60/src/requests/utils.py#L752-L760',
    code: `
def is_ipv4_address(string_ip: str) -> bool:
    try:
        socket.inet_aton(string_ip)
    except OSError:
        return False
    return True
`.trim(),
  },
  {
    lang: 'Python',
    title: 'utils.default_user_agent',
    repo: 'psf/requests',
    license: 'Apache-2.0',
    url: 'https://github.com/psf/requests/blob/611c6162cbc4ac2020a2f91c7cfa4f3abf9bbb60/src/requests/utils.py#L942-L948',
    code: `
def default_user_agent(name: str = "python-requests") -> str:
    return f"{name}/{__version__}"
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'isBuffer',
    repo: 'axios/axios',
    license: 'MIT',
    url: 'https://github.com/axios/axios/blob/326843a3902d73c9f6af9bad7b55e2412566a251/lib/utils.js#L221-L230',
    code: `
function isBuffer(val) {
  return (
    val !== null &&
    !isUndefined(val) &&
    val.constructor !== null &&
    !isUndefined(val.constructor) &&
    isFunction(val.constructor.isBuffer) &&
    val.constructor.isBuffer(val)
  );
}
`.trim(),
  },
  {
    lang: 'JavaScript',
    title: 'getGlobal',
    repo: 'axios/axios',
    license: 'MIT',
    url: 'https://github.com/axios/axios/blob/326843a3902d73c9f6af9bad7b55e2412566a251/lib/utils.js#L429-L435',
    code: `
function getGlobal() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  return {};
}
`.trim(),
  },
  {
    lang: 'Java',
    title: 'Strings.padStart',
    repo: 'google/guava',
    license: 'Apache-2.0',
    url: 'https://github.com/google/guava/blob/5e82f2f528fbbd970e00748025b48e3eb42ed702/guava/src/com/google/common/base/Strings.java#L93-L104',
    code: `
public static String padStart(String string, int minLength, char padChar) {
  checkNotNull(string);
  if (string.length() >= minLength) {
    return string;
  }
  StringBuilder sb = new StringBuilder(minLength);
  for (int i = string.length(); i < minLength; i++) {
    sb.append(padChar);
  }
  sb.append(string);
  return sb.toString();
}
`.trim(),
  },
  {
    lang: 'Java',
    title: 'Strings.commonPrefix',
    repo: 'google/guava',
    license: 'Apache-2.0',
    url: 'https://github.com/google/guava/blob/5e82f2f528fbbd970e00748025b48e3eb42ed702/guava/src/com/google/common/base/Strings.java#L184-L197',
    code: `
public static String commonPrefix(CharSequence a, CharSequence b) {
  checkNotNull(a);
  checkNotNull(b);

  int maxPrefixLength = min(a.length(), b.length());
  int p = 0;
  while (p < maxPrefixLength && a.charAt(p) == b.charAt(p)) {
    p++;
  }
  if (validSurrogatePairAt(a, p - 1) || validSurrogatePairAt(b, p - 1)) {
    p--;
  }
  return a.subSequence(0, p).toString();
}
`.trim(),
  },
  {
    lang: 'Java',
    title: 'Ints.saturatedCast',
    repo: 'google/guava',
    license: 'Apache-2.0',
    url: 'https://github.com/google/guava/blob/5e82f2f528fbbd970e00748025b48e3eb42ed702/guava/src/com/google/common/primitives/Ints.java#L109-L117',
    code: `
public static int saturatedCast(long value) {
  if (value > Integer.MAX_VALUE) {
    return Integer.MAX_VALUE;
  }
  if (value < Integer.MIN_VALUE) {
    return Integer.MIN_VALUE;
  }
  return (int) value;
}
`.trim(),
  },
  {
    lang: 'Java',
    title: 'Ints.reverse',
    repo: 'google/guava',
    license: 'Apache-2.0',
    url: 'https://github.com/google/guava/blob/5e82f2f528fbbd970e00748025b48e3eb42ed702/guava/src/com/google/common/primitives/Ints.java#L524-L532',
    code: `
public static void reverse(int[] array, int fromIndex, int toIndex) {
  checkNotNull(array);
  checkPositionIndexes(fromIndex, toIndex, array.length);
  for (int i = fromIndex, j = toIndex - 1; i < j; i++, j--) {
    int tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}
`.trim(),
  },
  {
    lang: 'Ruby',
    title: 'String#squish!',
    repo: 'rails/rails',
    license: 'MIT',
    url: 'https://github.com/rails/rails/blob/560b921a93aa1d4a19c8ee1bee6af6dfce1f374a/activesupport/lib/active_support/core_ext/string/filters.rb#L27-L33',
    code: `
def squish!
  gsub!(/([[:space:]]{2,}|[[[:space:]]&&[^ ]])/, " ")
  strip!
  self
end
`.trim(),
  },
  {
    lang: 'Ruby',
    title: 'String#truncate_words',
    repo: 'rails/rails',
    license: 'MIT',
    url: 'https://github.com/rails/rails/blob/560b921a93aa1d4a19c8ee1bee6af6dfce1f374a/activesupport/lib/active_support/core_ext/string/filters.rb#L174-L182',
    code: `
def truncate_words(words_count, options = {})
  sep = options[:separator] || /\\s+/
  sep = Regexp.escape(sep.to_s) unless Regexp === sep
  if self =~ /\\A((?>.+?#{sep}){#{words_count - 1}}.+?)#{sep}.*/m
    $1 + (options[:omission] || "...")
  else
    dup
  end
end
`.trim(),
  },
  {
    lang: 'Ruby',
    title: 'Inflector.demodulize',
    repo: 'rails/rails',
    license: 'MIT',
    url: 'https://github.com/rails/rails/blob/560b921a93aa1d4a19c8ee1bee6af6dfce1f374a/activesupport/lib/active_support/inflector/methods.rb#L272-L279',
    code: `
def demodulize(path)
  path = path.to_s
  if i = path.rindex("::")
    path[(i + 2), path.length]
  else
    path
  end
end
`.trim(),
  },
  {
    lang: 'Go',
    title: 'helpers.FirstUpper',
    repo: 'gohugoio/hugo',
    license: 'Apache-2.0',
    url: 'https://github.com/gohugoio/hugo/blob/85fb23f1c23a0acc9c9094dc033c19ec2c0d2a2b/helpers/general.go#L61-L67',
    code: `
func FirstUpper(s string) string {
	if s == "" {
		return ""
	}
	r, n := utf8.DecodeRuneInString(s)
	return string(unicode.ToUpper(r)) + s[n:]
}
`.trim(),
  },
  {
    lang: 'Go',
    title: 'compareStringSlices',
    repo: 'gohugoio/hugo',
    license: 'Apache-2.0',
    url: 'https://github.com/gohugoio/hugo/blob/85fb23f1c23a0acc9c9094dc033c19ec2c0d2a2b/helpers/general.go#L120-L130',
    code: `
func compareStringSlices(a, b []string) bool {
	if a == nil && b == nil {
		return true
	}

	if a == nil || b == nil {
		return false
	}

	return slices.Equal(a, b)
}
`.trim(),
  },
  {
    lang: 'Rust',
    title: 'globset::normalize_path',
    repo: 'BurntSushi/ripgrep',
    license: 'MIT OR Unlicense',
    url: 'https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/globset/src/pathutil.rs#L67-L77',
    code: `
pub(crate) fn normalize_path(mut path: Cow<[u8]>) -> Cow<[u8]> {
    use std::path::is_separator;

    for i in 0..path.len() {
        if path[i] == b'/' || !is_separator(char::from(path[i])) {
            continue;
        }
        path.to_mut()[i] = b'/';
    }
    path
}
`.trim(),
  },
  {
    lang: 'Rust',
    title: 'ignore::is_hidden_path_only',
    repo: 'BurntSushi/ripgrep',
    license: 'MIT OR Unlicense',
    url: 'https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/ignore/src/pathutil.rs#L85-L91',
    code: `
fn is_hidden_path_only(path: &Path) -> bool {
    if let Some(name) = file_name(path) {
        name.as_encoded_bytes().starts_with(b".")
    } else {
        false
    }
}
`.trim(),
  },
  {
    lang: 'Rust',
    title: 'Hasher::write',
    repo: 'BurntSushi/ripgrep',
    license: 'MIT OR Unlicense',
    url: 'https://github.com/BurntSushi/ripgrep/blob/3fce3b5bb0236da2df6d99672afb8a719642eca7/crates/globset/src/fnv.rs#L24-L29',
    code: `
fn write(&mut self, bytes: &[u8]) {
    for &byte in bytes.iter() {
        self.0 = self.0 ^ u64::from(byte);
        self.0 = self.0.wrapping_mul(Hasher::PRIME);
    }
}
`.trim(),
  },
  {
    lang: 'Swift',
    title: 'HTTPHeaders.update',
    repo: 'Alamofire/Alamofire',
    license: 'MIT',
    url: 'https://github.com/Alamofire/Alamofire/blob/bda9ed57d72988a3a2ada33d824583541f86eac6/Source/Core/HTTPHeaders.swift#L74-L81',
    code: `
public mutating func update(_ header: HTTPHeader) {
    guard let index = headers.index(of: header.name) else {
        headers.append(header)
        return
    }

    headers.replaceSubrange(index...index, with: [header])
}
`.trim(),
  },
  {
    lang: 'Swift',
    title: 'HTTPHeader.authorization',
    repo: 'Alamofire/Alamofire',
    license: 'MIT',
    url: 'https://github.com/Alamofire/Alamofire/blob/bda9ed57d72988a3a2ada33d824583541f86eac6/Source/Core/HTTPHeaders.swift#L260-L264',
    code: `
public static func authorization(username: String, password: String) -> HTTPHeader {
    let credential = Data("\\(username):\\(password)".utf8).base64EncodedString()

    return authorization("Basic \\(credential)")
}
`.trim(),
  },
  {
    lang: 'Swift',
    title: 'qualityEncoded',
    repo: 'Alamofire/Alamofire',
    license: 'MIT',
    url: 'https://github.com/Alamofire/Alamofire/blob/bda9ed57d72988a3a2ada33d824583541f86eac6/Source/Core/HTTPHeaders.swift#L436-L441',
    code: `
func qualityEncoded() -> String {
    enumerated().map { index, encoding in
        let quality = 1.0 - (Double(index) * 0.1)
        return "\\(encoding);q=\\(quality)"
    }.joined(separator: ", ")
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'strings.isFalsyOrWhitespace',
    repo: 'microsoft/vscode',
    license: 'MIT',
    url: 'https://github.com/microsoft/vscode/blob/1e81fc75bb564738c29771d9b17c72e708a8211c/src/vs/base/common/strings.ts#L11-L16',
    code: `
export function isFalsyOrWhitespace(str: string | undefined): boolean {
	if (!str || typeof str !== 'string') {
		return true;
	}
	return str.trim().length === 0;
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'strings.count',
    repo: 'microsoft/vscode',
    license: 'MIT',
    url: 'https://github.com/microsoft/vscode/blob/1e81fc75bb564738c29771d9b17c72e708a8211c/src/vs/base/common/strings.ts#L96-L104',
    code: `
export function count(value: string, substr: string): number {
	let result = 0;
	let index = value.indexOf(substr);
	while (index !== -1) {
		result++;
		index = value.indexOf(substr, index + substr.length);
	}
	return result;
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'strings.firstNonWhitespaceIndex',
    repo: 'microsoft/vscode',
    license: 'MIT',
    url: 'https://github.com/microsoft/vscode/blob/1e81fc75bb564738c29771d9b17c72e708a8211c/src/vs/base/common/strings.ts#L284-L292',
    code: `
export function firstNonWhitespaceIndex(str: string): number {
	for (let i = 0, len = str.length; i < len; i++) {
		const chCode = str.charCodeAt(i);
		if (chCode !== CharCode.Space && chCode !== CharCode.Tab) {
			return i;
		}
	}
	return -1;
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'strings.compare',
    repo: 'microsoft/vscode',
    license: 'MIT',
    url: 'https://github.com/microsoft/vscode/blob/1e81fc75bb564738c29771d9b17c72e708a8211c/src/vs/base/common/strings.ts#L351-L359',
    code: `
export function compare(a: string, b: string): number {
	if (a < b) {
		return -1;
	} else if (a > b) {
		return 1;
	} else {
		return 0;
	}
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'joinUrlSegments',
    repo: 'vitejs/vite',
    license: 'MIT',
    url: 'https://github.com/vitejs/vite/blob/df7503cc499e0b49e45701e3be7546918ee9d322/packages/vite/src/node/utils.ts#L1743-L1754',
    code: `
export function joinUrlSegments(a: string, b: string): string {
  if (!a || !b) {
    return a || b || ''
  }
  if (a.endsWith('/')) {
    a = a.substring(0, a.length - 1)
  }
  if (b[0] !== '/') {
    b = '/' + b
  }
  return a + b
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'stripBase',
    repo: 'vitejs/vite',
    license: 'MIT',
    url: 'https://github.com/vitejs/vite/blob/df7503cc499e0b49e45701e3be7546918ee9d322/packages/vite/src/node/utils.ts#L1760-L1766',
    code: `
export function stripBase(path: string, base: string): string {
  if (path === base) {
    return '/'
  }
  const devBase = withTrailingSlash(base)
  return path.startsWith(devBase) ? path.slice(devBase.length - 1) : path
}
`.trim(),
  },
  {
    lang: 'TypeScript',
    title: 'arrayEqual',
    repo: 'vitejs/vite',
    license: 'MIT',
    url: 'https://github.com/vitejs/vite/blob/df7503cc499e0b49e45701e3be7546918ee9d322/packages/vite/src/node/utils.ts#L1768-L1775',
    code: `
export function arrayEqual(a: any[], b: any[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
`.trim(),
  },
  {
    lang: 'PHP',
    title: 'Str::before',
    repo: 'laravel/framework',
    license: 'MIT',
    url: 'https://github.com/laravel/framework/blob/e51b5fe16d6f0e547137087e52c6106118c319f1/src/Illuminate/Support/Str.php#L167-L176',
    code: `
public static function before($subject, $search)
{
    if ($search === '') {
        return $subject;
    }

    $result = strstr($subject, (string) $search, true);

    return $result === false ? $subject : $result;
}
`.trim(),
  },
  {
    lang: 'PHP',
    title: 'Str::chopStart',
    repo: 'laravel/framework',
    license: 'MIT',
    url: 'https://github.com/laravel/framework/blob/e51b5fe16d6f0e547137087e52c6106118c319f1/src/Illuminate/Support/Str.php#L270-L279',
    code: `
public static function chopStart($subject, $needle)
{
    foreach ((array) $needle as $n) {
        if ($n !== '' && str_starts_with($subject, $n)) {
            return mb_substr($subject, mb_strlen($n));
        }
    }

    return $subject;
}
`.trim(),
  },
];
