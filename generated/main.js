(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

console.warn('Compiled in DEV mode. Follow the advice at https://elm-lang.org/0.19.1/optimize for better performance and smaller assets.');


// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**_UNUSED/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**_UNUSED/
	if (typeof x.$ === 'undefined')
	//*/
	/**/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0_UNUSED = 0;
var _Utils_Tuple0 = { $: '#0' };

function _Utils_Tuple2_UNUSED(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3_UNUSED(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr_UNUSED(c) { return c; }
function _Utils_chr(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil_UNUSED = { $: 0 };
var _List_Nil = { $: '[]' };

function _List_Cons_UNUSED(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log_UNUSED = F2(function(tag, value)
{
	return value;
});

var _Debug_log = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString_UNUSED(value)
{
	return '<internals>';
}

function _Debug_toString(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash_UNUSED(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.start.line === region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'on lines ' + region.start.line + ' through ' + region.end.line;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap(value) { return { $: 0, a: value }; }
function _Json_unwrap(value) { return value.a; }

function _Json_wrap_UNUSED(value) { return value; }
function _Json_unwrap_UNUSED(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	object[key] = _Json_unwrap(value);
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**_UNUSED/
	var node = args['node'];
	//*/
	/**/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS


function _VirtualDom_noScript(tag)
{
	return tag == 'script' ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return /^(on|formAction$)/i.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri_UNUSED(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,'')) ? '' : value;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return /^javascript:/i.test(value.replace(/\s/g,''))
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri_UNUSED(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value) ? '' : value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return /^\s*(javascript:|data:text\/html)/i.test(value)
		? 'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'
		: value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		message: func(record.message),
		stopPropagation: record.stopPropagation,
		preventDefault: record.preventDefault
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.message;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.stopPropagation;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.preventDefault) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var view = impl.view;
			/**_UNUSED/
			var domNode = args['node'];
			//*/
			/**/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.init,
		impl.update,
		impl.subscriptions,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.setup && impl.setup(sendToApp)
			var view = impl.view;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.body);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.title) && (_VirtualDom_doc.title = title = doc.title);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.onUrlChange;
	var onUrlRequest = impl.onUrlRequest;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		setup: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.protocol === next.protocol
							&& curr.host === next.host
							&& curr.port_.a === next.port_.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		init: function(flags)
		{
			return A3(impl.init, flags, _Browser_getUrl(), key);
		},
		view: impl.view,
		update: impl.update,
		subscriptions: impl.subscriptions
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { hidden: 'hidden', change: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { hidden: 'mozHidden', change: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { hidden: 'msHidden', change: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { hidden: 'webkitHidden', change: 'webkitvisibilitychange' }
		: { hidden: 'hidden', change: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		scene: _Browser_getScene(),
		viewport: {
			x: _Browser_window.pageXOffset,
			y: _Browser_window.pageYOffset,
			width: _Browser_doc.documentElement.clientWidth,
			height: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		width: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		height: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			scene: {
				width: node.scrollWidth,
				height: node.scrollHeight
			},
			viewport: {
				x: node.scrollLeft,
				y: node.scrollTop,
				width: node.clientWidth,
				height: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			scene: _Browser_getScene(),
			viewport: {
				x: x,
				y: y,
				width: _Browser_doc.documentElement.clientWidth,
				height: _Browser_doc.documentElement.clientHeight
			},
			element: {
				x: x + rect.left,
				y: y + rect.top,
				width: rect.width,
				height: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}
var $author$project$Main$LinkClicked = function (a) {
	return {$: 'LinkClicked', a: a};
};
var $author$project$Main$UrlChanged = function (a) {
	return {$: 'UrlChanged', a: a};
};
var $elm$core$Basics$EQ = {$: 'EQ'};
var $elm$core$Basics$GT = {$: 'GT'};
var $elm$core$Basics$LT = {$: 'LT'};
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0.a;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 'Err', a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 'Failure', a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 'Field', a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 'Index', a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 'Ok', a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 'OneOf', a: a};
};
var $elm$core$Basics$False = {$: 'False'};
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 'Just', a: a};
};
var $elm$core$Maybe$Nothing = {$: 'Nothing'};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\n    ',
		A2($elm$core$String$split, '\n', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\n\n(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 'Field':
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 'Nothing') {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\'' + (f + '\']'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'Index':
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 'OneOf':
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\n\n',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\n\n';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\n\n    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\n\n' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 'Leaf', a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 'SubTree', a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.nodeListSize) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.tail);
		} else {
			var treeLen = builder.nodeListSize * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.nodeList) : builder.nodeList;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.nodeListSize);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.tail) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.tail);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{nodeList: nodeList, nodeListSize: (len / $elm$core$Array$branchFactor) | 0, tail: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = {$: 'True'};
var $elm$core$Result$isOk = function (result) {
	if (result.$ === 'Ok') {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 'Normal':
			return 0;
		case 'MayStopPropagation':
			return 1;
		case 'MayPreventDefault':
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 'External', a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 'Internal', a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = function (a) {
	return {$: 'NotFound', a: a};
};
var $elm$url$Url$Http = {$: 'Http'};
var $elm$url$Url$Https = {$: 'Https'};
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {fragment: fragment, host: host, path: path, port_: port_, protocol: protocol, query: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 'Nothing') {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Http,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		$elm$url$Url$Https,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0.a;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = function (a) {
	return {$: 'Perform', a: a};
};
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(_Utils_Tuple0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0.a;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return _Utils_Tuple0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(_Utils_Tuple0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0.a;
		return $elm$core$Task$Perform(
			A2($elm$core$Task$map, tagger, task));
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			$elm$core$Task$Perform(
				A2($elm$core$Task$map, toMessage, task)));
	});
var $elm$browser$Browser$application = _Browser_application;
var $author$project$Main$Model = function (key) {
	return function (url) {
		return function (status) {
			return function (gameId) {
				return function (amAdministrator) {
					return function (lastUpdate) {
						return function (players) {
							return function (myId) {
								return function (uuid) {
									return function (previousPackage) {
										return function (workloads) {
											return function (currentWorkload) {
												return function (playerCapture) {
													return function (gameKey) {
														return function (funnelState) {
															return function (formFields) {
																return function (pendingDialogs) {
																	return function (nextDialogId) {
																		return function (error) {
																			return {amAdministrator: amAdministrator, currentWorkload: currentWorkload, error: error, formFields: formFields, funnelState: funnelState, gameId: gameId, gameKey: gameKey, key: key, lastUpdate: lastUpdate, myId: myId, nextDialogId: nextDialogId, pendingDialogs: pendingDialogs, playerCapture: playerCapture, players: players, previousPackage: previousPackage, status: status, url: url, uuid: uuid, workloads: workloads};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Protocol$NoGame = {$: 'NoGame'};
var $author$project$Main$SetField = F2(
	function (a, b) {
		return {$: 'SetField', a: a, b: b};
	});
var $author$project$Main$Tick = function (a) {
	return {$: 'Tick', a: a};
};
var $author$project$Main$UsernamePlaceholder = {$: 'UsernamePlaceholder'};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Dict$RBEmpty_elm_builtin = {$: 'RBEmpty_elm_builtin'};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$random$Random$Generate = function (a) {
	return {$: 'Generate', a: a};
};
var $elm$random$Random$Seed = F2(
	function (a, b) {
		return {$: 'Seed', a: a, b: b};
	});
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$random$Random$next = function (_v0) {
	var state0 = _v0.a;
	var incr = _v0.b;
	return A2($elm$random$Random$Seed, ((state0 * 1664525) + incr) >>> 0, incr);
};
var $elm$random$Random$initialSeed = function (x) {
	var _v0 = $elm$random$Random$next(
		A2($elm$random$Random$Seed, 0, 1013904223));
	var state1 = _v0.a;
	var incr = _v0.b;
	var state2 = (state1 + x) >>> 0;
	return $elm$random$Random$next(
		A2($elm$random$Random$Seed, state2, incr));
};
var $elm$time$Time$Name = function (a) {
	return {$: 'Name', a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 'Offset', a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 'Zone', a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$Posix = function (a) {
	return {$: 'Posix', a: a};
};
var $elm$time$Time$millisToPosix = $elm$time$Time$Posix;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0.a;
	return millis;
};
var $elm$random$Random$init = A2(
	$elm$core$Task$andThen,
	function (time) {
		return $elm$core$Task$succeed(
			$elm$random$Random$initialSeed(
				$elm$time$Time$posixToMillis(time)));
	},
	$elm$time$Time$now);
var $elm$random$Random$step = F2(
	function (_v0, seed) {
		var generator = _v0.a;
		return generator(seed);
	});
var $elm$random$Random$onEffects = F3(
	function (router, commands, seed) {
		if (!commands.b) {
			return $elm$core$Task$succeed(seed);
		} else {
			var generator = commands.a.a;
			var rest = commands.b;
			var _v1 = A2($elm$random$Random$step, generator, seed);
			var value = _v1.a;
			var newSeed = _v1.b;
			return A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$random$Random$onEffects, router, rest, newSeed);
				},
				A2($elm$core$Platform$sendToApp, router, value));
		}
	});
var $elm$random$Random$onSelfMsg = F3(
	function (_v0, _v1, seed) {
		return $elm$core$Task$succeed(seed);
	});
var $elm$random$Random$Generator = function (a) {
	return {$: 'Generator', a: a};
};
var $elm$random$Random$map = F2(
	function (func, _v0) {
		var genA = _v0.a;
		return $elm$random$Random$Generator(
			function (seed0) {
				var _v1 = genA(seed0);
				var a = _v1.a;
				var seed1 = _v1.b;
				return _Utils_Tuple2(
					func(a),
					seed1);
			});
	});
var $elm$random$Random$cmdMap = F2(
	function (func, _v0) {
		var generator = _v0.a;
		return $elm$random$Random$Generate(
			A2($elm$random$Random$map, func, generator));
	});
_Platform_effectManagers['Random'] = _Platform_createManager($elm$random$Random$init, $elm$random$Random$onEffects, $elm$random$Random$onSelfMsg, $elm$random$Random$cmdMap);
var $elm$random$Random$command = _Platform_leaf('Random');
var $elm$random$Random$generate = F2(
	function (tagger, generator) {
		return $elm$random$Random$command(
			$elm$random$Random$Generate(
				A2($elm$random$Random$map, tagger, generator)));
	});
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (_v0.$ === 'SubTree') {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$core$Bitwise$xor = _Bitwise_xor;
var $elm$random$Random$peel = function (_v0) {
	var state = _v0.a;
	var word = (state ^ (state >>> ((state >>> 28) + 4))) * 277803737;
	return ((word >>> 22) ^ word) >>> 0;
};
var $elm$random$Random$int = F2(
	function (a, b) {
		return $elm$random$Random$Generator(
			function (seed0) {
				var _v0 = (_Utils_cmp(a, b) < 0) ? _Utils_Tuple2(a, b) : _Utils_Tuple2(b, a);
				var lo = _v0.a;
				var hi = _v0.b;
				var range = (hi - lo) + 1;
				if (!((range - 1) & range)) {
					return _Utils_Tuple2(
						(((range - 1) & $elm$random$Random$peel(seed0)) >>> 0) + lo,
						$elm$random$Random$next(seed0));
				} else {
					var threshhold = (((-range) >>> 0) % range) >>> 0;
					var accountForBias = function (seed) {
						accountForBias:
						while (true) {
							var x = $elm$random$Random$peel(seed);
							var seedN = $elm$random$Random$next(seed);
							if (_Utils_cmp(x, threshhold) < 0) {
								var $temp$seed = seedN;
								seed = $temp$seed;
								continue accountForBias;
							} else {
								return _Utils_Tuple2((x % range) + lo, seedN);
							}
						}
					};
					return accountForBias(seed0);
				}
			});
	});
var $elm$core$Array$length = function (_v0) {
	var len = _v0.a;
	return len;
};
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{nodeList: nodeList, nodeListSize: nodeListSize, tail: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $author$project$Names$names = $elm$core$Array$fromList(
	_List_fromArray(
		['Mary', 'John', 'Aliakmonas', 'Alkistis', 'alej', 'virr', 'dojo', 'doggo', 'hojo', 'baktu', 'James', 'Jamie', 'Alex', 'Antidisestablishmentarianism', 'Llanfair­pwllgwyngyll­gogery­chwyrn­drobwll­llan­tysilio­gogo­goch', 'L', 'Professor', 'admin', 'user', 'Nameless', 'Horan', 'Dolores', 'root', 'Picasso', 'Caesar', 'Gleich', 'Mash']));
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Names$generator = A2(
	$elm$random$Random$map,
	function (n) {
		return A2(
			$elm$core$Maybe$withDefault,
			'Null',
			A2($elm$core$Array$get, n, $author$project$Names$names));
	},
	A2(
		$elm$random$Random$int,
		0,
		$elm$core$Array$length($author$project$Names$names) - 1));
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$Get = F2(
	function (a, b) {
		return {$: 'Get', a: a, b: b};
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$get = $billstclair$elm_localstorage$PortFunnel$InternalTypes$Get($elm$core$Maybe$Nothing);
var $author$project$Main$Receive = function (a) {
	return {$: 'Receive', a: a};
};
var $author$project$PortFunnels$cmdPort = _Platform_outgoingPort('cmdPort', $elm$core$Basics$identity);
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1.$) {
					case 'LT':
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 'EQ':
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Basics$not = _Basics_not;
var $elm$core$Dict$Black = {$: 'Black'};
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: 'RBNode_elm_builtin', a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = {$: 'Red'};
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Red')) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) && (left.d.$ === 'RBNode_elm_builtin')) && (left.d.a.$ === 'Red')) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Red,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1.$) {
				case 'LT':
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 'EQ':
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$fromList = function (assocs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, dict) {
				var key = _v0.a;
				var value = _v0.b;
				return A3($elm$core$Dict$insert, key, value, dict);
			}),
		$elm$core$Dict$empty,
		assocs);
};
var $author$project$PortFunnels$simulatedPortDict = $elm$core$Dict$fromList(_List_Nil);
var $author$project$PortFunnels$getCmdPort = F3(
	function (tagger, moduleName, useSimulator) {
		if (!useSimulator) {
			return $author$project$PortFunnels$cmdPort;
		} else {
			var _v0 = A2($elm$core$Dict$get, moduleName, $author$project$PortFunnels$simulatedPortDict);
			if (_v0.$ === 'Just') {
				var makeSimulatedCmdPort = _v0.a;
				return makeSimulatedCmdPort(tagger);
			} else {
				return $author$project$PortFunnels$cmdPort;
			}
		}
	});
var $author$project$Main$cmdPort = A3($author$project$PortFunnels$getCmdPort, $author$project$Main$Receive, '', false);
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$Clear = function (a) {
	return {$: 'Clear', a: a};
};
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$ListKeys = F2(
	function (a, b) {
		return {$: 'ListKeys', a: a, b: b};
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$Put = F2(
	function (a, b) {
		return {$: 'Put', a: a, b: b};
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$addPrefix = F2(
	function (prefix, key) {
		return (prefix === '') ? key : (prefix + ('.' + key));
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$Got = F3(
	function (a, b, c) {
		return {$: 'Got', a: a, b: b, c: c};
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$Keys = F3(
	function (a, b, c) {
		return {$: 'Keys', a: a, b: b, c: c};
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulateClear = function (a) {
	return {$: 'SimulateClear', a: a};
};
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulateGet = F2(
	function (a, b) {
		return {$: 'SimulateGet', a: a, b: b};
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulateListKeys = F2(
	function (a, b) {
		return {$: 'SimulateListKeys', a: a, b: b};
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulatePut = F2(
	function (a, b) {
		return {$: 'SimulatePut', a: a, b: b};
	});
var $billstclair$elm_localstorage$PortFunnel$InternalTypes$Startup = {$: 'Startup'};
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$GotRecord = F3(
	function (label, key, value) {
		return {key: key, label: label, value: value};
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$map3 = _Json_map3;
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $elm$json$Json$Decode$string = _Json_decodeString;
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$gotDecoder = A4(
	$elm$json$Json$Decode$map3,
	$billstclair$elm_localstorage$PortFunnel$LocalStorage$GotRecord,
	A2(
		$elm$json$Json$Decode$field,
		'label',
		$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
	A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$value));
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$KeysRecord = F3(
	function (label, prefix, keys) {
		return {keys: keys, label: label, prefix: prefix};
	});
var $elm$json$Json$Decode$list = _Json_decodeList;
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$keysDecoder = A4(
	$elm$json$Json$Decode$map3,
	$billstclair$elm_localstorage$PortFunnel$LocalStorage$KeysRecord,
	A2(
		$elm$json$Json$Decode$field,
		'label',
		$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
	A2($elm$json$Json$Decode$field, 'prefix', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$field,
		'keys',
		$elm$json$Json$Decode$list($elm$json$Json$Decode$string)));
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$labeledStringDecoder = function (property) {
	return A3(
		$elm$json$Json$Decode$map2,
		$elm$core$Tuple$pair,
		A2(
			$elm$json$Json$Decode$field,
			'label',
			$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
		A2($elm$json$Json$Decode$field, property, $elm$json$Json$Decode$string));
};
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$PutRecord = F2(
	function (key, value) {
		return {key: key, value: value};
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$putDecoder = A3(
	$elm$json$Json$Decode$map2,
	$billstclair$elm_localstorage$PortFunnel$LocalStorage$PutRecord,
	A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'value', $elm$json$Json$Decode$value));
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$NOTAG = {$: 'NOTAG'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$ClearTag = {$: 'ClearTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$GetTag = {$: 'GetTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$GotTag = {$: 'GotTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$KeysTag = {$: 'KeysTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$ListKeysTag = {$: 'ListKeysTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$PutTag = {$: 'PutTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulateClearTag = {$: 'SimulateClearTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulateGetTag = {$: 'SimulateGetTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulateListKeysTag = {$: 'SimulateListKeysTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulatePutTag = {$: 'SimulatePutTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$StartupTag = {$: 'StartupTag'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$clearTag = 'clear';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$getTag = 'get';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$gotTag = 'got';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$keysTag = 'keys';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$listKeysTag = 'listkeys';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$putTag = 'put';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateClearTag = 'simulateclear';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateGetTag = 'simulateget';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateListKeysTag = 'simulatelistkeys';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$simulatePutTag = 'simulateput';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$startupTag = 'startup';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$tagDict = $elm$core$Dict$fromList(
	_List_fromArray(
		[
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$startupTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$StartupTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$getTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$GetTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$gotTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$GotTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$putTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$PutTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$listKeysTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$ListKeysTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$keysTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$KeysTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$clearTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$ClearTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateGetTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulateGetTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$simulatePutTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulatePutTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateListKeysTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulateListKeysTag),
			_Utils_Tuple2($billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateClearTag, $billstclair$elm_localstorage$PortFunnel$LocalStorage$SimulateClearTag)
		]));
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$strtag = function (str) {
	var _v0 = A2($elm$core$Dict$get, str, $billstclair$elm_localstorage$PortFunnel$LocalStorage$tagDict);
	if (_v0.$ === 'Just') {
		var tag = _v0.a;
		return tag;
	} else {
		return $billstclair$elm_localstorage$PortFunnel$LocalStorage$NOTAG;
	}
};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$decode = function (_v0) {
	var tag = _v0.tag;
	var args = _v0.args;
	var _v1 = $billstclair$elm_localstorage$PortFunnel$LocalStorage$strtag(tag);
	switch (_v1.$) {
		case 'GetTag':
			var _v2 = A2(
				$elm$json$Json$Decode$decodeValue,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$labeledStringDecoder('key'),
				args);
			if (_v2.$ === 'Ok') {
				var _v3 = _v2.a;
				var label = _v3.a;
				var key = _v3.b;
				return $elm$core$Result$Ok(
					A2($billstclair$elm_localstorage$PortFunnel$InternalTypes$Get, label, key));
			} else {
				return $elm$core$Result$Err(
					'Get key not a string: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'GotTag':
			var _v4 = A2($elm$json$Json$Decode$decodeValue, $billstclair$elm_localstorage$PortFunnel$LocalStorage$gotDecoder, args);
			if (_v4.$ === 'Ok') {
				var label = _v4.a.label;
				var key = _v4.a.key;
				var value = _v4.a.value;
				return $elm$core$Result$Ok(
					A3(
						$billstclair$elm_localstorage$PortFunnel$InternalTypes$Got,
						label,
						key,
						_Utils_eq(value, $elm$json$Json$Encode$null) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(value)));
			} else {
				return $elm$core$Result$Err(
					'Got not { label, key, value }: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'PutTag':
			var _v5 = A2($elm$json$Json$Decode$decodeValue, $billstclair$elm_localstorage$PortFunnel$LocalStorage$putDecoder, args);
			if (_v5.$ === 'Ok') {
				var key = _v5.a.key;
				var value = _v5.a.value;
				return $elm$core$Result$Ok(
					A2(
						$billstclair$elm_localstorage$PortFunnel$InternalTypes$Put,
						key,
						_Utils_eq(value, $elm$json$Json$Encode$null) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(value)));
			} else {
				return $elm$core$Result$Err(
					'Put not { key, value }: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'ListKeysTag':
			var _v6 = A2(
				$elm$json$Json$Decode$decodeValue,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$labeledStringDecoder('prefix'),
				args);
			if (_v6.$ === 'Ok') {
				var _v7 = _v6.a;
				var label = _v7.a;
				var prefix = _v7.b;
				return $elm$core$Result$Ok(
					A2($billstclair$elm_localstorage$PortFunnel$InternalTypes$ListKeys, label, prefix));
			} else {
				return $elm$core$Result$Err(
					'ListKeys prefix not a string: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'KeysTag':
			var _v8 = A2($elm$json$Json$Decode$decodeValue, $billstclair$elm_localstorage$PortFunnel$LocalStorage$keysDecoder, args);
			if (_v8.$ === 'Ok') {
				var label = _v8.a.label;
				var prefix = _v8.a.prefix;
				var keys = _v8.a.keys;
				return $elm$core$Result$Ok(
					A3($billstclair$elm_localstorage$PortFunnel$InternalTypes$Keys, label, prefix, keys));
			} else {
				return $elm$core$Result$Err(
					'Keys not { prefix, keys }: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'ClearTag':
			var _v9 = A2($elm$json$Json$Decode$decodeValue, $elm$json$Json$Decode$string, args);
			if (_v9.$ === 'Ok') {
				var prefix = _v9.a;
				return $elm$core$Result$Ok(
					$billstclair$elm_localstorage$PortFunnel$InternalTypes$Clear(prefix));
			} else {
				return $elm$core$Result$Err(
					'Clear prefix not a string: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'StartupTag':
			return $elm$core$Result$Ok($billstclair$elm_localstorage$PortFunnel$InternalTypes$Startup);
		case 'SimulateGetTag':
			var _v10 = A2(
				$elm$json$Json$Decode$decodeValue,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$labeledStringDecoder('key'),
				args);
			if (_v10.$ === 'Ok') {
				var _v11 = _v10.a;
				var label = _v11.a;
				var key = _v11.b;
				return $elm$core$Result$Ok(
					A2($billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulateGet, label, key));
			} else {
				return $elm$core$Result$Err(
					'Get key not a string: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'SimulatePutTag':
			var _v12 = A2($elm$json$Json$Decode$decodeValue, $billstclair$elm_localstorage$PortFunnel$LocalStorage$putDecoder, args);
			if (_v12.$ === 'Ok') {
				var key = _v12.a.key;
				var value = _v12.a.value;
				return $elm$core$Result$Ok(
					A2(
						$billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulatePut,
						key,
						_Utils_eq(value, $elm$json$Json$Encode$null) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(value)));
			} else {
				return $elm$core$Result$Err(
					'SimulatePut not { key, value }: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'SimulateListKeysTag':
			var _v13 = A2(
				$elm$json$Json$Decode$decodeValue,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$labeledStringDecoder('prefix'),
				args);
			if (_v13.$ === 'Ok') {
				var _v14 = _v13.a;
				var label = _v14.a;
				var prefix = _v14.b;
				return $elm$core$Result$Ok(
					A2($billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulateListKeys, label, prefix));
			} else {
				return $elm$core$Result$Err(
					'SimulateListKeys prefix not a string: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		case 'SimulateClearTag':
			var _v15 = A2($elm$json$Json$Decode$decodeValue, $elm$json$Json$Decode$string, args);
			if (_v15.$ === 'Ok') {
				var prefix = _v15.a;
				return $elm$core$Result$Ok(
					$billstclair$elm_localstorage$PortFunnel$InternalTypes$SimulateClear(prefix));
			} else {
				return $elm$core$Result$Err(
					'SimulateClear prefix not a string: ' + A2($elm$json$Json$Encode$encode, 0, args));
			}
		default:
			return $elm$core$Result$Err('Unknown tag: ' + tag);
	}
};
var $billstclair$elm_port_funnel$PortFunnel$GenericMessage = F3(
	function (moduleName, tag, args) {
		return {args: args, moduleName: moduleName, tag: tag};
	});
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(_Utils_Tuple0),
			pairs));
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$encodeLabeledString = F3(
	function (label, string, property) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'label',
					function () {
						if (label.$ === 'Just') {
							var lab = label.a;
							return $elm$json$Json$Encode$string(lab);
						} else {
							return $elm$json$Json$Encode$null;
						}
					}()),
					_Utils_Tuple2(
					property,
					$elm$json$Json$Encode$string(string))
				]));
	});
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(_Utils_Tuple0),
				entries));
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName = 'LocalStorage';
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$encode = function (message) {
	switch (message.$) {
		case 'Startup':
			return A3($billstclair$elm_port_funnel$PortFunnel$GenericMessage, $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName, $billstclair$elm_localstorage$PortFunnel$LocalStorage$startupTag, $elm$json$Json$Encode$null);
		case 'Get':
			var label = message.a;
			var key = message.b;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$getTag,
				A3($billstclair$elm_localstorage$PortFunnel$LocalStorage$encodeLabeledString, label, key, 'key'));
		case 'Got':
			var label = message.a;
			var key = message.b;
			var value = message.c;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$gotTag,
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'label',
							function () {
								if (label.$ === 'Just') {
									var lab = label.a;
									return $elm$json$Json$Encode$string(lab);
								} else {
									return $elm$json$Json$Encode$null;
								}
							}()),
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'value',
							function () {
								if (value.$ === 'Nothing') {
									return $elm$json$Json$Encode$null;
								} else {
									var v = value.a;
									return v;
								}
							}())
						])));
		case 'Put':
			var key = message.a;
			var value = message.b;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$putTag,
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'value',
							function () {
								if (value.$ === 'Nothing') {
									return $elm$json$Json$Encode$null;
								} else {
									var v = value.a;
									return v;
								}
							}())
						])));
		case 'ListKeys':
			var label = message.a;
			var prefix = message.b;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$listKeysTag,
				A3($billstclair$elm_localstorage$PortFunnel$LocalStorage$encodeLabeledString, label, prefix, 'prefix'));
		case 'Keys':
			var label = message.a;
			var prefix = message.b;
			var keys = message.c;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$keysTag,
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'label',
							function () {
								if (label.$ === 'Just') {
									var lab = label.a;
									return $elm$json$Json$Encode$string(lab);
								} else {
									return $elm$json$Json$Encode$null;
								}
							}()),
							_Utils_Tuple2(
							'prefix',
							$elm$json$Json$Encode$string(prefix)),
							_Utils_Tuple2(
							'keys',
							A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, keys))
						])));
		case 'Clear':
			var prefix = message.a;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$clearTag,
				$elm$json$Json$Encode$string(prefix));
		case 'SimulateGet':
			var label = message.a;
			var key = message.b;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateGetTag,
				A3($billstclair$elm_localstorage$PortFunnel$LocalStorage$encodeLabeledString, label, key, 'key'));
		case 'SimulatePut':
			var key = message.a;
			var value = message.b;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$simulatePutTag,
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'value',
							function () {
								if (value.$ === 'Nothing') {
									return $elm$json$Json$Encode$null;
								} else {
									var v = value.a;
									return v;
								}
							}())
						])));
		case 'SimulateListKeys':
			var label = message.a;
			var prefix = message.b;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateListKeysTag,
				A3($billstclair$elm_localstorage$PortFunnel$LocalStorage$encodeLabeledString, label, prefix, 'prefix'));
		default:
			var prefix = message.a;
			return A3(
				$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$simulateClearTag,
				$elm$json$Json$Encode$string(prefix));
	}
};
var $billstclair$elm_port_funnel$PortFunnel$ModuleDesc = function (a) {
	return {$: 'ModuleDesc', a: a};
};
var $billstclair$elm_port_funnel$PortFunnel$ModuleDescRecord = F4(
	function (moduleName, encoder, decoder, process) {
		return {decoder: decoder, encoder: encoder, moduleName: moduleName, process: process};
	});
var $billstclair$elm_port_funnel$PortFunnel$makeModuleDesc = F4(
	function (name, encoder, decoder, processor) {
		return $billstclair$elm_port_funnel$PortFunnel$ModuleDesc(
			A4($billstclair$elm_port_funnel$PortFunnel$ModuleDescRecord, name, encoder, decoder, processor));
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$GetResponse = function (a) {
	return {$: 'GetResponse', a: a};
};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$ListKeysResponse = function (a) {
	return {$: 'ListKeysResponse', a: a};
};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$NoResponse = {$: 'NoResponse'};
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$State = function (a) {
	return {$: 'State', a: a};
};
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.e.d.$ === 'RBNode_elm_builtin') && (dict.e.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) && (dict.e.$ === 'RBNode_elm_builtin')) {
		if ((dict.d.d.$ === 'RBNode_elm_builtin') && (dict.d.d.a.$ === 'Red')) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				$elm$core$Dict$Red,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr.$ === 'Black') {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					$elm$core$Dict$Black,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Red')) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Red, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === 'RBNode_elm_builtin') && (right.a.$ === 'Black')) {
					if (right.d.$ === 'RBNode_elm_builtin') {
						if (right.d.a.$ === 'Black') {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === 'RBNode_elm_builtin') && (dict.d.$ === 'RBNode_elm_builtin')) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor.$ === 'Black') {
			if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === 'RBNode_elm_builtin') {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBEmpty_elm_builtin') {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === 'RBNode_elm_builtin') && (left.a.$ === 'Black')) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === 'RBNode_elm_builtin') && (lLeft.a.$ === 'Red')) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === 'RBNode_elm_builtin') {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === 'RBNode_elm_builtin') {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === 'RBNode_elm_builtin') {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === 'RBNode_elm_builtin') && (_v0.a.$ === 'Red')) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, $elm$core$Dict$Black, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$filter = F2(
	function (isGood, dict) {
		return A3(
			$elm$core$Dict$foldl,
			F3(
				function (k, v, d) {
					return A2(isGood, k, v) ? A3($elm$core$Dict$insert, k, v, d) : d;
				}),
			$elm$core$Dict$empty,
			dict);
	});
var $elm_community$dict_extra$Dict$Extra$removeWhen = F2(
	function (pred, dict) {
		return A2(
			$elm$core$Dict$filter,
			F2(
				function (k, v) {
					return !A2(pred, k, v);
				}),
			dict);
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix = F2(
	function (prefix, key) {
		return (prefix === '') ? key : A2(
			$elm$core$String$dropLeft,
			1 + $elm$core$String$length(prefix),
			key);
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$process = F2(
	function (message, boxedState) {
		var state = boxedState.a;
		switch (message.$) {
			case 'Got':
				var label = message.a;
				var key = message.b;
				var value = message.c;
				return _Utils_Tuple2(
					boxedState,
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$GetResponse(
						{
							key: A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix, state.prefix, key),
							label: label,
							value: value
						}));
			case 'Keys':
				var label = message.a;
				var prefix = message.b;
				var keys = message.c;
				return _Utils_Tuple2(
					boxedState,
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$ListKeysResponse(
						{
							keys: A2(
								$elm$core$List$map,
								$billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix(state.prefix),
								keys),
							label: label,
							prefix: A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix, state.prefix, prefix)
						}));
			case 'Startup':
				return _Utils_Tuple2(
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$State(
						_Utils_update(
							state,
							{isLoaded: true})),
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$NoResponse);
			case 'SimulateGet':
				var label = message.a;
				var key = message.b;
				return _Utils_Tuple2(
					boxedState,
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$GetResponse(
						{
							key: A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix, state.prefix, key),
							label: label,
							value: A2($elm$core$Dict$get, key, state.simulationDict)
						}));
			case 'SimulatePut':
				var key = message.a;
				var value = message.b;
				return _Utils_Tuple2(
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$State(
						_Utils_update(
							state,
							{
								simulationDict: function () {
									if (value.$ === 'Nothing') {
										return A2($elm$core$Dict$remove, key, state.simulationDict);
									} else {
										var v = value.a;
										return A3($elm$core$Dict$insert, key, v, state.simulationDict);
									}
								}()
							})),
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$NoResponse);
			case 'SimulateListKeys':
				var label = message.a;
				var prefix = message.b;
				return _Utils_Tuple2(
					boxedState,
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$ListKeysResponse(
						{
							keys: A3(
								$elm$core$Dict$foldr,
								F3(
									function (k, _v2, res) {
										return A2($elm$core$String$startsWith, prefix, k) ? A2(
											$elm$core$List$cons,
											A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix, state.prefix, k),
											res) : res;
									}),
								_List_Nil,
								state.simulationDict),
							label: label,
							prefix: A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$stripPrefix, state.prefix, prefix)
						}));
			case 'SimulateClear':
				var prefix = message.a;
				return _Utils_Tuple2(
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$State(
						_Utils_update(
							state,
							{
								simulationDict: A2(
									$elm_community$dict_extra$Dict$Extra$removeWhen,
									F2(
										function (k, _v3) {
											return A2($elm$core$String$startsWith, prefix, k);
										}),
									state.simulationDict)
							})),
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$NoResponse);
			default:
				return _Utils_Tuple2(
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$State(state),
					$billstclair$elm_localstorage$PortFunnel$LocalStorage$NoResponse);
		}
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleDesc = A4($billstclair$elm_port_funnel$PortFunnel$makeModuleDesc, $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName, $billstclair$elm_localstorage$PortFunnel$LocalStorage$encode, $billstclair$elm_localstorage$PortFunnel$LocalStorage$decode, $billstclair$elm_localstorage$PortFunnel$LocalStorage$process);
var $billstclair$elm_port_funnel$PortFunnel$encodeGenericMessage = function (message) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'module',
				$elm$json$Json$Encode$string(message.moduleName)),
				_Utils_Tuple2(
				'tag',
				$elm$json$Json$Encode$string(message.tag)),
				_Utils_Tuple2('args', message.args)
			]));
};
var $billstclair$elm_port_funnel$PortFunnel$messageToValue = F2(
	function (_v0, message) {
		var moduleDesc = _v0.a;
		return $billstclair$elm_port_funnel$PortFunnel$encodeGenericMessage(
			moduleDesc.encoder(message));
	});
var $billstclair$elm_port_funnel$PortFunnel$sendMessage = F3(
	function (moduleDesc, cmdPort, message) {
		return cmdPort(
			A2($billstclair$elm_port_funnel$PortFunnel$messageToValue, moduleDesc, message));
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$send = F3(
	function (wrapper, message, _v0) {
		var state = _v0.a;
		var prefix = state.prefix;
		var mess = function () {
			switch (message.$) {
				case 'Get':
					var label = message.a;
					var key = message.b;
					return A2(
						$billstclair$elm_localstorage$PortFunnel$InternalTypes$Get,
						label,
						A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$addPrefix, prefix, key));
				case 'Put':
					var key = message.a;
					var value = message.b;
					return A2(
						$billstclair$elm_localstorage$PortFunnel$InternalTypes$Put,
						A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$addPrefix, prefix, key),
						value);
				case 'ListKeys':
					var label = message.a;
					var pref = message.b;
					return A2(
						$billstclair$elm_localstorage$PortFunnel$InternalTypes$ListKeys,
						label,
						A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$addPrefix, prefix, pref));
				case 'Clear':
					var pref = message.a;
					return $billstclair$elm_localstorage$PortFunnel$InternalTypes$Clear(
						A2($billstclair$elm_localstorage$PortFunnel$LocalStorage$addPrefix, prefix, pref));
				default:
					return message;
			}
		}();
		return A3($billstclair$elm_port_funnel$PortFunnel$sendMessage, $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleDesc, wrapper, mess);
	});
var $author$project$Main$sendLocalStorage = F2(
	function (model, message) {
		return A3($billstclair$elm_localstorage$PortFunnel$LocalStorage$send, $author$project$Main$cmdPort, message, model.funnelState.storage);
	});
var $author$project$Main$getLocalStorageString = F2(
	function (model, key) {
		return A2(
			$author$project$Main$sendLocalStorage,
			model,
			$billstclair$elm_localstorage$PortFunnel$LocalStorage$get(key));
	});
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$initialState = function (prefix) {
	return $billstclair$elm_localstorage$PortFunnel$LocalStorage$State(
		{isLoaded: false, prefix: prefix, simulationDict: $elm$core$Dict$empty});
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$State = function (a) {
	return {$: 'State', a: a};
};
var $elm$core$Set$Set_elm_builtin = function (a) {
	return {$: 'Set_elm_builtin', a: a};
};
var $elm$core$Set$empty = $elm$core$Set$Set_elm_builtin($elm$core$Dict$empty);
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$initialState = $billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
	{continuationCounter: 0, continuations: $elm$core$Dict$empty, isLoaded: false, noAutoReopenKeys: $elm$core$Set$empty, queues: $elm$core$Dict$empty, socketStates: $elm$core$Dict$empty});
var $author$project$PortFunnels$initialState = function (prefix) {
	return {
		storage: $billstclair$elm_localstorage$PortFunnel$LocalStorage$initialState(prefix),
		websocket: $billstclair$elm_websocket_client$PortFunnel$WebSocket$initialState
	};
};
var $author$project$Main$init = F3(
	function (flags, url, key) {
		var formFields = {
			gameId: function () {
				var _v0 = url.fragment;
				if (_v0.$ === 'Just') {
					var f = _v0.a;
					return f;
				} else {
					return '';
				}
			}(),
			text: '',
			username: '',
			usernamePlaceholder: ''
		};
		var model = $author$project$Main$Model(key)(url)($author$project$Protocol$NoGame)($elm$core$Maybe$Nothing)(false)($elm$core$Maybe$Nothing)($elm$core$Array$empty)($elm$core$Maybe$Nothing)($elm$core$Maybe$Nothing)($elm$core$Maybe$Nothing)($elm$core$Maybe$Nothing)(0)($elm$core$Maybe$Nothing)($elm$core$Maybe$Nothing)(
			$author$project$PortFunnels$initialState('drawtice'))(formFields)($elm$core$Dict$empty)(0)($elm$core$Maybe$Nothing);
		return _Utils_Tuple2(
			model,
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[
						A2($elm$core$Task$perform, $author$project$Main$Tick, $elm$time$Time$now),
						A2(
						$elm$random$Random$generate,
						$author$project$Main$SetField($author$project$Main$UsernamePlaceholder),
						$author$project$Names$generator),
						A2($author$project$Main$getLocalStorageString, model, 'username')
					])));
	});
var $author$project$Main$SendImage = function (a) {
	return {$: 'SendImage', a: a};
};
var $author$project$Main$ShownConfirmDialog = function (a) {
	return {$: 'ShownConfirmDialog', a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $author$project$Main$canvasReturnPort = _Platform_incomingPort('canvasReturnPort', $elm$json$Json$Decode$string);
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$json$Json$Decode$index = _Json_decodeIndex;
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Main$confirmReturnPort = _Platform_incomingPort(
	'confirmReturnPort',
	A2(
		$elm$json$Json$Decode$andThen,
		function (_v0) {
			return A2(
				$elm$json$Json$Decode$andThen,
				function (_v1) {
					return $elm$json$Json$Decode$succeed(
						_Utils_Tuple2(_v0, _v1));
				},
				A2($elm$json$Json$Decode$index, 1, $elm$json$Json$Decode$int));
		},
		A2($elm$json$Json$Decode$index, 0, $elm$json$Json$Decode$bool)));
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 'Every', a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {processes: processes, taggers: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 'Nothing') {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.processes;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(_Utils_Tuple0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.taggers);
		if (_v0.$ === 'Nothing') {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $author$project$PortFunnels$subPort = _Platform_incomingPort('subPort', $elm$json$Json$Decode$value);
var $author$project$PortFunnels$subscriptions = F2(
	function (process, model) {
		return $author$project$PortFunnels$subPort(process);
	});
var $author$project$Main$subscriptions = function (model) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				A2($elm$time$Time$every, 1000, $author$project$Main$Tick),
				A2($author$project$PortFunnels$subscriptions, $author$project$Main$Receive, model),
				$author$project$Main$confirmReturnPort($author$project$Main$ShownConfirmDialog),
				$author$project$Main$canvasReturnPort($author$project$Main$SendImage)
			]));
};
var $author$project$Protocol$ErrorResponse = function (a) {
	return {$: 'ErrorResponse', a: a};
};
var $author$project$Main$GameIdField = {$: 'GameIdField'};
var $author$project$Protocol$ImagePackage = function (a) {
	return {$: 'ImagePackage', a: a};
};
var $author$project$Protocol$ImagePackageCommand = function (a) {
	return {$: 'ImagePackageCommand', a: a};
};
var $author$project$Protocol$JoinCommand = F2(
	function (a, b) {
		return {$: 'JoinCommand', a: a, b: b};
	});
var $author$project$Protocol$KickCommand = function (a) {
	return {$: 'KickCommand', a: a};
};
var $author$project$Protocol$LeaveCommand = {$: 'LeaveCommand'};
var $author$project$Protocol$LeftGameResponse = {$: 'LeftGameResponse'};
var $author$project$PortFunnels$LocalStorageHandler = function (a) {
	return {$: 'LocalStorageHandler', a: a};
};
var $author$project$Protocol$NewGameCommand = function (a) {
	return {$: 'NewGameCommand', a: a};
};
var $author$project$Protocol$NextRoundCommand = {$: 'NextRoundCommand'};
var $author$project$Main$SocketReceive = function (a) {
	return {$: 'SocketReceive', a: a};
};
var $author$project$Protocol$StartCommand = {$: 'StartCommand'};
var $author$project$Main$StorageReceive = F2(
	function (a, b) {
		return {$: 'StorageReceive', a: a, b: b};
	});
var $author$project$Protocol$Stuck = {$: 'Stuck'};
var $author$project$Protocol$TextPackage = function (a) {
	return {$: 'TextPackage', a: a};
};
var $author$project$Protocol$TextPackageCommand = function (a) {
	return {$: 'TextPackageCommand', a: a};
};
var $author$project$Main$UsernameField = {$: 'UsernameField'};
var $author$project$Protocol$UuidCommand = function (a) {
	return {$: 'UuidCommand', a: a};
};
var $author$project$PortFunnels$WebSocketHandler = function (a) {
	return {$: 'WebSocketHandler', a: a};
};
var $Janiczek$cmd_extra$Cmd$Extra$addCmd = F2(
	function (cmd, _v0) {
		var model = _v0.a;
		var oldCmd = _v0.b;
		return _Utils_Tuple2(
			model,
			$elm$core$Platform$Cmd$batch(
				_List_fromArray(
					[oldCmd, cmd])));
	});
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (maybeValue.$ === 'Just') {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$Maybe$destruct = F3(
	function (_default, func, maybe) {
		if (maybe.$ === 'Just') {
			var a = maybe.a;
			return func(a);
		} else {
			return _default;
		}
	});
var $author$project$Main$canvasPort = _Platform_outgoingPort(
	'canvasPort',
	function ($) {
		var a = $.a;
		var b = $.b;
		return A2(
			$elm$json$Json$Encode$list,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					$elm$json$Json$Encode$string(a),
					function ($) {
					return A3($elm$core$Maybe$destruct, $elm$json$Json$Encode$null, $elm$json$Json$Encode$string, $);
				}(b)
				]));
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCodeToString = function (code) {
	switch (code.$) {
		case 'NormalClosure':
			return 'Normal';
		case 'GoingAwayClosure':
			return 'GoingAway';
		case 'ProtocolErrorClosure':
			return 'ProtocolError';
		case 'UnsupportedDataClosure':
			return 'UnsupportedData';
		case 'NoStatusRecvdClosure':
			return 'NoStatusRecvd';
		case 'AbnormalClosure':
			return 'Abnormal';
		case 'InvalidFramePayloadDataClosure':
			return 'InvalidFramePayloadData';
		case 'PolicyViolationClosure':
			return 'PolicyViolation';
		case 'MessageTooBigClosure':
			return 'MessageTooBig';
		case 'MissingExtensionClosure':
			return 'MissingExtension';
		case 'InternalErrorClosure':
			return 'InternalError';
		case 'ServiceRestartClosure':
			return 'ServiceRestart';
		case 'TryAgainLaterClosure':
			return 'TryAgainLater';
		case 'BadGatewayClosure':
			return 'BadGateway';
		case 'TLSHandshakeClosure':
			return 'TLSHandshake';
		case 'TimedOutOnReconnect':
			return 'TimedOutOnReconnect';
		default:
			return 'UnknownClosureCode';
	}
};
var $elm$json$Json$Encode$int = _Json_wrap;
var $author$project$Main$confirmPort = _Platform_outgoingPort(
	'confirmPort',
	function ($) {
		var a = $.a;
		var b = $.b;
		return A2(
			$elm$json$Json$Encode$list,
			$elm$core$Basics$identity,
			_List_fromArray(
				[
					$elm$json$Json$Encode$string(a),
					$elm$json$Json$Encode$int(b)
				]));
	});
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $author$project$Main$ShowError = function (a) {
	return {$: 'ShowError', a: a};
};
var $author$project$Main$errorPort = _Platform_outgoingPort('errorPort', $elm$json$Json$Encode$string);
var $author$project$Main$errorLog = function (message) {
	return $elm$core$Platform$Cmd$batch(
		_List_fromArray(
			[
				$author$project$Main$errorPort(message),
				A2(
				$elm$core$Task$perform,
				$author$project$Main$ShowError,
				$elm$core$Task$succeed(message))
			]));
};
var $author$project$Protocol$errorParser = _Utils_Tuple2(
	$elm$json$Json$Decode$string,
	function (s) {
		return $author$project$Protocol$ErrorResponse(s);
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$maybeStringToString = function (string) {
	if (string.$ === 'Nothing') {
		return 'Nothing';
	} else {
		var s = string.a;
		return 'Just \"' + (s + '\"');
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$maybeString = function (s) {
	if (s.$ === 'Nothing') {
		return 'Nothing';
	} else {
		var string = s.a;
		return 'Just ' + string;
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$toString = function (mess) {
	switch (mess.$) {
		case 'Startup':
			return '<Startup>';
		case 'PWillOpen':
			var key = mess.a.key;
			var url = mess.a.url;
			var keepAlive = mess.a.keepAlive;
			return 'PWillOpen { key = \"' + (key + ('\", url = \"' + (url + ('\", keepAlive = ' + (keepAlive ? 'True' : ('False' + '}'))))));
		case 'POOpen':
			var key = mess.a.key;
			var url = mess.a.url;
			return 'POOpen { key = \"' + (key + ('\", url = \"' + (url + '\"}')));
		case 'PIConnected':
			var key = mess.a.key;
			var description = mess.a.description;
			return 'PIConnected { key = \"' + (key + ('\", description = \"' + (description + '\"}')));
		case 'PWillSend':
			var key = mess.a.key;
			var message = mess.a.message;
			return 'PWillSend { key = \"' + (key + ('\", message = \"' + (message + '\"}')));
		case 'POSend':
			var key = mess.a.key;
			var message = mess.a.message;
			return 'POSend { key = \"' + (key + ('\", message = \"' + (message + '\"}')));
		case 'PIMessageReceived':
			var key = mess.a.key;
			var message = mess.a.message;
			return 'PIMessageReceived { key = \"' + (key + ('\", message = \"' + (message + '\"}')));
		case 'PWillClose':
			var key = mess.a.key;
			var reason = mess.a.reason;
			return 'PWillClose { key = \"' + (key + ('\", reason = \"' + (reason + '\"}')));
		case 'POClose':
			var key = mess.a.key;
			var reason = mess.a.reason;
			return 'POClose { key = \"' + (key + ('\", reason = \"' + (reason + '\"}')));
		case 'PIClosed':
			var key = mess.a.key;
			var bytesQueued = mess.a.bytesQueued;
			var code = mess.a.code;
			var reason = mess.a.reason;
			var wasClean = mess.a.wasClean;
			return 'PIClosed { key = \"' + (key + ('\", bytesQueued = \"' + ($elm$core$String$fromInt(bytesQueued) + ('\", code = \"' + ($elm$core$String$fromInt(code) + ('\", reason = \"' + (reason + ('\", wasClean = \"' + (wasClean ? 'True' : ('False' + '\"}'))))))))));
		case 'POBytesQueued':
			var key = mess.a.key;
			return 'POBytesQueued { key = \"' + (key + '\"}');
		case 'PIBytesQueued':
			var key = mess.a.key;
			var bufferedAmount = mess.a.bufferedAmount;
			return 'PIBytesQueued { key = \"' + (key + ('\", bufferedAmount = \"' + ($elm$core$String$fromInt(bufferedAmount) + '\"}')));
		case 'PODelay':
			var millis = mess.a.millis;
			var id = mess.a.id;
			return 'PODelay { millis = \"' + ($elm$core$String$fromInt(millis) + ('\" id = \"' + (id + '\"}')));
		case 'PIDelayed':
			var id = mess.a.id;
			return 'PIDelayed { id = \"' + (id + '\"}');
		default:
			var key = mess.a.key;
			var code = mess.a.code;
			var description = mess.a.description;
			var name = mess.a.name;
			return 'PIError { key = \"' + ($billstclair$elm_websocket_client$PortFunnel$WebSocket$maybeString(key) + ('\" code = \"' + (code + ('\" description = \"' + (description + ('\" name = \"' + ($billstclair$elm_websocket_client$PortFunnel$WebSocket$maybeString(name) + '\"}')))))));
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$errorToString = function (theError) {
	switch (theError.$) {
		case 'SocketAlreadyOpenError':
			var key = theError.a;
			return 'SocketAlreadyOpenError \"' + (key + '\"');
		case 'SocketConnectingError':
			var key = theError.a;
			return 'SocketConnectingError \"' + (key + '\"');
		case 'SocketClosingError':
			var key = theError.a;
			return 'SocketClosingError \"' + (key + '\"');
		case 'SocketNotOpenError':
			var key = theError.a;
			return 'SocketNotOpenError \"' + (key + '\"');
		case 'UnexpectedConnectedError':
			var key = theError.a.key;
			var description = theError.a.description;
			return 'UnexpectedConnectedError\n { key = \"' + (key + ('\", description = \"' + (description + '\" }')));
		case 'UnexpectedMessageError':
			var key = theError.a.key;
			var message = theError.a.message;
			return 'UnexpectedMessageError { key = \"' + (key + ('\", message = \"' + (message + '\" }')));
		case 'LowLevelError':
			var key = theError.a.key;
			var code = theError.a.code;
			var description = theError.a.description;
			var name = theError.a.name;
			return 'LowLevelError { key = \"' + ($billstclair$elm_websocket_client$PortFunnel$WebSocket$maybeStringToString(key) + ('\", code = \"' + (code + ('\", description = \"' + (description + ('\", code = \"' + ($billstclair$elm_websocket_client$PortFunnel$WebSocket$maybeStringToString(name) + '\" }')))))));
		default:
			var message = theError.a.message;
			return 'InvalidMessageError: ' + $billstclair$elm_websocket_client$PortFunnel$WebSocket$toString(message);
	}
};
var $author$project$Protocol$GameDetails = F5(
	function (alias, status, players, uuid, currentStage) {
		return {alias: alias, currentStage: currentStage, players: players, status: status, uuid: uuid};
	});
var $author$project$Protocol$GameDetailsResponse = function (a) {
	return {$: 'GameDetailsResponse', a: a};
};
var $author$project$Protocol$Drawing = {$: 'Drawing'};
var $author$project$Protocol$GameOver = {$: 'GameOver'};
var $author$project$Protocol$Lobby = {$: 'Lobby'};
var $author$project$Protocol$Starting = {$: 'Starting'};
var $author$project$Protocol$Understanding = {$: 'Understanding'};
var $author$project$Protocol$gameStatusFromString = function (string) {
	switch (string) {
		case 'Lobby':
			return $author$project$Protocol$Lobby;
		case 'Starting':
			return $author$project$Protocol$Starting;
		case 'Drawing':
			return $author$project$Protocol$Drawing;
		case 'Understanding':
			return $author$project$Protocol$Understanding;
		case 'GameOver':
			return $author$project$Protocol$GameOver;
		default:
			return $author$project$Protocol$Lobby;
	}
};
var $elm$json$Json$Decode$map5 = _Json_map5;
var $author$project$Protocol$PlayerDetails = F6(
	function (username, imageUrl, status, isAdmin, deadline, stuck) {
		return {deadline: deadline, imageUrl: imageUrl, isAdmin: isAdmin, status: status, stuck: stuck, username: username};
	});
var $elm$json$Json$Decode$map6 = _Json_map6;
var $author$project$Protocol$Done = {$: 'Done'};
var $author$project$Protocol$Uploading = function (a) {
	return {$: 'Uploading', a: a};
};
var $author$project$Protocol$Working = function (a) {
	return {$: 'Working', a: a};
};
var $author$project$Protocol$playerStatusFromString = function (string) {
	switch (string) {
		case 'Done':
			return $author$project$Protocol$Done;
		case 'Working':
			return $author$project$Protocol$Working(0);
		case 'Uploading':
			return $author$project$Protocol$Uploading(50);
		default:
			return $author$project$Protocol$Stuck;
	}
};
var $author$project$Protocol$playerDecoder = A7(
	$elm$json$Json$Decode$map6,
	$author$project$Protocol$PlayerDetails,
	A2($elm$json$Json$Decode$field, 'username', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'image_url', $elm$json$Json$Decode$string),
	A2(
		$elm$json$Json$Decode$field,
		'status',
		A2($elm$json$Json$Decode$map, $author$project$Protocol$playerStatusFromString, $elm$json$Json$Decode$string)),
	A2($elm$json$Json$Decode$field, 'is_admin', $elm$json$Json$Decode$bool),
	A2($elm$json$Json$Decode$field, 'deadline', $elm$json$Json$Decode$int),
	A2($elm$json$Json$Decode$field, 'stuck', $elm$json$Json$Decode$bool));
var $author$project$Protocol$gameDetailsParser = _Utils_Tuple2(
	A6(
		$elm$json$Json$Decode$map5,
		$author$project$Protocol$GameDetails,
		A2($elm$json$Json$Decode$field, 'alias', $elm$json$Json$Decode$string),
		A2(
			$elm$json$Json$Decode$field,
			'game_status',
			A2($elm$json$Json$Decode$map, $author$project$Protocol$gameStatusFromString, $elm$json$Json$Decode$string)),
		A2(
			$elm$json$Json$Decode$field,
			'players',
			$elm$json$Json$Decode$list($author$project$Protocol$playerDecoder)),
		A2($elm$json$Json$Decode$field, 'uuid', $elm$json$Json$Decode$string),
		A2($elm$json$Json$Decode$field, 'current_stage', $elm$json$Json$Decode$int)),
	function (v) {
		return $author$project$Protocol$GameDetailsResponse(v);
	});
var $author$project$Main$getGameLink = function (model) {
	var url = model.url;
	var _v0 = model.gameId;
	if (_v0.$ === 'Just') {
		var gameId = _v0.a;
		return _Utils_update(
			url,
			{
				fragment: $elm$core$Maybe$Just(gameId)
			});
	} else {
		return url;
	}
};
var $author$project$Main$imageUrl = 'http://192.168.1.11:3030/images/';
var $elm$core$Elm$JsArray$foldl = _JsArray_foldl;
var $elm$core$Elm$JsArray$indexedMap = _JsArray_indexedMap;
var $elm$core$Array$indexedMap = F2(
	function (func, _v0) {
		var len = _v0.a;
		var tree = _v0.c;
		var tail = _v0.d;
		var initialBuilder = {
			nodeList: _List_Nil,
			nodeListSize: 0,
			tail: A3(
				$elm$core$Elm$JsArray$indexedMap,
				func,
				$elm$core$Array$tailIndex(len),
				tail)
		};
		var helper = F2(
			function (node, builder) {
				if (node.$ === 'SubTree') {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldl, helper, builder, subTree);
				} else {
					var leaf = node.a;
					var offset = builder.nodeListSize * $elm$core$Array$branchFactor;
					var mappedLeaf = $elm$core$Array$Leaf(
						A3($elm$core$Elm$JsArray$indexedMap, func, offset, leaf));
					return {
						nodeList: A2($elm$core$List$cons, mappedLeaf, builder.nodeList),
						nodeListSize: builder.nodeListSize + 1,
						tail: builder.tail
					};
				}
			});
		return A2(
			$elm$core$Array$builderToArray,
			true,
			A3($elm$core$Elm$JsArray$foldl, helper, initialBuilder, tree));
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$isConnected = F2(
	function (key, _v0) {
		var state = _v0.a;
		return !_Utils_eq(
			A2($elm$core$Dict$get, key, state.socketStates),
			$elm$core$Maybe$Nothing);
	});
var $author$project$Main$leaveGame = function (model) {
	return _Utils_update(
		model,
		{currentWorkload: 0, gameId: $elm$core$Maybe$Nothing, gameKey: $elm$core$Maybe$Nothing, myId: $elm$core$Maybe$Nothing, playerCapture: $elm$core$Maybe$Nothing, players: $elm$core$Array$empty, previousPackage: $elm$core$Maybe$Nothing, status: $author$project$Protocol$NoGame, workloads: $elm$core$Maybe$Nothing});
};
var $elm$browser$Browser$Navigation$load = _Browser_load;
var $elm$core$Debug$log = _Debug_log;
var $billstclair$elm_port_funnel$PortFunnel$FunnelSpec = F4(
	function (accessors, moduleDesc, commander, handler) {
		return {accessors: accessors, commander: commander, handler: handler, moduleDesc: moduleDesc};
	});
var $author$project$PortFunnels$LocalStorageFunnel = function (a) {
	return {$: 'LocalStorageFunnel', a: a};
};
var $author$project$PortFunnels$WebSocketFunnel = function (a) {
	return {$: 'WebSocketFunnel', a: a};
};
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$commander = F2(
	function (_v0, _v1) {
		return $elm$core$Platform$Cmd$none;
	});
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleName = 'WebSocket';
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$encode = function (mess) {
	var gm = F2(
		function (tag, args) {
			return A3($billstclair$elm_port_funnel$PortFunnel$GenericMessage, $billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleName, tag, args);
		});
	switch (mess.$) {
		case 'Startup':
			return A2(gm, 'startup', $elm$json$Json$Encode$null);
		case 'POOpen':
			var key = mess.a.key;
			var url = mess.a.url;
			return A2(
				gm,
				'open',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'url',
							$elm$json$Json$Encode$string(url))
						])));
		case 'POSend':
			var key = mess.a.key;
			var message = mess.a.message;
			return A2(
				gm,
				'send',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'message',
							$elm$json$Json$Encode$string(message))
						])));
		case 'POClose':
			var key = mess.a.key;
			var reason = mess.a.reason;
			return A2(
				gm,
				'close',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'reason',
							$elm$json$Json$Encode$string(reason))
						])));
		case 'POBytesQueued':
			var key = mess.a.key;
			return A2(
				gm,
				'getBytesQueued',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key))
						])));
		case 'PODelay':
			var millis = mess.a.millis;
			var id = mess.a.id;
			return A2(
				gm,
				'delay',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'millis',
							$elm$json$Json$Encode$int(millis)),
							_Utils_Tuple2(
							'id',
							$elm$json$Json$Encode$string(id))
						])));
		case 'PWillOpen':
			var key = mess.a.key;
			var url = mess.a.url;
			var keepAlive = mess.a.keepAlive;
			return A2(
				gm,
				'willopen',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'url',
							$elm$json$Json$Encode$string(url)),
							_Utils_Tuple2(
							'keepAlive',
							$elm$json$Json$Encode$bool(keepAlive))
						])));
		case 'PWillSend':
			var key = mess.a.key;
			var message = mess.a.message;
			return A2(
				gm,
				'willsend',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'message',
							$elm$json$Json$Encode$string(message))
						])));
		case 'PWillClose':
			var key = mess.a.key;
			var reason = mess.a.reason;
			return A2(
				gm,
				'willclose',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'reason',
							$elm$json$Json$Encode$string(reason))
						])));
		case 'PIConnected':
			var key = mess.a.key;
			var description = mess.a.description;
			return A2(
				gm,
				'connected',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'description',
							$elm$json$Json$Encode$string(description))
						])));
		case 'PIMessageReceived':
			var key = mess.a.key;
			var message = mess.a.message;
			return A2(
				gm,
				'messageReceived',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'message',
							$elm$json$Json$Encode$string(message))
						])));
		case 'PIClosed':
			var key = mess.a.key;
			var bytesQueued = mess.a.bytesQueued;
			var code = mess.a.code;
			var reason = mess.a.reason;
			var wasClean = mess.a.wasClean;
			return A2(
				gm,
				'closed',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'bytesQueued',
							$elm$json$Json$Encode$int(bytesQueued)),
							_Utils_Tuple2(
							'code',
							$elm$json$Json$Encode$int(code)),
							_Utils_Tuple2(
							'reason',
							$elm$json$Json$Encode$string(reason)),
							_Utils_Tuple2(
							'wasClean',
							$elm$json$Json$Encode$bool(wasClean))
						])));
		case 'PIBytesQueued':
			var key = mess.a.key;
			var bufferedAmount = mess.a.bufferedAmount;
			return A2(
				gm,
				'bytesQueued',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'key',
							$elm$json$Json$Encode$string(key)),
							_Utils_Tuple2(
							'bufferedAmount',
							$elm$json$Json$Encode$int(bufferedAmount))
						])));
		case 'PIDelayed':
			var id = mess.a.id;
			return A2(
				gm,
				'delayed',
				$elm$json$Json$Encode$object(
					_List_fromArray(
						[
							_Utils_Tuple2(
							'id',
							$elm$json$Json$Encode$string(id))
						])));
		default:
			var key = mess.a.key;
			var code = mess.a.code;
			var description = mess.a.description;
			var name = mess.a.name;
			var message = mess.a.message;
			return A2(
				gm,
				'error',
				$elm$json$Json$Encode$object(
					$elm$core$List$concat(
						_List_fromArray(
							[
								function () {
								if (key.$ === 'Just') {
									var k = key.a;
									return _List_fromArray(
										[
											_Utils_Tuple2(
											'key',
											$elm$json$Json$Encode$string(k))
										]);
								} else {
									return _List_Nil;
								}
							}(),
								_List_fromArray(
								[
									_Utils_Tuple2(
									'code',
									$elm$json$Json$Encode$string(code)),
									_Utils_Tuple2(
									'description',
									$elm$json$Json$Encode$string(description))
								]),
								function () {
								if (name.$ === 'Just') {
									var n = name.a;
									return _List_fromArray(
										[
											_Utils_Tuple2(
											'name',
											$elm$json$Json$Encode$string(n))
										]);
								} else {
									return _List_Nil;
								}
							}(),
								function () {
								if (message.$ === 'Just') {
									var m = message.a;
									return _List_fromArray(
										[
											_Utils_Tuple2(
											'message',
											$elm$json$Json$Encode$string(m))
										]);
								} else {
									return _List_Nil;
								}
							}()
							]))));
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$commander = F2(
	function (gfPort, response) {
		switch (response.$) {
			case 'CmdResponse':
				var message = response.a;
				return gfPort(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$encode(message));
			case 'ListResponse':
				var responses = response.a;
				return $elm$core$Platform$Cmd$batch(
					A2(
						$elm$core$List$map,
						A2($elm$core$Basics$composeR, $billstclair$elm_websocket_client$PortFunnel$WebSocket$encode, gfPort),
						A3(
							$elm$core$List$foldl,
							F2(
								function (rsp, res) {
									if (rsp.$ === 'CmdResponse') {
										var message = rsp.a;
										return A2($elm$core$List$cons, message, res);
									} else {
										return res;
									}
								}),
							_List_Nil,
							responses)));
			default:
				return $elm$core$Platform$Cmd$none;
		}
	});
