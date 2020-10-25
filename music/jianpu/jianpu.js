var Jianpu = {};

(function(){

// options
var Jdelim = "`", Jesc = "\\`";   // can use other characters
var doTranslate = true;           // false to preserve `..`

// -------------------------------------------------------------------

// globals
var JescReg = RegExp('\\' + Jesc, 'g');

// token types
var NOTE = 0, SPACE = 1, BAR = 2, TIE;

function lexer(str) {
	//console.log(str);
	function warn(i, description) {
		var step = 10;
		var lo = i-step < 0 ? 0 : i-step;
		var hi = i+step > str.length ? str.length : i+step;
		console.warn(str.substring(lo, hi) + '\n'
			+ ' '.repeat(i-lo)
			+ '^ ' + description + " '" + str[i] + "'"
		);
	}
	var tokens = [{type:SPACE}];
	var lastNote, lastNoteIdx;
	var isFirstNote = true;
	var i = 0;
	var value = 0;
	while (i < str.length) {
		if (value == 0 && tokens[tokens.length-1].type != SPACE)
			tokens.push({type:SPACE});
		switch (str[i]) {
			case ' ': case '\t': case '\n': ++i; break;
			case '(': ++i; ++value; break;
			case ')': ++i; --value; break;
			case '|': ++i; tokens.push({type: BAR});
				if (str[i] == '|') {
					++i;
					tokens.push({type: BAR});
				}
				isFirstNote = true;
				break;
			case '-':
				if (lastNote) {
					var token = {type:TIE};
					token.pitch = lastNote.pitch;
					token.octave = lastNote.octave;
					token.value = value;
					token.isFirst = isFirstNote;
					isFirstNote = false;
					++i;
					for (j = i; str[i] == '.'; ++i) {}
					token.dots = i-j;
					tokens[lastNoteIdx].tie = true;
					tokens.push(token);
				}
				break;
			default:
				var token = {type:NOTE};
				var valid = false;
				if (str[i] == '#') {
					token.shift = '\u266f';
					++i;
				} else if (str[i] == 'b') {
					token.shift = '\u266d';
					++i;
				}
				if (/\w/.test(str[i])) {
					valid = true;
					token.pitch = str[i];
					token.value = value;
					++i;
					var j;
					for (j = i; str[i] == "'"; ++i) {}
					token.octave = i-j;
					if (i == j) {
						for (j = i; str[i] == ','; ++i) {}
						token.octave = j-i;
					}
					for (j = i; str[i] == '.'; ++i) {}
					token.dots = i-j;
					tokens.push(token);
					lastNote = token;
					lastNoteIdx = tokens.length-1;
					isFirstNote = false;
				}
				if (!valid) {
					if (token.shift) {
						warn(i-1, "unexpected");
					} else {
						warn(i, "stray character");
						++i;
					}
				}
		}
	}
	return tokens;
}

function newNode(name, child1, child2) {
	// namespace is needed for correct displaying
	var node = document.createElementNS(
	  "http://www.w3.org/1998/Math/MathML", name);
	if (child1)
		node.appendChild(child1);
	if (child2)
		node.appendChild(child2);
	return node;
}

function parser(tokens) {
	//console.log(tokens);
	var frag = document.createDocumentFragment();
	var tieBegin = false;
	var note, tie, tieBody;
	for (var i = 0; i < tokens.length; ++i) {
		if (tokens[i].type == NOTE || tokens[i].type == TIE) {
			var text = ( tokens[i].type == TIE
				&& tokens[i].value == 0
				&& tokens[i].dots == 0
				&& !tokens[i].isFirst
			) ? '-' : tokens[i].pitch;
			note = newNode('text', document.createTextNode(text));
			var mover, munder;
			while (tokens[i].octave > 0) {
				var dot = newNode('mo',document.createTextNode('\u22c5'));
				mover = newNode('mover', note, dot);
				note = mover;
				--tokens[i].octave;
			}
			if (tokens[i].shift || tokens[i].dots > 0) {
				var mrow = newNode('mrow', note);
				if (tokens[i].shift) {
					var shift = newNode('msup',
						newNode('mi'),
						newNode('mo', document.createTextNode(tokens[i].shift))
					);
					mrow.insertBefore(shift, note);
				}
				if (tokens[i].dots > 0) {
					var dots = newNode('text',
						document.createTextNode(
							'\u22c5'.repeat(tokens[i].dots)));
					mrow.appendChild(dots);
				}
				note = mrow;
			}
			while (tokens[i].value > 0) {
				var line = newNode('mo',document.createTextNode('_')); //'\u0332'
				munder = newNode('munder', note, line);
				note = munder;
				--tokens[i].value;
			}
			while (tokens[i].octave < 0) {
				var dot = newNode('mo',document.createTextNode('\u22c5'));
				munder = newNode('munder', note, dot);
				note = munder;
				++tokens[i].octave;
			}
		} else if (tokens[i].type == SPACE) {
			note = newNode('mi',document.createTextNode('\u00a0'));
		} else if (tokens[i].type == BAR) {
			note = newNode('mo',document.createTextNode('|'));
		}

		if (!tieBegin) {
			frag.appendChild(note);
		} else if (tokens[i].type == TIE) {
			tieBegin = false;
			frag.appendChild(tie);
			frag.appendChild(note);
		} else {
			tieBody.appendChild(note);
		}
		if (tokens[i].tie) {
			tieBegin = true;
			tieBody = newNode('mrow');
			tie = newNode('mover',
				tieBody,
				newNode('mo',document.createTextNode('\u23dc'))
			);
		}
	}
	return newNode('math', frag);
}

function parse(str) {
	return parser(lexer(str));
}

function renderRec(elem) {
    //console.log(elem);
	if (elem.nodeType == 8 // comment node
		|| elem.nodeName == 'math'
		|| elem.nodeName == 'script')
		return;
	if (elem.childNodes.length == 0) {
		var str = elem.nodeValue;
		if (str) {
			var arr = [];
			var i = 0, j;
			while (i < str.length) {
				for (j = i; i < str.length && (str[i] != Jdelim
					|| str.substr(i-Jesc.length+1,Jesc.length) == Jesc
					); ++i) {}
				var sub = str.substring(j,i).trim();
				sub = sub.replace(JescReg, Jdelim);
				if (sub || i == 0) { arr.push(sub); }
				++i;
			}
			var frag = document.createDocumentFragment();
			var toParse = false;
			for (i = 0; i < arr.length; ++i) {
				if (toParse) {
					frag.appendChild(parse(arr[i]));
				} else {
					frag.appendChild(document.createTextNode(arr[i]));
				}
				toParse = !toParse;
			}
			elem.parentNode.replaceChild(frag, elem);
		}
	} else {
		for (var i = 0; i < elem.childNodes.length; ++i)
			renderRec(elem.childNodes[i]);
	}
}

function render(elem) {
	if (!elem)
		elem = document.body;
	var str;
	try {
		str = elem.innerHTML;
	} catch (err) {}
	if (str && str.indexOf(Jdelim) != -1)
		renderRec(elem);
}

function translate() {
	if (doTranslate) {
		doTranslate = false; // run this only once
		render();
	}
}

function setupOnload(func) {
	if (typeof window.addEventListener != 'undefined') {
		//.. gecko, safari, konqueror and standard
		window.addEventListener('load', func, false);
	} else if (typeof document.addEventListener != 'undefined') {
		//.. opera 7
		document.addEventListener('load', func, false);
	} else if(typeof window.attachEvent != 'undefined') {
		//.. win/ie
		window.attachEvent('onload', func);
		//.. mac/ie5 and anything else that gets this far
	} else if(typeof window.onload == 'function') {
		// if there's an existing onload function
		// add new onload handler to it
		var existing = onload;
		window.onload = function() {
			existing();
			func();
		};
	} else {
		window.onload = func;
	}
}

setupOnload(translate);

// API
Jianpu.render = render;
Jianpu.parse = parse;
Jianpu.help = function() {
	var arr = [
		'render(element) -> undefined',
		'  render music contained in element.\n',
		'parse(str) -> node',
		'  parse music in str, return mathml node.\n',
		'help() -> undefined',
		'  display this help.\n',
	];
	console.log(arr.join('\n'));
}
})();