var $billstclair$elm_port_funnel$PortFunnel$StateAccessors = F2(
	function (get, set) {
		return {get: get, set: set};
	});
var $author$project$PortFunnels$localStorageAccessors = A2(
	$billstclair$elm_port_funnel$PortFunnel$StateAccessors,
	function ($) {
		return $.storage;
	},
	F2(
		function (substate, state) {
			return _Utils_update(
				state,
				{storage: substate});
		}));
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyBufferedAmount = F2(
	function (key, bufferedAmount) {
		return {bufferedAmount: bufferedAmount, key: key};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyDescription = F2(
	function (key, description) {
		return {description: description, key: key};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyMessage = F2(
	function (key, message) {
		return {key: key, message: message};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyReason = F2(
	function (key, reason) {
		return {key: key, reason: reason};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyUrl = F2(
	function (key, url) {
		return {key: key, url: url};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyUrlKeepAlive = F3(
	function (key, url, keepAlive) {
		return {keepAlive: keepAlive, key: key, url: url};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$MillisId = F2(
	function (millis, id) {
		return {id: id, millis: millis};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIBytesQueued = function (a) {
	return {$: 'PIBytesQueued', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIClosed = function (a) {
	return {$: 'PIClosed', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIClosedRecord = F5(
	function (key, bytesQueued, code, reason, wasClean) {
		return {bytesQueued: bytesQueued, code: code, key: key, reason: reason, wasClean: wasClean};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIConnected = function (a) {
	return {$: 'PIConnected', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIDelayed = function (a) {
	return {$: 'PIDelayed', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIError = function (a) {
	return {$: 'PIError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIErrorRecord = F5(
	function (key, code, description, name, message) {
		return {code: code, description: description, key: key, message: message, name: name};
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIMessageReceived = function (a) {
	return {$: 'PIMessageReceived', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POBytesQueued = function (a) {
	return {$: 'POBytesQueued', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POClose = function (a) {
	return {$: 'POClose', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PODelay = function (a) {
	return {$: 'PODelay', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POOpen = function (a) {
	return {$: 'POOpen', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POSend = function (a) {
	return {$: 'POSend', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillClose = function (a) {
	return {$: 'PWillClose', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillOpen = function (a) {
	return {$: 'PWillOpen', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillSend = function (a) {
	return {$: 'PWillSend', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$Startup = {$: 'Startup'};
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$custom = $elm$json$Json$Decode$map2($elm$core$Basics$apR);
var $elm$json$Json$Decode$fail = _Json_fail;
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optionalDecoder = F3(
	function (pathDecoder, valDecoder, fallback) {
		var nullOr = function (decoder) {
			return $elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						decoder,
						$elm$json$Json$Decode$null(fallback)
					]));
		};
		var handleResult = function (input) {
			var _v0 = A2($elm$json$Json$Decode$decodeValue, pathDecoder, input);
			if (_v0.$ === 'Ok') {
				var rawValue = _v0.a;
				var _v1 = A2(
					$elm$json$Json$Decode$decodeValue,
					nullOr(valDecoder),
					rawValue);
				if (_v1.$ === 'Ok') {
					var finalResult = _v1.a;
					return $elm$json$Json$Decode$succeed(finalResult);
				} else {
					var finalErr = _v1.a;
					return $elm$json$Json$Decode$fail(
						$elm$json$Json$Decode$errorToString(finalErr));
				}
			} else {
				return $elm$json$Json$Decode$succeed(fallback);
			}
		};
		return A2($elm$json$Json$Decode$andThen, handleResult, $elm$json$Json$Decode$value);
	});
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional = F4(
	function (key, valDecoder, fallback, decoder) {
		return A2(
			$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$custom,
			A3(
				$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optionalDecoder,
				A2($elm$json$Json$Decode$field, key, $elm$json$Json$Decode$value),
				valDecoder,
				fallback),
			decoder);
	});
var $NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required = F3(
	function (key, valDecoder, decoder) {
		return A2(
			$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$custom,
			A2($elm$json$Json$Decode$field, key, valDecoder),
			decoder);
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode = F2(
	function (value, decoder) {
		var _v0 = A2($elm$json$Json$Decode$decodeValue, decoder, value);
		if (_v0.$ === 'Ok') {
			var a = _v0.a;
			return $elm$core$Result$Ok(a);
		} else {
			var err = _v0.a;
			return $elm$core$Result$Err(
				$elm$json$Json$Decode$errorToString(err));
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$decode = function (_v0) {
	var tag = _v0.tag;
	var args = _v0.args;
	switch (tag) {
		case 'startup':
			return $elm$core$Result$Ok($billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$Startup);
		case 'open':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POOpen,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'url',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyUrl)))));
		case 'send':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POSend,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'message',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyMessage)))));
		case 'close':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POClose,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'reason',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyReason)))));
		case 'getBytesQueued':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POBytesQueued,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'key',
						$elm$json$Json$Decode$string,
						$elm$json$Json$Decode$succeed(
							function (key) {
								return {key: key};
							}))));
		case 'delay':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PODelay,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'id',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'millis',
							$elm$json$Json$Decode$int,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$MillisId)))));
		case 'willopen':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillOpen,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'keepAlive',
						$elm$json$Json$Decode$bool,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'url',
							$elm$json$Json$Decode$string,
							A3(
								$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
								'key',
								$elm$json$Json$Decode$string,
								$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyUrlKeepAlive))))));
		case 'willsend':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillSend,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'message',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyMessage)))));
		case 'willclose':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillClose,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'reason',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyReason)))));
		case 'connected':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIConnected,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'description',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyDescription)))));
		case 'messageReceived':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIMessageReceived,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'message',
						$elm$json$Json$Decode$string,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyMessage)))));
		case 'closed':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIClosed,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'wasClean',
						$elm$json$Json$Decode$bool,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'reason',
							$elm$json$Json$Decode$string,
							A3(
								$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
								'code',
								$elm$json$Json$Decode$int,
								A3(
									$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
									'bytesQueued',
									$elm$json$Json$Decode$int,
									A3(
										$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
										'key',
										$elm$json$Json$Decode$string,
										$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIClosedRecord))))))));
		case 'bytesQueued':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIBytesQueued,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'bufferedAmount',
						$elm$json$Json$Decode$int,
						A3(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
							'key',
							$elm$json$Json$Decode$string,
							$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$KeyBufferedAmount)))));
		case 'delayed':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIDelayed,
					A3(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
						'id',
						$elm$json$Json$Decode$string,
						$elm$json$Json$Decode$succeed(
							function (id) {
								return {id: id};
							}))));
		case 'error':
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$valueDecode,
				args,
				A2(
					$elm$json$Json$Decode$map,
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIError,
					A4(
						$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional,
						'message',
						$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string),
						$elm$core$Maybe$Nothing,
						A4(
							$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional,
							'name',
							$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string),
							$elm$core$Maybe$Nothing,
							A3(
								$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
								'description',
								$elm$json$Json$Decode$string,
								A3(
									$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$required,
									'code',
									$elm$json$Json$Decode$string,
									A4(
										$NoRedInk$elm_json_decode_pipeline$Json$Decode$Pipeline$optional,
										'key',
										$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string),
										$elm$core$Maybe$Nothing,
										$elm$json$Json$Decode$succeed($billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PIErrorRecord))))))));
		default:
			return $elm$core$Result$Err('Unknown tag: ' + tag);
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$AbnormalClosure = {$: 'AbnormalClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ClosedResponse = function (a) {
	return {$: 'ClosedResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ClosingPhase = {$: 'ClosingPhase'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse = function (a) {
	return {$: 'CmdResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedPhase = {$: 'ConnectedPhase'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedResponse = function (a) {
	return {$: 'ConnectedResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectingPhase = {$: 'ConnectingPhase'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse = function (a) {
	return {$: 'ErrorResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InvalidMessageError = function (a) {
	return {$: 'InvalidMessageError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$LowLevelError = function (a) {
	return {$: 'LowLevelError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$MessageReceivedResponse = function (a) {
	return {$: 'MessageReceivedResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse = {$: 'NoResponse'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ReconnectedResponse = function (a) {
	return {$: 'ReconnectedResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$UnexpectedConnectedError = function (a) {
	return {$: 'UnexpectedConnectedError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$UnexpectedMessageError = function (a) {
	return {$: 'UnexpectedMessageError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$UnknownClosure = {$: 'UnknownClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$BadGatewayClosure = {$: 'BadGatewayClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$GoingAwayClosure = {$: 'GoingAwayClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalErrorClosure = {$: 'InternalErrorClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$InvalidFramePayloadDataClosure = {$: 'InvalidFramePayloadDataClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$MessageTooBigClosure = {$: 'MessageTooBigClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$MissingExtensionClosure = {$: 'MissingExtensionClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$NoStatusRecvdClosure = {$: 'NoStatusRecvdClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$NormalClosure = {$: 'NormalClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$PolicyViolationClosure = {$: 'PolicyViolationClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ProtocolErrorClosure = {$: 'ProtocolErrorClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ServiceRestartClosure = {$: 'ServiceRestartClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$TLSHandshakeClosure = {$: 'TLSHandshakeClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$TimedOutOnReconnect = {$: 'TimedOutOnReconnect'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$TryAgainLaterClosure = {$: 'TryAgainLaterClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$UnsupportedDataClosure = {$: 'UnsupportedDataClosure'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$closurePairs = _List_fromArray(
	[
		_Utils_Tuple2(1000, $billstclair$elm_websocket_client$PortFunnel$WebSocket$NormalClosure),
		_Utils_Tuple2(1001, $billstclair$elm_websocket_client$PortFunnel$WebSocket$GoingAwayClosure),
		_Utils_Tuple2(1002, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ProtocolErrorClosure),
		_Utils_Tuple2(1003, $billstclair$elm_websocket_client$PortFunnel$WebSocket$UnsupportedDataClosure),
		_Utils_Tuple2(1005, $billstclair$elm_websocket_client$PortFunnel$WebSocket$NoStatusRecvdClosure),
		_Utils_Tuple2(1006, $billstclair$elm_websocket_client$PortFunnel$WebSocket$AbnormalClosure),
		_Utils_Tuple2(1007, $billstclair$elm_websocket_client$PortFunnel$WebSocket$InvalidFramePayloadDataClosure),
		_Utils_Tuple2(1008, $billstclair$elm_websocket_client$PortFunnel$WebSocket$PolicyViolationClosure),
		_Utils_Tuple2(1009, $billstclair$elm_websocket_client$PortFunnel$WebSocket$MessageTooBigClosure),
		_Utils_Tuple2(1010, $billstclair$elm_websocket_client$PortFunnel$WebSocket$MissingExtensionClosure),
		_Utils_Tuple2(1011, $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalErrorClosure),
		_Utils_Tuple2(1012, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ServiceRestartClosure),
		_Utils_Tuple2(1013, $billstclair$elm_websocket_client$PortFunnel$WebSocket$TryAgainLaterClosure),
		_Utils_Tuple2(1014, $billstclair$elm_websocket_client$PortFunnel$WebSocket$BadGatewayClosure),
		_Utils_Tuple2(1015, $billstclair$elm_websocket_client$PortFunnel$WebSocket$TLSHandshakeClosure),
		_Utils_Tuple2(4000, $billstclair$elm_websocket_client$PortFunnel$WebSocket$TimedOutOnReconnect)
	]);
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$closureDict = $elm$core$Dict$fromList($billstclair$elm_websocket_client$PortFunnel$WebSocket$closurePairs);
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCode = function (code) {
	return A2(
		$elm$core$Maybe$withDefault,
		$billstclair$elm_websocket_client$PortFunnel$WebSocket$UnknownClosure,
		A2($elm$core$Dict$get, code, $billstclair$elm_websocket_client$PortFunnel$WebSocket$closureDict));
};
var $elm_community$list_extra$List$Extra$find = F2(
	function (predicate, list) {
		find:
		while (true) {
			if (!list.b) {
				return $elm$core$Maybe$Nothing;
			} else {
				var first = list.a;
				var rest = list.b;
				if (predicate(first)) {
					return $elm$core$Maybe$Just(first);
				} else {
					var $temp$predicate = predicate,
						$temp$list = rest;
					predicate = $temp$predicate;
					list = $temp$list;
					continue find;
				}
			}
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCodeNumber = function (code) {
	var _v0 = A2(
		$elm_community$list_extra$List$Extra$find,
		function (_v1) {
			var c = _v1.b;
			return _Utils_eq(c, code);
		},
		$billstclair$elm_websocket_client$PortFunnel$WebSocket$closurePairs);
	if (_v0.$ === 'Just') {
		var _v2 = _v0.a;
		var _int = _v2.a;
		return _int;
	} else {
		return 0;
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$IdlePhase = {$: 'IdlePhase'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$emptySocketState = {backoff: 0, continuationId: $elm$core$Maybe$Nothing, keepAlive: false, phase: $billstclair$elm_websocket_client$PortFunnel$WebSocket$IdlePhase, url: ''};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState = F2(
	function (key, state) {
		return A2(
			$elm$core$Maybe$withDefault,
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$emptySocketState,
			A2($elm$core$Dict$get, key, state.socketStates));
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$doClose = F3(
	function (state, key, reason) {
		var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
		return (!_Utils_eq(socketState.phase, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedPhase)) ? _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
				_Utils_update(
					state,
					{
						continuations: function () {
							var _v0 = socketState.continuationId;
							if (_v0.$ === 'Nothing') {
								return state.continuations;
							} else {
								var id = _v0.a;
								return A2($elm$core$Dict$remove, id, state.continuations);
							}
						}(),
						socketStates: A2($elm$core$Dict$remove, key, state.socketStates)
					})),
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse) : _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
				_Utils_update(
					state,
					{
						socketStates: A3(
							$elm$core$Dict$insert,
							key,
							_Utils_update(
								socketState,
								{phase: $billstclair$elm_websocket_client$PortFunnel$WebSocket$ClosingPhase}),
							state.socketStates)
					})),
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POClose(
					{key: key, reason: 'user request'})));
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketAlreadyOpenError = function (a) {
	return {$: 'SocketAlreadyOpenError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketClosingError = function (a) {
	return {$: 'SocketClosingError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketConnectingError = function (a) {
	return {$: 'SocketConnectingError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$checkUsedSocket = F2(
	function (state, key) {
		var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
		var _v0 = socketState.phase;
		switch (_v0.$) {
			case 'IdlePhase':
				return $elm$core$Result$Ok(socketState);
			case 'ConnectedPhase':
				return $elm$core$Result$Err(
					_Utils_Tuple2(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketAlreadyOpenError(key))));
			case 'ConnectingPhase':
				return $elm$core$Result$Err(
					_Utils_Tuple2(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketConnectingError(key))));
			default:
				return $elm$core$Result$Err(
					_Utils_Tuple2(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketClosingError(key))));
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$doOpen = F4(
	function (state, key, url, keepAlive) {
		var _v0 = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$checkUsedSocket, state, key);
		if (_v0.$ === 'Err') {
			var res = _v0.a;
			return res;
		} else {
			var socketState = _v0.a;
			return _Utils_Tuple2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
					_Utils_update(
						state,
						{
							socketStates: A3(
								$elm$core$Dict$insert,
								key,
								_Utils_update(
									socketState,
									{keepAlive: keepAlive, phase: $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectingPhase, url: url}),
								state.socketStates)
						})),
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POOpen(
						{key: key, url: url})));
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketNotOpenError = function (a) {
	return {$: 'SocketNotOpenError', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$queueSend = F3(
	function (state, key, message) {
		var queues = state.queues;
		var current = A2(
			$elm$core$Maybe$withDefault,
			_List_Nil,
			A2($elm$core$Dict$get, key, queues));
		var _new = A2(
			$elm$core$List$append,
			current,
			_List_fromArray(
				[message]));
		return _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
				_Utils_update(
					state,
					{
						queues: A3($elm$core$Dict$insert, key, _new, queues)
					})),
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse);
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$doSend = F3(
	function (state, key, message) {
		var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
		return (!_Utils_eq(socketState.phase, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedPhase)) ? ((!socketState.backoff) ? _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$SocketNotOpenError(key))) : A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$queueSend, state, key, message)) : (_Utils_eq(
			A2($elm$core$Dict$get, key, state.queues),
			$elm$core$Maybe$Nothing) ? _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POSend(
					{key: key, message: message}))) : A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$queueSend, state, key, message));
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$getContinuation = F2(
	function (id, state) {
		var _v0 = A2($elm$core$Dict$get, id, state.continuations);
		if (_v0.$ === 'Nothing') {
			return $elm$core$Maybe$Nothing;
		} else {
			var continuation = _v0.a;
			return $elm$core$Maybe$Just(
				_Utils_Tuple3(
					continuation.key,
					continuation.kind,
					_Utils_update(
						state,
						{
							continuations: A2($elm$core$Dict$remove, id, state.continuations)
						})));
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$RetryConnection = {$: 'RetryConnection'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$allocateContinuation = F3(
	function (key, kind, state) {
		var counter = state.continuationCounter + 1;
		var id = $elm$core$String$fromInt(counter);
		var continuation = {key: key, kind: kind};
		var _v0 = function () {
			var _v1 = A2($elm$core$Dict$get, key, state.socketStates);
			if (_v1.$ === 'Nothing') {
				return _Utils_Tuple2(
					state.continuations,
					A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state));
			} else {
				var sockState = _v1.a;
				var _v2 = sockState.continuationId;
				if (_v2.$ === 'Nothing') {
					return _Utils_Tuple2(
						state.continuations,
						_Utils_update(
							sockState,
							{
								continuationId: $elm$core$Maybe$Just(id)
							}));
				} else {
					var oldid = _v2.a;
					return _Utils_Tuple2(
						A2($elm$core$Dict$remove, oldid, state.continuations),
						_Utils_update(
							sockState,
							{
								continuationId: $elm$core$Maybe$Just(id)
							}));
				}
			}
		}();
		var continuations = _v0.a;
		var socketState = _v0.b;
		return _Utils_Tuple2(
			id,
			_Utils_update(
				state,
				{
					continuationCounter: counter,
					continuations: A3($elm$core$Dict$insert, id, continuation, continuations),
					socketStates: A3($elm$core$Dict$insert, key, socketState, state.socketStates)
				}));
	});
var $elm$core$Basics$pow = _Basics_pow;
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$backoffMillis = function (backoff) {
	return 10 * A2($elm$core$Basics$pow, 2, backoff);
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$maxBackoff = 10;
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$unexpectedClose = F2(
	function (state, _v0) {
		var key = _v0.key;
		var code = _v0.code;
		var reason = _v0.reason;
		var wasClean = _v0.wasClean;
		return _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
				_Utils_update(
					state,
					{
						socketStates: A2($elm$core$Dict$remove, key, state.socketStates)
					})),
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$ClosedResponse(
				{
					code: $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCode(code),
					expected: false,
					key: key,
					reason: reason,
					wasClean: wasClean
				}));
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$handleUnexpectedClose = F2(
	function (state, closedRecord) {
		var key = closedRecord.key;
		var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
		var backoff = 1 + socketState.backoff;
		if ((_Utils_cmp(backoff, $billstclair$elm_websocket_client$PortFunnel$WebSocket$maxBackoff) > 0) || (((backoff === 1) && (!_Utils_eq(socketState.phase, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedPhase))) || (closedRecord.bytesQueued > 0))) {
			return A2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$unexpectedClose,
				state,
				_Utils_update(
					closedRecord,
					{
						code: (_Utils_cmp(backoff, $billstclair$elm_websocket_client$PortFunnel$WebSocket$maxBackoff) > 0) ? $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCodeNumber($billstclair$elm_websocket_client$PortFunnel$WebSocket$TimedOutOnReconnect) : closedRecord.code
					}));
		} else {
			if (socketState.url === '') {
				return A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$unexpectedClose, state, closedRecord);
			} else {
				var _v0 = A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$allocateContinuation, key, $billstclair$elm_websocket_client$PortFunnel$WebSocket$RetryConnection, state);
				var id = _v0.a;
				var state2 = _v0.b;
				var delay = $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PODelay(
					{
						id: id,
						millis: $billstclair$elm_websocket_client$PortFunnel$WebSocket$backoffMillis(backoff)
					});
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
						_Utils_update(
							state2,
							{
								socketStates: A3(
									$elm$core$Dict$insert,
									key,
									_Utils_update(
										socketState,
										{backoff: backoff}),
									state.socketStates)
							})),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(delay));
			}
		}
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (_v0.$ === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0.a;
		return A2($elm$core$Dict$member, key, dict);
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$DrainOutputQueue = {$: 'DrainOutputQueue'};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$ListResponse = function (a) {
	return {$: 'ListResponse', a: a};
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$processQueuedMessage = F3(
	function (state, key, reconnectedResponse) {
		var queues = state.queues;
		var _v0 = A2($elm$core$Dict$get, key, queues);
		if (_v0.$ === 'Nothing') {
			return _Utils_Tuple2(
				$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
				reconnectedResponse);
		} else {
			if (!_v0.a.b) {
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
						_Utils_update(
							state,
							{
								queues: A2($elm$core$Dict$remove, key, queues)
							})),
					reconnectedResponse);
			} else {
				var _v1 = _v0.a;
				var message = _v1.a;
				var tail = _v1.b;
				var posend = $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POSend(
					{key: key, message: message});
				var _v2 = A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$allocateContinuation, key, $billstclair$elm_websocket_client$PortFunnel$WebSocket$DrainOutputQueue, state);
				var id = _v2.a;
				var state2 = _v2.b;
				var podelay = $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PODelay(
					{id: id, millis: 20});
				var response = $billstclair$elm_websocket_client$PortFunnel$WebSocket$ListResponse(
					$elm$core$List$concat(
						_List_fromArray(
							[
								function () {
								if (reconnectedResponse.$ === 'NoResponse') {
									return _List_Nil;
								} else {
									return _List_fromArray(
										[reconnectedResponse]);
								}
							}(),
								_List_fromArray(
								[
									$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(podelay),
									$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(posend)
								])
							])));
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
						_Utils_update(
							state2,
							{
								queues: A3($elm$core$Dict$insert, key, tail, queues)
							})),
					response);
			}
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$process = F2(
	function (mess, unboxed) {
		var state = unboxed.a;
		switch (mess.$) {
			case 'Startup':
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
						_Utils_update(
							state,
							{isLoaded: true})),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse);
			case 'PWillOpen':
				var key = mess.a.key;
				var url = mess.a.url;
				var keepAlive = mess.a.keepAlive;
				return A4($billstclair$elm_websocket_client$PortFunnel$WebSocket$doOpen, state, key, url, keepAlive);
			case 'PWillSend':
				var key = mess.a.key;
				var message = mess.a.message;
				return A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$doSend, state, key, message);
			case 'PWillClose':
				var key = mess.a.key;
				var reason = mess.a.reason;
				return A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$doClose, state, key, reason);
			case 'PIConnected':
				var key = mess.a.key;
				var description = mess.a.description;
				var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
				if (!_Utils_eq(socketState.phase, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectingPhase)) {
					return _Utils_Tuple2(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$UnexpectedConnectedError(
								{description: description, key: key})));
				} else {
					var newState = _Utils_update(
						state,
						{
							socketStates: A3(
								$elm$core$Dict$insert,
								key,
								_Utils_update(
									socketState,
									{backoff: 0, phase: $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedPhase}),
								state.socketStates)
						});
					return (!socketState.backoff) ? _Utils_Tuple2(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(newState),
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedResponse(
							{description: description, key: key})) : A3(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$processQueuedMessage,
						newState,
						key,
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$ReconnectedResponse(
							{description: description, key: key}));
				}
			case 'PIMessageReceived':
				var key = mess.a.key;
				var message = mess.a.message;
				var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
				return (!_Utils_eq(socketState.phase, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectedPhase)) ? _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$UnexpectedMessageError(
							{key: key, message: message}))) : _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
					socketState.keepAlive ? $billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse : $billstclair$elm_websocket_client$PortFunnel$WebSocket$MessageReceivedResponse(
						{key: key, message: message}));
			case 'PIClosed':
				var closedRecord = mess.a;
				var key = closedRecord.key;
				var bytesQueued = closedRecord.bytesQueued;
				var code = closedRecord.code;
				var reason = closedRecord.reason;
				var wasClean = closedRecord.wasClean;
				var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
				var expected = _Utils_eq(socketState.phase, $billstclair$elm_websocket_client$PortFunnel$WebSocket$ClosingPhase);
				return ((!expected) && (!A2($elm$core$Set$member, key, state.noAutoReopenKeys))) ? A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$handleUnexpectedClose, state, closedRecord) : _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
						_Utils_update(
							state,
							{
								socketStates: A2($elm$core$Dict$remove, key, state.socketStates)
							})),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$ClosedResponse(
						{
							code: $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCode(code),
							expected: expected,
							key: key,
							reason: reason,
							wasClean: wasClean
						}));
			case 'PIBytesQueued':
				var key = mess.a.key;
				var bufferedAmount = mess.a.bufferedAmount;
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse);
			case 'PIDelayed':
				var id = mess.a.id;
				var _v1 = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getContinuation, id, state);
				if (_v1.$ === 'Nothing') {
					return _Utils_Tuple2(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse);
				} else {
					var _v2 = _v1.a;
					var key = _v2.a;
					var kind = _v2.b;
					var state2 = _v2.c;
					if (kind.$ === 'DrainOutputQueue') {
						return A3($billstclair$elm_websocket_client$PortFunnel$WebSocket$processQueuedMessage, state2, key, $billstclair$elm_websocket_client$PortFunnel$WebSocket$NoResponse);
					} else {
						var socketState = A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$getSocketState, key, state);
						var url = socketState.url;
						return (url !== '') ? _Utils_Tuple2(
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(
								_Utils_update(
									state2,
									{
										socketStates: A3(
											$elm$core$Dict$insert,
											key,
											_Utils_update(
												socketState,
												{phase: $billstclair$elm_websocket_client$PortFunnel$WebSocket$ConnectingPhase}),
											state.socketStates)
									})),
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$CmdResponse(
								$billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$POOpen(
									{key: key, url: url}))) : A2(
							$billstclair$elm_websocket_client$PortFunnel$WebSocket$unexpectedClose,
							state,
							{
								bytesQueued: 0,
								code: $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCodeNumber($billstclair$elm_websocket_client$PortFunnel$WebSocket$AbnormalClosure),
								key: key,
								reason: 'Missing URL for reconnect',
								wasClean: false
							});
					}
				}
			case 'PIError':
				var key = mess.a.key;
				var code = mess.a.code;
				var description = mess.a.description;
				var name = mess.a.name;
				var message = mess.a.message;
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$LowLevelError(
							{code: code, description: description, key: key, message: message, name: name})));
			default:
				return _Utils_Tuple2(
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$State(state),
					$billstclair$elm_websocket_client$PortFunnel$WebSocket$ErrorResponse(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$InvalidMessageError(
							{message: mess})));
		}
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleDesc = A4($billstclair$elm_port_funnel$PortFunnel$makeModuleDesc, $billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleName, $billstclair$elm_websocket_client$PortFunnel$WebSocket$encode, $billstclair$elm_websocket_client$PortFunnel$WebSocket$decode, $billstclair$elm_websocket_client$PortFunnel$WebSocket$process);
var $author$project$PortFunnels$websocketAccessors = A2(
	$billstclair$elm_port_funnel$PortFunnel$StateAccessors,
	function ($) {
		return $.websocket;
	},
	F2(
		function (substate, state) {
			return _Utils_update(
				state,
				{websocket: substate});
		}));
var $author$project$PortFunnels$handlerToFunnel = function (handler) {
	if (handler.$ === 'WebSocketHandler') {
		var websocketHandler = handler.a;
		return _Utils_Tuple2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleName,
			$author$project$PortFunnels$WebSocketFunnel(
				A4($billstclair$elm_port_funnel$PortFunnel$FunnelSpec, $author$project$PortFunnels$websocketAccessors, $billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleDesc, $billstclair$elm_websocket_client$PortFunnel$WebSocket$commander, websocketHandler)));
	} else {
		var localStorageHandler = handler.a;
		return _Utils_Tuple2(
			$billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName,
			$author$project$PortFunnels$LocalStorageFunnel(
				A4($billstclair$elm_port_funnel$PortFunnel$FunnelSpec, $author$project$PortFunnels$localStorageAccessors, $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleDesc, $billstclair$elm_localstorage$PortFunnel$LocalStorage$commander, localStorageHandler)));
	}
};
var $author$project$PortFunnels$makeFunnelDict = F2(
	function (handlers, portGetter) {
		return _Utils_Tuple2(
			$elm$core$Dict$fromList(
				A2($elm$core$List$map, $author$project$PortFunnels$handlerToFunnel, handlers)),
			portGetter);
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$makeOpenWithKey = F2(
	function (key, url) {
		return $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillOpen(
			{keepAlive: false, key: key, url: url});
	});
var $elm$core$Elm$JsArray$map = _JsArray_map;
var $elm$core$Array$map = F2(
	function (func, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = function (node) {
			if (node.$ === 'SubTree') {
				var subTree = node.a;
				return $elm$core$Array$SubTree(
					A2($elm$core$Elm$JsArray$map, helper, subTree));
			} else {
				var values = node.a;
				return $elm$core$Array$Leaf(
					A2($elm$core$Elm$JsArray$map, func, values));
			}
		};
		return A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			A2($elm$core$Elm$JsArray$map, helper, tree),
			A2($elm$core$Elm$JsArray$map, func, tail));
	});
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (maybe.$ === 'Just') {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $author$project$Main$setField = F3(
	function (field, value, model) {
		var oldForm = model.formFields;
		var newForm = function () {
			switch (field.$) {
				case 'GameIdField':
					return _Utils_update(
						oldForm,
						{gameId: value});
				case 'UsernameField':
					return _Utils_update(
						oldForm,
						{username: value});
				case 'UsernamePlaceholder':
					return _Utils_update(
						oldForm,
						{usernamePlaceholder: value});
				default:
					return _Utils_update(
						oldForm,
						{text: value});
			}
		}();
		return _Utils_update(
			model,
			{formFields: newForm});
	});
var $author$project$Main$maybeSetField = F2(
	function (field, value) {
		if (value.$ === 'Just') {
			var v = value.a;
			return A2($author$project$Main$setField, field, v);
		} else {
			return $elm$core$Basics$identity;
		}
	});
var $author$project$Protocol$PersonalDetails = F2(
	function (myId, amAdministrator) {
		return {amAdministrator: amAdministrator, myId: myId};
	});
var $author$project$Protocol$PersonalDetailsResponse = function (a) {
	return {$: 'PersonalDetailsResponse', a: a};
};
var $author$project$Protocol$personalDetailsParser = _Utils_Tuple2(
	A3(
		$elm$json$Json$Decode$map2,
		$author$project$Protocol$PersonalDetails,
		A2($elm$json$Json$Decode$field, 'my_id', $elm$json$Json$Decode$int),
		A2($elm$json$Json$Decode$field, 'am_administrator', $elm$json$Json$Decode$bool)),
	function (v) {
		return $author$project$Protocol$PersonalDetailsResponse(v);
	});
var $author$project$Protocol$PreviousImagePackageResponse = function (a) {
	return {$: 'PreviousImagePackageResponse', a: a};
};
var $author$project$Protocol$previousImagePackageParser = _Utils_Tuple2(
	A2($elm$json$Json$Decode$field, 'url', $elm$json$Json$Decode$string),
	function (v) {
		return $author$project$Protocol$PreviousImagePackageResponse(v);
	});
var $author$project$Protocol$PreviousTextPackageResponse = function (a) {
	return {$: 'PreviousTextPackageResponse', a: a};
};
var $author$project$Protocol$previousTextPackageParser = _Utils_Tuple2(
	A2($elm$json$Json$Decode$field, 'text', $elm$json$Json$Decode$string),
	function (v) {
		return $author$project$Protocol$PreviousTextPackageResponse(v);
	});
var $billstclair$elm_port_funnel$PortFunnel$process = F4(
	function (accessors, _v0, genericMessage, state) {
		var moduleDesc = _v0.a;
		var _v1 = moduleDesc.decoder(genericMessage);
		if (_v1.$ === 'Err') {
			var err = _v1.a;
			return $elm$core$Result$Err(err);
		} else {
			var message = _v1.a;
			var substate = accessors.get(state);
			var _v2 = A2(moduleDesc.process, message, substate);
			var substate2 = _v2.a;
			var response = _v2.b;
			return $elm$core$Result$Ok(
				_Utils_Tuple2(
					A2(accessors.set, substate2, state),
					response));
		}
	});
var $Janiczek$cmd_extra$Cmd$Extra$withCmds = F2(
	function (cmds, model) {
		return _Utils_Tuple2(
			model,
			$elm$core$Platform$Cmd$batch(cmds));
	});
var $billstclair$elm_port_funnel$PortFunnel$appProcess = F5(
	function (cmdPort, genericMessage, funnel, state, model) {
		var _v0 = A4($billstclair$elm_port_funnel$PortFunnel$process, funnel.accessors, funnel.moduleDesc, genericMessage, state);
		if (_v0.$ === 'Err') {
			var error = _v0.a;
			return $elm$core$Result$Err(error);
		} else {
			var _v1 = _v0.a;
			var state2 = _v1.a;
			var response = _v1.b;
			var gmToCmdPort = function (gm) {
				return cmdPort(
					$billstclair$elm_port_funnel$PortFunnel$encodeGenericMessage(gm));
			};
			var cmd = A2(funnel.commander, gmToCmdPort, response);
			var _v2 = A3(funnel.handler, response, state2, model);
			var model2 = _v2.a;
			var cmd2 = _v2.b;
			return $elm$core$Result$Ok(
				A2(
					$Janiczek$cmd_extra$Cmd$Extra$withCmds,
					_List_fromArray(
						[cmd, cmd2]),
					model2));
		}
	});
var $author$project$PortFunnels$appTrampoline = F5(
	function (portGetter, genericMessage, funnel, state, model) {
		if (funnel.$ === 'WebSocketFunnel') {
			var appFunnel = funnel.a;
			return A5(
				$billstclair$elm_port_funnel$PortFunnel$appProcess,
				A2(portGetter, $billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleName, model),
				genericMessage,
				appFunnel,
				state,
				model);
		} else {
			var appFunnel = funnel.a;
			return A5(
				$billstclair$elm_port_funnel$PortFunnel$appProcess,
				A2(portGetter, $billstclair$elm_localstorage$PortFunnel$LocalStorage$moduleName, model),
				genericMessage,
				appFunnel,
				state,
				model);
		}
	});
var $billstclair$elm_port_funnel$PortFunnel$decodeValue = F2(
	function (decoder, value) {
		var _v0 = A2($elm$json$Json$Decode$decodeValue, decoder, value);
		if (_v0.$ === 'Ok') {
			var res = _v0.a;
			return $elm$core$Result$Ok(res);
		} else {
			var err = _v0.a;
			return $elm$core$Result$Err(
				$elm$json$Json$Decode$errorToString(err));
		}
	});
var $billstclair$elm_port_funnel$PortFunnel$genericMessageDecoder = A4(
	$elm$json$Json$Decode$map3,
	$billstclair$elm_port_funnel$PortFunnel$GenericMessage,
	A2($elm$json$Json$Decode$field, 'module', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'tag', $elm$json$Json$Decode$string),
	A2($elm$json$Json$Decode$field, 'args', $elm$json$Json$Decode$value));
var $billstclair$elm_port_funnel$PortFunnel$decodeGenericMessage = function (value) {
	return A2($billstclair$elm_port_funnel$PortFunnel$decodeValue, $billstclair$elm_port_funnel$PortFunnel$genericMessageDecoder, value);
};
var $billstclair$elm_port_funnel$PortFunnel$processValue = F5(
	function (funnels, appTrampoline, value, state, model) {
		var _v0 = $billstclair$elm_port_funnel$PortFunnel$decodeGenericMessage(value);
		if (_v0.$ === 'Err') {
			var error = _v0.a;
			return $elm$core$Result$Err(error);
		} else {
			var genericMessage = _v0.a;
			var moduleName = genericMessage.moduleName;
			var _v1 = A2($elm$core$Dict$get, moduleName, funnels);
			if (_v1.$ === 'Just') {
				var funnel = _v1.a;
				var _v2 = A4(appTrampoline, genericMessage, funnel, state, model);
				if (_v2.$ === 'Err') {
					var error = _v2.a;
					return $elm$core$Result$Err(error);
				} else {
					var _v3 = _v2.a;
					var model2 = _v3.a;
					var cmd = _v3.b;
					return $elm$core$Result$Ok(
						_Utils_Tuple2(model2, cmd));
				}
			} else {
				return $elm$core$Result$Err('Unknown moduleName: ' + moduleName);
			}
		}
	});
var $author$project$PortFunnels$processValue = F4(
	function (_v0, value, state, model) {
		var funnelDict = _v0.a;
		var portGetter = _v0.b;
		return A5(
			$billstclair$elm_port_funnel$PortFunnel$processValue,
			funnelDict,
			$author$project$PortFunnels$appTrampoline(portGetter),
			value,
			state,
			model);
	});
var $elm$browser$Browser$Navigation$pushUrl = _Browser_pushUrl;
var $billstclair$elm_localstorage$PortFunnel$LocalStorage$put = $billstclair$elm_localstorage$PortFunnel$InternalTypes$Put;
var $author$project$Main$putLocalStorageString = F3(
	function (model, key, value) {
		return A2(
			$author$project$Main$sendLocalStorage,
			model,
			A2(
				$billstclair$elm_localstorage$PortFunnel$LocalStorage$put,
				key,
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$string(value))));
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$isReconnectedResponse = function (response) {
	if (response.$ === 'ReconnectedResponse') {
		return true;
	} else {
		return false;
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$reconnectedResponses = function (response) {
	switch (response.$) {
		case 'ReconnectedResponse':
			return _List_fromArray(
				[response]);
		case 'ListResponse':
			var list = response.a;
			return A2($elm$core$List$filter, $billstclair$elm_websocket_client$PortFunnel$WebSocket$isReconnectedResponse, list);
		default:
			return _List_Nil;
	}
};
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$makeSend = F2(
	function (key, message) {
		return $billstclair$elm_websocket_client$PortFunnel$WebSocket$InternalMessage$PWillSend(
			{key: key, message: message});
	});
var $author$project$Protocol$prepareSocketCommandJson = F2(
	function (commandType, data) {
		if (data.$ === 'Nothing') {
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string(commandType))
					]));
		} else {
			var d = data.a;
			return $elm$json$Json$Encode$object(
				_List_fromArray(
					[
						_Utils_Tuple2(
						'type',
						$elm$json$Json$Encode$string(commandType)),
						_Utils_Tuple2('data', d)
					]));
		}
	});
var $author$project$Protocol$prepareSocketCommand = function (command) {
	switch (command.$) {
		case 'Ping':
			return A2($author$project$Protocol$prepareSocketCommandJson, 'ping', $elm$core$Maybe$Nothing);
		case 'NewGameCommand':
			var username = command.a;
			return A2(
				$author$project$Protocol$prepareSocketCommandJson,
				'new_game',
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'username',
								$elm$json$Json$Encode$string(username))
							]))));
		case 'LeaveCommand':
			return A2($author$project$Protocol$prepareSocketCommandJson, 'leave_game', $elm$core$Maybe$Nothing);
		case 'JoinCommand':
			var gameId = command.a;
			var username = command.b;
			return A2(
				$author$project$Protocol$prepareSocketCommandJson,
				'join_game',
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'game_id',
								$elm$json$Json$Encode$string(gameId)),
								_Utils_Tuple2(
								'username',
								$elm$json$Json$Encode$string(username))
							]))));
		case 'StartCommand':
			return A2($author$project$Protocol$prepareSocketCommandJson, 'start_game', $elm$core$Maybe$Nothing);
		case 'KickCommand':
			var playerId = command.a;
			return A2(
				$author$project$Protocol$prepareSocketCommandJson,
				'kick_player',
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'player_id',
								$elm$json$Json$Encode$int(playerId))
							]))));
		case 'UuidCommand':
			var uuid = command.a;
			return A2(
				$author$project$Protocol$prepareSocketCommandJson,
				'my_uuid',
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$string(uuid)));
		case 'TextPackageCommand':
			var text = command.a;
			return A2(
				$author$project$Protocol$prepareSocketCommandJson,
				'text_package',
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'text',
								$elm$json$Json$Encode$string(text))
							]))));
		case 'ImagePackageCommand':
			var image = command.a;
			return A2(
				$author$project$Protocol$prepareSocketCommandJson,
				'image_package',
				$elm$core$Maybe$Just(
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'data',
								$elm$json$Json$Encode$string(image))
							]))));
		default:
			return A2($author$project$Protocol$prepareSocketCommandJson, 'next_round', $elm$core$Maybe$Nothing);
	}
};
var $billstclair$elm_websocket_client$PortFunnel$WebSocket$send = $billstclair$elm_port_funnel$PortFunnel$sendMessage($billstclair$elm_websocket_client$PortFunnel$WebSocket$moduleDesc);
var $author$project$Main$sendWebSocket = function (message) {
	return A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$send, $author$project$Main$cmdPort, message);
};
var $author$project$Main$wsKey = 'mainws';
var $author$project$Main$sendSocketCommand = function (command) {
	return $author$project$Main$sendWebSocket(
		A2(
			$billstclair$elm_websocket_client$PortFunnel$WebSocket$makeSend,
			$author$project$Main$wsKey,
			A2(
				$elm$json$Json$Encode$encode,
				0,
				$author$project$Protocol$prepareSocketCommand(command))));
};
var $elm$core$Result$toMaybe = function (result) {
	if (result.$ === 'Ok') {
		var v = result.a;
		return $elm$core$Maybe$Just(v);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$url$Url$addPort = F2(
	function (maybePort, starter) {
		if (maybePort.$ === 'Nothing') {
			return starter;
		} else {
			var port_ = maybePort.a;
			return starter + (':' + $elm$core$String$fromInt(port_));
		}
	});
var $elm$url$Url$addPrefixed = F3(
	function (prefix, maybeSegment, starter) {
		if (maybeSegment.$ === 'Nothing') {
			return starter;
		} else {
			var segment = maybeSegment.a;
			return _Utils_ap(
				starter,
				_Utils_ap(prefix, segment));
		}
	});
var $elm$url$Url$toString = function (url) {
	var http = function () {
		var _v0 = url.protocol;
		if (_v0.$ === 'Http') {
			return 'http://';
		} else {
			return 'https://';
		}
	}();
	return A3(
		$elm$url$Url$addPrefixed,
		'#',
		url.fragment,
		A3(
			$elm$url$Url$addPrefixed,
			'?',
			url.query,
			_Utils_ap(
				A2(
					$elm$url$Url$addPort,
					url.port_,
					_Utils_ap(http, url.host)),
				url.path)));
};
var $author$project$Main$posixTimeDifferenceSeconds = F2(
	function (a, b) {
		return ($elm$time$Time$posixToMillis(a) - $elm$time$Time$posixToMillis(b)) / 1000;
	});
var $author$project$Main$updatePlayerTime = F2(
	function (currentTime, player) {
		var _v0 = player.status;
		if (_v0.$ === 'Working') {
			var timeLeft = _v0.a;
			return _Utils_update(
				player,
				{
					status: $author$project$Protocol$Working(
						A2(
							$elm$core$Maybe$withDefault,
							0,
							A2(
								$elm$core$Maybe$map,
								function (d) {
									return A2($author$project$Main$posixTimeDifferenceSeconds, d, currentTime);
								},
								player.deadline)))
				});
		} else {
			return player;
		}
	});
var $author$project$Protocol$UuidResponse = function (a) {
	return {$: 'UuidResponse', a: a};
};
var $author$project$Protocol$uuidParser = _Utils_Tuple2(
	$elm$json$Json$Decode$string,
	function (s) {
		return $author$project$Protocol$UuidResponse(s);
	});
var $elm$core$Result$withDefault = F2(
	function (def, result) {
		if (result.$ === 'Ok') {
			var a = result.a;
			return a;
		} else {
			return def;
		}
	});
var $author$project$Protocol$AllWorkloadsResponse = function (a) {
	return {$: 'AllWorkloadsResponse', a: a};
};
var $elm$json$Json$Decode$array = _Json_decodeArray;
var $author$project$Protocol$WorkPackageDetails = F2(
	function (playerId, data) {
		return {data: data, playerId: playerId};
	});
var $author$project$Protocol$workpackageDecoder = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			A2(
			$elm$json$Json$Decode$map,
			$author$project$Protocol$TextPackage,
			A2($elm$json$Json$Decode$field, 'text', $elm$json$Json$Decode$string)),
			A2(
			$elm$json$Json$Decode$map,
			$author$project$Protocol$ImagePackage,
			A2($elm$json$Json$Decode$field, 'url', $elm$json$Json$Decode$string))
		]));
var $author$project$Protocol$workpackageDetailsDecoder = A3(
	$elm$json$Json$Decode$map2,
	$author$project$Protocol$WorkPackageDetails,
	A2($elm$json$Json$Decode$field, 'player_id', $elm$json$Json$Decode$int),
	A2(
		$elm$json$Json$Decode$field,
		'data',
		$elm$json$Json$Decode$nullable($author$project$Protocol$workpackageDecoder)));
var $author$project$Protocol$workloadDecoder = A2(
	$elm$json$Json$Decode$field,
	'packages',
	$elm$json$Json$Decode$list($author$project$Protocol$workpackageDetailsDecoder));
var $author$project$Protocol$workloadsParser = _Utils_Tuple2(
	$elm$json$Json$Decode$array($author$project$Protocol$workloadDecoder),
	function (v) {
		return $author$project$Protocol$AllWorkloadsResponse(v);
	});
var $author$project$Main$wsUrl = 'ws://192.168.1.11:3030/ws';
var $author$project$Main$socketHandler = F3(
	function (response, state, mdl) {
		var model = _Utils_update(
			mdl,
			{funnelState: state});
		switch (response.$) {
			case 'MessageReceivedResponse':
				var message = response.a.message;
				var typeDecoder = A2($elm$json$Json$Decode$field, 'type', $elm$json$Json$Decode$string);
				var typeString = A2($elm$json$Json$Decode$decodeString, typeDecoder, message);
				var decodeData = function (decoder) {
					return A2(
						$elm$json$Json$Decode$decodeString,
						A2($elm$json$Json$Decode$field, 'data', decoder),
						message);
				};
				var decodeDataUsingParser = function (parser) {
					var _v18 = decodeData(parser.a);
					if (_v18.$ === 'Err') {
						var e = _v18.a;
						return $author$project$Protocol$ErrorResponse(
							$elm$json$Json$Decode$errorToString(e));
					} else {
						var v = _v18.a;
						return A2($elm$core$Tuple$second, parser, v);
					}
				};
				var received = function () {
					if (typeString.$ === 'Err') {
						var e = typeString.a;
						return $author$project$Protocol$ErrorResponse(
							$elm$json$Json$Decode$errorToString(e));
					} else {
						var s = typeString.a;
						switch (s) {
							case 'pong':
								return $author$project$Protocol$ErrorResponse('ping');
							case 'error':
								return decodeDataUsingParser($author$project$Protocol$errorParser);
							case 'game_details':
								return decodeDataUsingParser($author$project$Protocol$gameDetailsParser);
							case 'personal_details':
								return decodeDataUsingParser($author$project$Protocol$personalDetailsParser);
							case 'your_uuid':
								return decodeDataUsingParser($author$project$Protocol$uuidParser);
							case 'left_game':
								return $author$project$Protocol$LeftGameResponse;
							case 'previous_text_package':
								return decodeDataUsingParser($author$project$Protocol$previousTextPackageParser);
							case 'previous_image_package':
								return decodeDataUsingParser($author$project$Protocol$previousImagePackageParser);
							case 'all_workloads':
								return decodeDataUsingParser($author$project$Protocol$workloadsParser);
							default:
								return $author$project$Protocol$ErrorResponse('Unknown response type received');
						}
					}
				}();
				return A2(
					$author$project$Main$update,
					$author$project$Main$SocketReceive(
						A2($elm$core$Debug$log, 'rcvMSG', received)),
					model);
			case 'ConnectedResponse':
				return _Utils_Tuple2(
					model,
					A2($author$project$Main$getLocalStorageString, model, 'uuid'));
			case 'ClosedResponse':
				var code = response.a.code;
				return _Utils_Tuple2(
					model,
					$author$project$Main$errorLog(
						'Websocket connection closed: ' + $billstclair$elm_websocket_client$PortFunnel$WebSocket$closedCodeToString(code)));
			case 'ErrorResponse':
				var error = response.a;
				return _Utils_Tuple2(
					model,
					$author$project$Main$errorLog(
						$billstclair$elm_websocket_client$PortFunnel$WebSocket$errorToString(error)));
			default:
				var _v19 = $billstclair$elm_websocket_client$PortFunnel$WebSocket$reconnectedResponses(response);
				if (!_v19.b) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					if ((_v19.a.$ === 'ReconnectedResponse') && (!_v19.b.b)) {
						var r = _v19.a.a;
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						var list = _v19;
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				}
		}
	});
var $author$project$Main$storageHandler = F3(
	function (response, state, mdl) {
		var model = _Utils_update(
			mdl,
			{funnelState: state});
		if (response.$ === 'GetResponse') {
			var label = response.a.label;
			var key = response.a.key;
			var value = response.a.value;
			var string = function () {
				if (value.$ === 'Nothing') {
					return $elm$core$Maybe$Nothing;
				} else {
					var v = value.a;
					return $elm$core$Result$toMaybe(
						A2($elm$json$Json$Decode$decodeValue, $elm$json$Json$Decode$string, v));
				}
			}();
			return A2(
				$author$project$Main$update,
				A2($author$project$Main$StorageReceive, key, string),
				model);
		} else {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		update:
		while (true) {
			switch (msg.$) {
				case 'LinkClicked':
					var urlRequest = msg.a;
					if (urlRequest.$ === 'Internal') {
						var url = urlRequest.a;
						return _Utils_Tuple2(
							model,
							A2(
								$elm$browser$Browser$Navigation$pushUrl,
								model.key,
								$elm$url$Url$toString(url)));
					} else {
						var href = urlRequest.a;
						return _Utils_Tuple2(
							model,
							$elm$browser$Browser$Navigation$load(href));
					}
				case 'UrlChanged':
					var url = msg.a;
					var mdl = function () {
						var _v2 = url.fragment;
						if (_v2.$ === 'Just') {
							var f = _v2.a;
							return A3($author$project$Main$setField, $author$project$Main$GameIdField, f, model);
						} else {
							return model;
						}
					}();
					return _Utils_Tuple2(
						_Utils_update(
							mdl,
							{url: url}),
						$elm$core$Platform$Cmd$none);
				case 'Tick':
					var newTime = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								lastUpdate: $elm$core$Maybe$Just(newTime),
								players: function () {
									var _v3 = model.lastUpdate;
									if (_v3.$ === 'Nothing') {
										return model.players;
									} else {
										var lastUpdate = _v3.a;
										return A2(
											$elm$core$Array$map,
											$author$project$Main$updatePlayerTime(newTime),
											model.players);
									}
								}()
							}),
						A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$isConnected, $author$project$Main$wsKey, model.funnelState.websocket) ? $elm$core$Platform$Cmd$none : $elm$core$Platform$Cmd$none);
				case 'NoAction':
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				case 'NewGame':
					return _Utils_Tuple2(
						model,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Main$sendSocketCommand(
									$author$project$Protocol$NewGameCommand(model.formFields.username)),
									A3($author$project$Main$putLocalStorageString, model, 'username', model.formFields.username)
								])));
				case 'JoinGame':
					return _Utils_Tuple2(
						model,
						$elm$core$Platform$Cmd$batch(
							_List_fromArray(
								[
									$author$project$Main$sendSocketCommand(
									A2($author$project$Protocol$JoinCommand, model.formFields.gameId, model.formFields.username)),
									A3($author$project$Main$putLocalStorageString, model, 'username', model.formFields.username)
								])));
				case 'StartGame':
					return _Utils_Tuple2(
						model,
						$author$project$Main$sendSocketCommand($author$project$Protocol$StartCommand));
				case 'LeaveGame':
					return _Utils_Tuple2(
						$author$project$Main$leaveGame(model),
						$author$project$Main$sendSocketCommand($author$project$Protocol$LeaveCommand));
				case 'SubmitText':
					return _Utils_Tuple2(
						model,
						$author$project$Main$sendSocketCommand(
							$author$project$Protocol$TextPackageCommand(model.formFields.text)));
				case 'SubmitImage':
					return _Utils_Tuple2(
						model,
						$author$project$Main$canvasPort(
							_Utils_Tuple2('snap', $elm$core$Maybe$Nothing)));
				case 'KickPlayer':
					var value = msg.a;
					return _Utils_Tuple2(
						model,
						$author$project$Main$sendSocketCommand(
							$author$project$Protocol$KickCommand(value)));
				case 'NextRound':
					return _Utils_Tuple2(
						model,
						$author$project$Main$sendSocketCommand($author$project$Protocol$NextRoundCommand));
				case 'SetField':
					var field = msg.a;
					var value = msg.b;
					return _Utils_Tuple2(
						A3($author$project$Main$setField, field, value, model),
						$elm$core$Platform$Cmd$none);
				case 'MoveWorkload':
					var dir = msg.a;
					var workload = function () {
						if (dir.$ === 'Forward') {
							return model.currentWorkload + 1;
						} else {
							return model.currentWorkload - 1;
						}
					}();
					var workload2 = (workload < 0) ? 0 : workload;
					var maxWorkload = $elm$core$Array$length(
						A2($elm$core$Maybe$withDefault, $elm$core$Array$empty, model.workloads)) - 1;
					var workload3 = (_Utils_cmp(workload2, maxWorkload) > 0) ? maxWorkload : workload2;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{currentWorkload: workload3}),
						$elm$core$Platform$Cmd$none);
				case 'Send':
					var value = msg.a;
					return _Utils_Tuple2(
						model,
						$author$project$Main$cmdPort(value));
				case 'Receive':
					var value = msg.a;
					var _v5 = A4(
						$author$project$PortFunnels$processValue,
						$author$project$Main$cyclic$funnelDict(),
						value,
						model.funnelState,
						model);
					if (_v5.$ === 'Err') {
						var error = _v5.a;
						return _Utils_Tuple2(
							model,
							$author$project$Main$errorLog(error));
					} else {
						var res = _v5.a;
						var modul = A2(
							$elm$core$Result$withDefault,
							'none',
							A2(
								$elm$json$Json$Decode$decodeValue,
								A2($elm$json$Json$Decode$field, 'module', $elm$json$Json$Decode$string),
								value));
						if (modul === 'WebSocket') {
							var _v6 = A2(
								$elm$json$Json$Decode$decodeValue,
								A2($elm$json$Json$Decode$field, 'tag', $elm$json$Json$Decode$string),
								value);
							if ((_v6.$ === 'Ok') && (_v6.a === 'startup')) {
								return A2(
									$Janiczek$cmd_extra$Cmd$Extra$addCmd,
									$author$project$Main$sendWebSocket(
										A2($billstclair$elm_websocket_client$PortFunnel$WebSocket$makeOpenWithKey, $author$project$Main$wsKey, $author$project$Main$wsUrl)),
									res);
							} else {
								return res;
							}
						} else {
							return res;
						}
					}
				case 'StorageReceive':
					var key = msg.a;
					var value = msg.b;
					switch (key) {
						case 'username':
							return _Utils_Tuple2(
								A3(
									$author$project$Main$setField,
									$author$project$Main$UsernameField,
									A2($elm$core$Maybe$withDefault, '', value),
									model),
								$elm$core$Platform$Cmd$none);
						case 'uuid':
							if (value.$ === 'Just') {
								var uuid = value.a;
								return _Utils_Tuple2(
									_Utils_update(
										model,
										{
											uuid: $elm$core$Maybe$Just(uuid)
										}),
									$author$project$Main$sendSocketCommand(
										$author$project$Protocol$UuidCommand(uuid)));
							} else {
								return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
							}
						default:
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					}
				case 'SocketReceive':
					var value = msg.a;
					switch (value.$) {
						case 'GameDetailsResponse':
							var details = value.a;
							var playerCreator = F2(
								function (id, player) {
									return {
										deadline: (!player.deadline) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
											$elm$time$Time$millisToPosix(player.deadline * 1000)),
										image: player.imageUrl,
										isAdministrator: player.isAdmin,
										isMe: A2(
											$elm$core$Maybe$withDefault,
											false,
											A2(
												$elm$core$Maybe$map,
												function (i) {
													return _Utils_eq(i, id);
												},
												model.myId)),
										status: player.stuck ? $author$project$Protocol$Stuck : player.status,
										username: player.username
									};
								});
							var players = A2(
								$elm$core$Array$indexedMap,
								playerCreator,
								$elm$core$Array$fromList(details.players));
							var me = A2(
								$elm$core$Maybe$andThen,
								function (id) {
									return A2($elm$core$Array$get, id, players);
								},
								model.myId);
							var username = A2(
								$elm$core$Maybe$map,
								function (p) {
									return p.username;
								},
								me);
							var mdl = A3(
								$author$project$Main$maybeSetField,
								$author$project$Main$UsernameField,
								username,
								_Utils_update(
									model,
									{
										gameId: $elm$core$Maybe$Just(details.alias),
										gameKey: $elm$core$Maybe$Just(
											details.uuid + ('-' + $elm$core$String$fromInt(details.currentStage))),
										players: players,
										status: details.status
									}));
							return _Utils_Tuple2(
								mdl,
								$elm$core$Platform$Cmd$batch(
									_List_fromArray(
										[
											A2(
											$elm$core$Maybe$withDefault,
											$elm$core$Platform$Cmd$none,
											A2(
												$elm$core$Maybe$map,
												function (p) {
													return A3($author$project$Main$putLocalStorageString, mdl, 'username', p.username);
												},
												me)),
											_Utils_eq(
											mdl.url,
											$author$project$Main$getGameLink(mdl)) ? $elm$core$Platform$Cmd$none : A2(
											$elm$browser$Browser$Navigation$pushUrl,
											mdl.key,
											$elm$url$Url$toString(
												$author$project$Main$getGameLink(mdl)))
										])));
						case 'ErrorResponse':
							var error = value.a;
							return _Utils_Tuple2(
								model,
								$author$project$Main$errorLog(error));
						case 'PongResponse':
							return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
						case 'PersonalDetailsResponse':
							var details = value.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										amAdministrator: details.amAdministrator,
										myId: $elm$core$Maybe$Just(details.myId),
										players: A2(
											$elm$core$Array$indexedMap,
											function (i) {
												return function (p) {
													return _Utils_update(
														p,
														{
															isMe: _Utils_eq(i, details.myId)
														});
												};
											},
											model.players)
									}),
								$elm$core$Platform$Cmd$none);
						case 'UuidResponse':
							var uuid = value.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										uuid: $elm$core$Maybe$Just(uuid)
									}),
								A3($author$project$Main$putLocalStorageString, model, 'uuid', uuid));
						case 'LeftGameResponse':
							return _Utils_Tuple2(
								$author$project$Main$leaveGame(model),
								$elm$core$Platform$Cmd$none);
						case 'PreviousTextPackageResponse':
							var text = value.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										previousPackage: $elm$core$Maybe$Just(
											$author$project$Protocol$TextPackage(text))
									}),
								$elm$core$Platform$Cmd$none);
						case 'PreviousImagePackageResponse':
							var path = value.a;
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										previousPackage: $elm$core$Maybe$Just(
											$author$project$Protocol$ImagePackage(
												_Utils_ap($author$project$Main$imageUrl, path)))
									}),
								$elm$core$Platform$Cmd$none);
						default:
							var workloads = value.a;
							var correctURL = function (data) {
								if ((data.$ === 'Just') && (data.a.$ === 'ImagePackage')) {
									var url = data.a.a;
									return $elm$core$Maybe$Just(
										$author$project$Protocol$ImagePackage(
											_Utils_ap($author$project$Main$imageUrl, url)));
								} else {
									return data;
								}
							};
							var correctionInner = function (workpackage) {
								return _Utils_update(
									workpackage,
									{
										data: correctURL(workpackage.data)
									});
							};
							var correctionOuter = function (workload) {
								return A2($elm$core$List$map, correctionInner, workload);
							};
							var correctURLs = function (workloads_) {
								return A2($elm$core$Array$map, correctionOuter, workloads_);
							};
							return _Utils_Tuple2(
								_Utils_update(
									model,
									{
										playerCapture: $elm$core$Maybe$Just(model.players),
										workloads: $elm$core$Maybe$Just(
											correctURLs(workloads))
									}),
								$elm$core$Platform$Cmd$none);
					}
				case 'ShowError':
					var value = msg.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								error: $elm$core$Maybe$Just(value)
							}),
						$elm$core$Platform$Cmd$none);
				case 'RemoveError':
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{error: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				case 'ShowConfirmDialog':
					var message = msg.a;
					var newMsg = msg.b;
					var nextDialogId = model.nextDialogId;
					var dict = A3($elm$core$Dict$insert, nextDialogId, newMsg, model.pendingDialogs);
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{nextDialogId: nextDialogId + 1, pendingDialogs: dict}),
						$author$project$Main$confirmPort(
							_Utils_Tuple2(message, nextDialogId)));
				case 'ShownConfirmDialog':
					var _v11 = msg.a;
					var pressed = _v11.a;
					var dialogId = _v11.b;
					var newMsg = A2($elm$core$Dict$get, dialogId, model.pendingDialogs);
					var dict = A2($elm$core$Dict$remove, dialogId, model.pendingDialogs);
					var mdl = _Utils_update(
						model,
						{pendingDialogs: dict});
					if (pressed) {
						if (newMsg.$ === 'Just') {
							var m = newMsg.a;
							var $temp$msg = m,
								$temp$model = mdl;
							msg = $temp$msg;
							model = $temp$model;
							continue update;
						} else {
							return _Utils_Tuple2(mdl, $elm$core$Platform$Cmd$none);
						}
					} else {
						return _Utils_Tuple2(mdl, $elm$core$Platform$Cmd$none);
					}
				default:
					var value = msg.a;
					return _Utils_Tuple2(
						model,
						$author$project$Main$sendSocketCommand(
							$author$project$Protocol$ImagePackageCommand(value)));
			}
		}
	});
function $author$project$Main$cyclic$funnelDict() {
	return A2(
		$author$project$PortFunnels$makeFunnelDict,
		$author$project$Main$cyclic$handlers(),
		F2(
			function (_v20, _v21) {
				return $author$project$Main$cmdPort;
			}));
}
function $author$project$Main$cyclic$handlers() {
	return _List_fromArray(
		[
			$author$project$PortFunnels$WebSocketHandler($author$project$Main$socketHandler),
			$author$project$PortFunnels$LocalStorageHandler($author$project$Main$storageHandler)
		]);
}
try {
	var $author$project$Main$funnelDict = $author$project$Main$cyclic$funnelDict();
	$author$project$Main$cyclic$funnelDict = function () {
		return $author$project$Main$funnelDict;
	};
	var $author$project$Main$handlers = $author$project$Main$cyclic$handlers();
	$author$project$Main$cyclic$handlers = function () {
		return $author$project$Main$handlers;
	};
} catch ($) {
	throw 'Some top-level definitions from `Main` are causing infinite recursion:\n\n  ┌─────┐\n  │    funnelDict\n  │     ↓\n  │    handlers\n  │     ↓\n  │    socketHandler\n  │     ↓\n  │    storageHandler\n  │     ↓\n  │    update\n  └─────┘\n\nThese errors are very tricky, so read https://elm-lang.org/0.19.1/bad-recursion to learn how to fix it!';}
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$html$Html$main_ = _VirtualDom_node('main');
var $author$project$Main$SubmitImage = {$: 'SubmitImage'};
var $elm$virtual_dom$VirtualDom$attribute = F2(
	function (key, value) {
		return A2(
			_VirtualDom_attribute,
			_VirtualDom_noOnOrFormAction(key),
			_VirtualDom_noJavaScriptOrHtmlUri(value));
	});
var $elm$html$Html$Attributes$attribute = $elm$virtual_dom$VirtualDom$attribute;
var $elm$html$Html$button = _VirtualDom_node('button');
var $author$project$Main$getWorkPackageText = function (model) {
	var previousPackage = A2(
		$elm$core$Maybe$withDefault,
		$author$project$Protocol$TextPackage('an armadillo'),
		model.previousPackage);
	if (previousPackage.$ === 'TextPackage') {
		var t = previousPackage.a;
		return t;
	} else {
		return 'An error 500';
	}
};
var $elm$virtual_dom$VirtualDom$node = function (tag) {
	return _VirtualDom_node(
		_VirtualDom_noScript(tag));
};
var $elm$html$Html$node = $elm$virtual_dom$VirtualDom$node;
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 'Normal', a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$html$Html$section = _VirtualDom_node('section');
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Main$viewDrawing = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('drawing hall')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('drawing-prompt')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('drawing-prompt-intro')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('You must draw:')
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('drawing-subject')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$Main$getWorkPackageText(model))
							]))
					])),
				A3(
				$elm$html$Html$node,
				'drawing-canvas',
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('drawing-canvas'),
						A2(
						$elm$html$Html$Attributes$attribute,
						'key',
						A2($elm$core$Maybe$withDefault, '', model.gameKey))
					]),
				_List_Nil),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pure-button pure-button-success landing-button'),
						$elm$html$Html$Events$onClick($author$project$Main$SubmitImage)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('I\'m done!')
					]))
			]));
};
var $author$project$Main$getMe = function (model) {
	return A2(
		$elm$core$Maybe$andThen,
		function (i) {
			return A2($elm$core$Array$get, i, model.players);
		},
		model.myId);
};
var $author$project$Main$isGameRunning = function (model) {
	var _v0 = model.status;
	switch (_v0.$) {
		case 'NoGame':
			return false;
		case 'Lobby':
			return false;
		case 'GameOver':
			return false;
		case 'Starting':
			return true;
		case 'Drawing':
			return true;
		default:
			return true;
	}
};
var $author$project$Main$amDone = function (model) {
	var _v0 = $author$project$Main$getMe(model);
	if (_v0.$ === 'Just') {
		var me = _v0.a;
		return $author$project$Main$isGameRunning(model) && _Utils_eq(me.status, $author$project$Protocol$Done);
	} else {
		return false;
	}
};
var $elm$core$Basics$abs = function (n) {
	return (n < 0) ? (-n) : n;
};
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $elm$core$String$padLeft = F3(
	function (n, _char, string) {
		return _Utils_ap(
			A2(
				$elm$core$String$repeat,
				n - $elm$core$String$length(string),
				$elm$core$String$fromChar(_char)),
			string);
	});
var $author$project$Main$formatTimeDifference = function (seconds) {
	return ((seconds < 0) ? '-' : '') + (A3(
		$elm$core$String$padLeft,
		2,
		_Utils_chr('0'),
		$elm$core$String$fromInt(
			$elm$core$Basics$abs((seconds / 60) | 0))) + (':' + A3(
		$elm$core$String$padLeft,
		2,
		_Utils_chr('0'),
		$elm$core$String$fromInt(
			$elm$core$Basics$abs(seconds % 60)))));
};
var $elm$html$Html$header = _VirtualDom_node('header');
var $elm$core$Basics$round = _Basics_round;
var $elm$html$Html$span = _VirtualDom_node('span');
var $elm$html$Html$Attributes$alt = $elm$html$Html$Attributes$stringProperty('alt');
var $elm$html$Html$img = _VirtualDom_node('img');
var $elm$html$Html$Attributes$src = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'src',
		_VirtualDom_noJavaScriptOrHtmlUri(url));
};
var $author$project$Main$viewPlayerAvatar = function (player) {
	return A2(
		$elm$html$Html$img,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('avatar'),
				$elm$html$Html$Attributes$alt(player.username + ' Avatar'),
				$elm$html$Html$Attributes$src(player.image)
			]),
		_List_Nil);
};
var $author$project$Main$viewHeader = function (model) {
	return A2(
		$elm$html$Html$header,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'game-header' + ($author$project$Main$amDone(model) ? ' game-header-done' : ''))
			]),
		_Utils_ap(
			function () {
				var _v0 = $author$project$Main$getMe(model);
				if (_v0.$ === 'Nothing') {
					return _List_Nil;
				} else {
					var me = _v0.a;
					return _List_fromArray(
						[
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('game-header-me')
								]),
							_List_fromArray(
								[
									$author$project$Main$viewPlayerAvatar(me),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('my-username')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(me.username)
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('my-status')
								]),
							_List_fromArray(
								[
									function () {
									var _v1 = me.status;
									switch (_v1.$) {
										case 'Done':
											return A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('status')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Ready')
													]));
										case 'Working':
											var timeLeft = _v1.a;
											return A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('big-scary-clock')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														$author$project$Main$formatTimeDifference(
															$elm$core$Basics$round(timeLeft)))
													]));
										case 'Uploading':
											var percentage = _v1.a;
											return A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('status')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(
														$elm$core$String$fromInt(
															$elm$core$Basics$floor(percentage * 100)) + '%')
													]));
										default:
											return A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('status')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Stuck')
													]));
									}
								}()
								]))
						]);
				}
			}(),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('game-status')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							function () {
								var _v2 = model.status;
								switch (_v2.$) {
									case 'NoGame':
										return 'Ready';
									case 'Lobby':
										return 'Waiting for Players…';
									case 'Starting':
										return 'Starting…';
									case 'Drawing':
										return 'Drawing…';
									case 'Understanding':
										return 'Understanding…';
									default:
										return 'Game Over';
								}
							}())
						]))
				])));
};
var $author$project$Main$JoinGame = {$: 'JoinGame'};
var $author$project$Main$NewGame = {$: 'NewGame'};
var $elm$html$Html$Attributes$autocomplete = function (bool) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var $elm$html$Html$Attributes$for = $elm$html$Html$Attributes$stringProperty('htmlFor');
var $elm$html$Html$form = _VirtualDom_node('form');
var $elm$html$Html$i = _VirtualDom_node('i');
var $elm$html$Html$input = _VirtualDom_node('input');
var $elm$html$Html$label = _VirtualDom_node('label');
var $elm$html$Html$Attributes$name = $elm$html$Html$Attributes$stringProperty('name');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 'MayStopPropagation', a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Events$alwaysPreventDefault = function (msg) {
	return _Utils_Tuple2(msg, true);
};
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 'MayPreventDefault', a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $elm$html$Html$Events$onSubmit = function (msg) {
	return A2(
		$elm$html$Html$Events$preventDefaultOn,
		'submit',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysPreventDefault,
			$elm$json$Json$Decode$succeed(msg)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$required = $elm$html$Html$Attributes$boolProperty('required');
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Main$viewLanding = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('landing hall')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('landing-join')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$label,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$for('username')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('People usually call me:')
							])),
						A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$input,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('landing-username'),
										$elm$html$Html$Attributes$name('username'),
										$elm$html$Html$Attributes$placeholder(model.formFields.usernamePlaceholder),
										$elm$html$Html$Attributes$required(true),
										$elm$html$Html$Events$onInput(
										$author$project$Main$SetField($author$project$Main$UsernameField)),
										$elm$html$Html$Attributes$autocomplete(true),
										$elm$html$Html$Attributes$value(model.formFields.username)
									]),
								_List_Nil),
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('landing-username-icon'),
										A2($elm$html$Html$Attributes$attribute, 'aria-hidden', 'true')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$i,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('fa fa-user-o')
											]),
										_List_Nil)
									]))
							]))
					])),
				A2(
				$elm$html$Html$form,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('landing-join'),
						$elm$html$Html$Events$onSubmit($author$project$Main$JoinGame)
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$input,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$placeholder('GameId'),
								$elm$html$Html$Attributes$required(true),
								$elm$html$Html$Events$onInput(
								$author$project$Main$SetField($author$project$Main$GameIdField)),
								$elm$html$Html$Attributes$value(model.formFields.gameId),
								$elm$html$Html$Attributes$class('text-tt')
							]),
						_List_Nil),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$type_('submit'),
								$elm$html$Html$Attributes$class('pure-button pure-button-primary landing-button')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Join a running game')
							]))
					])),
				A2(
				$elm$html$Html$button,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pure-button pure-button-primary landing-button'),
						$elm$html$Html$Events$onClick($author$project$Main$NewGame)
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Start a New Game')
					]))
			]));
};
var $author$project$Main$LeaveGame = {$: 'LeaveGame'};
var $author$project$Main$StartGame = {$: 'StartGame'};
var $elm$html$Html$a = _VirtualDom_node('a');
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$Attributes$href = function (url) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'href',
		_VirtualDom_noJavaScriptUri(url));
};
var $elm$html$Html$Attributes$rel = _VirtualDom_attribute('rel');
var $elm$html$Html$Attributes$target = $elm$html$Html$Attributes$stringProperty('target');
var $author$project$Main$viewLobby = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('lobby hall')
			]),
		A2(
			$elm$core$List$cons,
			A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('game-link-presentation')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-muted')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Share the following link to let other people join:')
							])),
						function () {
						var url = $author$project$Main$getGameLink(model);
						return A2(
							$elm$html$Html$a,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('game-link-large text-tt'),
									$elm$html$Html$Attributes$href(
									$elm$url$Url$toString(url)),
									$elm$html$Html$Attributes$target('_blank'),
									$elm$html$Html$Attributes$rel('noopener noreferrer')
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('game-link-protocol')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											function () {
												var _v0 = url.protocol;
												if (_v0.$ === 'Http') {
													return 'http://';
												} else {
													return 'https://';
												}
											}())
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('game-link-host')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											_Utils_ap(
												url.host,
												_Utils_ap(
													A2(
														$elm$core$Maybe$withDefault,
														'',
														A2(
															$elm$core$Maybe$map,
															function (p) {
																return ':' + $elm$core$String$fromInt(p);
															},
															url.port_)),
													url.path)))
										])),
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('game-link-path')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(
											'#' + A2($elm$core$Maybe$withDefault, '', url.fragment))
										]))
								]));
					}()
					])),
			model.amAdministrator ? _List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pure-button pure-button landing-button'),
							$elm$html$Html$Events$onClick($author$project$Main$LeaveGame)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Cancel Game')
						])),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pure-button pure-button-success landing-button'),
							$elm$html$Html$Attributes$disabled(
							$elm$core$Array$length(model.players) <= 1),
							$elm$html$Html$Events$onClick($author$project$Main$StartGame)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Start Game')
						]))
				]) : _List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('pure-button pure-button-danger landing-button'),
							$elm$html$Html$Events$onClick($author$project$Main$LeaveGame)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Leave Game')
						]))
				])));
};
var $author$project$Main$NoAction = {$: 'NoAction'};
var $author$project$Main$RemoveError = {$: 'RemoveError'};
var $author$project$Main$hasGameStarted = function (model) {
	var _v0 = model.gameId;
	if (_v0.$ === 'Nothing') {
		return false;
	} else {
		return true;
	}
};
var $elm$html$Html$li = _VirtualDom_node('li');
var $elm$html$Html$nav = _VirtualDom_node('nav');
var $elm$html$Html$Attributes$title = $elm$html$Html$Attributes$stringProperty('title');
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Main$viewNav = function (model) {
	return A2(
		$elm$html$Html$nav,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('page-header pure-menu pure-menu-horizontal')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pure-menu-heading')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Drawtice')
					])),
				A2(
				$elm$html$Html$ul,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pure-menu-list')
					]),
				_Utils_ap(
					_List_fromArray(
						[
							A2(
							$elm$html$Html$li,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'pure-menu-item' + ((!$author$project$Main$hasGameStarted(model)) ? ' pure-menu-selected' : ''))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pure-menu-link')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('New Game')
										]))
								])),
							A2(
							$elm$html$Html$li,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class(
									'pure-menu-item' + ($author$project$Main$hasGameStarted(model) ? ' pure-menu-selected' : ''))
								]),
							_List_fromArray(
								[
									A2(
									$elm$html$Html$span,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('pure-menu-link')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Current Game')
										]))
								]))
						]),
					_Utils_ap(
						function () {
							var _v0 = model.gameId;
							if (_v0.$ === 'Nothing') {
								return _List_Nil;
							} else {
								return _List_fromArray(
									[
										A2(
										$elm$html$Html$li,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pure-menu-item')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('pure-menu-link')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Share this link to invite other people to join:')
													]))
											])),
										function () {
										var url = $elm$url$Url$toString(
											$author$project$Main$getGameLink(model));
										return A2(
											$elm$html$Html$li,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('pure-menu-item pure-menu-selected')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$a,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('pure-menu-link'),
															$elm$html$Html$Attributes$href(url),
															$elm$html$Html$Events$onClick($author$project$Main$NoAction)
														]),
													_List_fromArray(
														[
															$elm$html$Html$text(url)
														]))
												]));
									}()
									]);
							}
						}(),
						function () {
							var _v1 = model.error;
							if (_v1.$ === 'Nothing') {
								return _List_Nil;
							} else {
								var err = _v1.a;
								return _List_fromArray(
									[
										A2(
										$elm$html$Html$li,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pure-menu-item')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$a,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('pure-menu-link'),
														$elm$html$Html$Events$onClick($author$project$Main$RemoveError),
														$elm$html$Html$Attributes$href('#'),
														$elm$html$Html$Attributes$title('Hide error')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('❌')
													]))
											])),
										A2(
										$elm$html$Html$li,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pure-menu-item')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('pure-menu-heading')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('Error:')
													]))
											])),
										A2(
										$elm$html$Html$li,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pure-menu-item')
											]),
										_List_fromArray(
											[
												A2(
												$elm$html$Html$span,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('pure-menu-link pure-menu-error')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(err)
													]))
											]))
									]);
							}
						}()))),
				A2(
				$elm$html$Html$ul,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('pure-menu-list page-header-fin')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$li,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pure-menu-item')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$a,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('pure-menu-link'),
										$elm$html$Html$Attributes$href('https://github.com/kongr45gpen/drawtice/'),
										$elm$html$Html$Attributes$target('_blank'),
										$elm$html$Html$Attributes$rel('noopener noreferrer')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Github')
									]))
							]))
					]))
			]));
};
var $author$project$Main$NextRound = {$: 'NextRound'};
var $author$project$Main$ShowConfirmDialog = F2(
	function (a, b) {
		return {$: 'ShowConfirmDialog', a: a, b: b};
	});
var $elm$html$Html$aside = _VirtualDom_node('aside');
var $elm$html$Html$em = _VirtualDom_node('em');
var $elm$core$Array$isEmpty = function (_v0) {
	var len = _v0.a;
	return !len;
};
var $author$project$Main$KickPlayer = function (a) {
	return {$: 'KickPlayer', a: a};
};
var $elm$core$String$fromFloat = _String_fromNumber;
var $author$project$Main$viewPlayer = F3(
	function (model, id, player) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class(
					'player' + (player.isMe ? ' me' : ''))
				]),
			_List_fromArray(
				[
					$author$project$Main$viewPlayerAvatar(player),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('username')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(player.username)
						])),
					A2(
					$elm$html$Html$span,
					_List_Nil,
					A2(
						$elm$core$List$cons,
						function () {
							var _v0 = player.status;
							switch (_v0.$) {
								case 'Done':
									return $elm$html$Html$text('Done');
								case 'Working':
									var timeLeft = _v0.a;
									return $elm$html$Html$text(
										'Working, ' + ($author$project$Main$formatTimeDifference(
											$elm$core$Basics$round(timeLeft)) + ' left'));
								case 'Uploading':
									var fraction = _v0.a;
									return $elm$html$Html$text(
										'Uploading (' + ($elm$core$String$fromFloat(fraction * 100) + '% done)'));
								default:
									return $elm$html$Html$text('Hit a wall');
							}
						}(),
						model.amAdministrator ? _List_fromArray(
							[
								A2(
								$elm$html$Html$a,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('kick-button'),
										$elm$html$Html$Attributes$href('#'),
										$elm$html$Html$Events$onClick(
										A2(
											$author$project$Main$ShowConfirmDialog,
											'Are you sure you want to kick ' + (player.username + '?'),
											$author$project$Main$KickPlayer(id)))
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('❌')
									]))
							]) : _List_Nil))
				]));
	});
var $author$project$Main$viewSidebar = function (model) {
	return A2(
		$elm$html$Html$aside,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('sidebar')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('gameId')
					]),
				_Utils_ap(
					_List_fromArray(
						[
							$elm$html$Html$text('Game ID: '),
							function () {
							var _v0 = model.gameId;
							if (_v0.$ === 'Nothing') {
								return A2(
									$elm$html$Html$em,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-muted')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Not Started')
										]));
							} else {
								var id = _v0.a;
								return $elm$html$Html$text(id);
							}
						}()
						]),
					_Utils_ap(
						$elm$core$Array$isEmpty(model.players) ? _List_Nil : _List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('player-list')
									]),
								$elm$core$Array$toList(
									A2(
										$elm$core$Array$indexedMap,
										$author$project$Main$viewPlayer(model),
										model.players)))
							]),
						(model.amAdministrator && $author$project$Main$isGameRunning(model)) ? _List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('admin-actions')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pure-button'),
												$elm$html$Html$Events$onClick(
												A2($author$project$Main$ShowConfirmDialog, 'Are you sure you want to prematurely end this game for all players?', $author$project$Main$LeaveGame))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Cancel Game')
											])),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('pure-button'),
												$elm$html$Html$Events$onClick(
												A2($author$project$Main$ShowConfirmDialog, 'Are you sure you want to quickly end this round?', $author$project$Main$NextRound))
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('End Round')
											]))
									]))
							]) : _Utils_ap(
							_List_Nil,
							_Utils_eq(model.status, $author$project$Protocol$GameOver) ? _List_fromArray(
								[
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('admin-actions')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$button,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('pure-button pure-button-danger'),
													$elm$html$Html$Events$onClick(
													A2($author$project$Main$ShowConfirmDialog, 'Are you sure you want to leave this game?', $author$project$Main$LeaveGame))
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Leave Game')
												]))
										]))
								]) : _List_Nil))))
			]));
};
var $author$project$Main$SubmitText = {$: 'SubmitText'};
var $author$project$Main$TextField = {$: 'TextField'};
var $elm$html$Html$Attributes$action = function (uri) {
	return A2(
		$elm$html$Html$Attributes$stringProperty,
		'action',
		_VirtualDom_noJavaScriptUri(uri));
};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $author$project$Main$viewStarting = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('starting')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$form,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-starting hall'),
						$elm$html$Html$Attributes$action('#')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-starting-prompt')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('What do you want people to draw?')
							])),
						A2(
						$elm$html$Html$textarea,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-starting-input'),
								$elm$html$Html$Events$onInput(
								$author$project$Main$SetField($author$project$Main$TextField))
							]),
						_List_Nil),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pure-button landing-button'),
								$elm$html$Html$Events$onClick($author$project$Main$SubmitText)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Submit idea')
							]))
					]))
			]));
};
var $author$project$Main$Backward = {$: 'Backward'};
var $author$project$Main$Forward = {$: 'Forward'};
var $author$project$Main$MoveWorkload = function (a) {
	return {$: 'MoveWorkload', a: a};
};
var $elm$html$Html$h3 = _VirtualDom_node('h3');
var $author$project$Main$isAtWorkloadEnd = F2(
	function (model, dir) {
		return ((!model.currentWorkload) && _Utils_eq(dir, $author$project$Main$Backward)) ? true : (_Utils_eq(
			model.currentWorkload,
			$elm$core$Array$length(
				A2($elm$core$Maybe$withDefault, $elm$core$Array$empty, model.workloads)) - 1) && _Utils_eq(dir, $author$project$Main$Forward));
	});
var $elm$html$Html$p = _VirtualDom_node('p');
var $author$project$Main$viewWorkpackage = F2(
	function (model, _package) {
		var username = A2(
			$elm$core$Maybe$withDefault,
			'???',
			A2(
				$elm$core$Maybe$map,
				function (p) {
					return p.username;
				},
				A2(
					$elm$core$Maybe$andThen,
					function (a) {
						return A2($elm$core$Array$get, _package.playerId, a);
					},
					model.playerCapture)));
		var html = function () {
			var _v0 = _package.data;
			if (_v0.$ === 'Just') {
				if (_v0.a.$ === 'TextPackage') {
					var t = _v0.a.a;
					return A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('summary-package-text')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(t)
							]));
				} else {
					var url = _v0.a.a;
					return A2(
						$elm$html$Html$img,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('summary-package-image'),
								$elm$html$Html$Attributes$src(url),
								$elm$html$Html$Attributes$alt('Drawn image')
							]),
						_List_Nil);
				}
			} else {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('summary-package-nothing'),
							$elm$html$Html$Attributes$title('The player didn\'t have time to complete this!')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('???')
						]));
			}
		}();
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('summary-package')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('summary-package-prompt')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('by ' + (username + ':'))
						])),
					html
				]));
	});
var $author$project$Main$viewSummary = function (model) {
	var workload = A2(
		$elm$core$Maybe$withDefault,
		_List_Nil,
		A2(
			$elm$core$Maybe$andThen,
			function (a) {
				return A2($elm$core$Array$get, model.currentWorkload, a);
			},
			model.workloads));
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('summary hall')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						'summary-arrow summary-arrow-left' + (A2($author$project$Main$isAtWorkloadEnd, model, $author$project$Main$Backward) ? ' summary-arrow-disabled' : '')),
						$elm$html$Html$Attributes$href('#'),
						$elm$html$Html$Events$onClick(
						$author$project$Main$MoveWorkload($author$project$Main$Backward))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$i,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('fa fa-chevron-left')
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('summary-main')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$h3,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('summary-header')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								'Series ' + $elm$core$String$fromInt(model.currentWorkload + 1))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('summary-container')
							]),
						A2(
							$elm$core$List$map,
							$author$project$Main$viewWorkpackage(model),
							workload))
					])),
				A2(
				$elm$html$Html$a,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class(
						'summary-arrow summary-arrow-right' + (A2($author$project$Main$isAtWorkloadEnd, model, $author$project$Main$Forward) ? ' summary-arrow-disabled' : '')),
						$elm$html$Html$Attributes$href('#'),
						$elm$html$Html$Events$onClick(
						$author$project$Main$MoveWorkload($author$project$Main$Forward))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$i,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('fa fa-chevron-right')
							]),
						_List_Nil)
					]))
			]));
};
var $author$project$Main$getWorkPackageImage = function (model) {
	var _default = $author$project$Main$imageUrl + 'dog.jpg';
	var previousPackage = A2(
		$elm$core$Maybe$withDefault,
		$author$project$Protocol$ImagePackage(_default),
		model.previousPackage);
	if (previousPackage.$ === 'ImagePackage') {
		var p = previousPackage.a;
		return p;
	} else {
		return _default;
	}
};
var $author$project$Main$viewUnderstanding = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('understanding hall')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('understanding-prompt')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('understanding-prompt-intro')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Someone painted:')
							])),
						A2(
						$elm$html$Html$img,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('understanding-image'),
								$elm$html$Html$Attributes$src(
								$author$project$Main$getWorkPackageImage(model)),
								$elm$html$Html$Attributes$alt('What the previous player drew')
							]),
						_List_Nil)
					])),
				A2(
				$elm$html$Html$form,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('understanding-write'),
						$elm$html$Html$Attributes$action('#')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('understanding-write-intro')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('What is that?')
							])),
						A2(
						$elm$html$Html$textarea,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-understanding-input'),
								$elm$html$Html$Events$onInput(
								$author$project$Main$SetField($author$project$Main$TextField))
							]),
						_List_Nil),
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('pure-button landing-button understanding-button'),
								$elm$html$Html$Events$onClick($author$project$Main$SubmitText)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Submit explanation')
							]))
					]))
			]));
};
var $author$project$Main$view = function (model) {
	return {
		body: _List_fromArray(
			[
				$author$project$Main$viewNav(model),
				$author$project$Main$viewHeader(model),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('page-container')
					]),
				_List_fromArray(
					[
						$author$project$Main$viewSidebar(model),
						A2(
						$elm$html$Html$main_,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('page')
							]),
						_List_fromArray(
							[
								function () {
								var _v0 = model.status;
								switch (_v0.$) {
									case 'NoGame':
										return $author$project$Main$viewLanding(model);
									case 'Lobby':
										return $author$project$Main$viewLobby(model);
									case 'Starting':
										return $author$project$Main$viewStarting(model);
									case 'Drawing':
										return $author$project$Main$viewDrawing(model);
									case 'Understanding':
										return $author$project$Main$viewUnderstanding(model);
									default:
										return $author$project$Main$viewSummary(model);
								}
							}()
							]))
					]))
			]),
		title: 'Drawtice'
	};
};
var $author$project$Main$main = $elm$browser$Browser$application(
	{init: $author$project$Main$init, onUrlChange: $author$project$Main$UrlChanged, onUrlRequest: $author$project$Main$LinkClicked, subscriptions: $author$project$Main$subscriptions, update: $author$project$Main$update, view: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(_Utils_Tuple0))(0)}});}(this));