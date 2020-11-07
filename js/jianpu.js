var Jianpu = {};

(function(){

// options
var Jdelim = "`", Jesc = "\\`";   // can use other characters
var doTranslate = true;           // false to preserve `..`

// -------------------------------------------------------------------

// globals
var JescReg = RegExp('\\' + Jesc, 'g');

// token types
var NOTE = 0, SPACE = 1, BAR = 2, TIE = 3;
//var NOTE = Symbol('note'), SPACE = Symbol('space'), BAR = Symbol('bar'), TIE = Symbol('tie'); // debug

function lexer(str) {
  //console.log(str);
  var tokens = [{type:SPACE}];
  var lastNote, lastNoteIdx;
  var isFirstNote = true;
  var i = 0;
  var ul = 0; // underline
  var warn = function(i, description) {
    var step = 10;
    var lo = i-step < 0 ? 0 : i-step;
    var hi = i+step > str.length ? str.length : i+step;
    console.warn(str.substring(lo, hi) + '\n'
      + ' '.repeat(i-lo)
      + '^ ' + description + " '" + str[i] + "'"
    );
  }
  var doBar = function() {
    ++i; tokens.push({type: BAR});
    if (str[i] == '|') {
      ++i;
      tokens.push({type: BAR});
    }
    isFirstNote = true;
  }
  var doHyphen = function() {
    if (!lastNote)
      return;
    var token = {type:TIE};
    token.pitch = lastNote.pitch;
    token.octave = lastNote.octave;
    token.ul = ul;
    token.isFirst = isFirstNote;
    isFirstNote = false;
    ++i;
    for (j = i; str[i] == '.'; ++i) {}
    token.dots = i-j;
    tokens[lastNoteIdx].tie = true;
    tokens.push(token);
  }
  var doDefault = function() {
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
      token.ul = ul;
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
  while (i < str.length) {
    if (ul == 0 && tokens[tokens.length-1].type != SPACE)
      tokens.push({type:SPACE});
    switch (str[i]) {
      case ' ': case '\t': case '\n': ++i; break;
      case '(': ++i; ++ul; break;
      case ')': ++i; --ul; break;
      case '|': doBar(); break;
      case '-': doHyphen(); break;
      default: doDefault();
    }
  }
  return tokens;
}

function $() {
  return document.createDocumentFragment();
}

function $text(arg) {
  return document.createTextNode(arg);
}

function $xhtml(name, child1, child2) {
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
  var frag = $();
  var tieBegin = false;
  var note, tie, tieBody, lastUl, needTie;
  for (var i = 0; i < tokens.length; ++i) {
    var t = tokens[i];
    if (t.type == NOTE || t.type == TIE) {
      var text = ( t.type == TIE
        && t.ul == 0
        && t.dots == 0
        && !t.isFirst
      ) ? '-' : t.pitch;
      note = $xhtml('text', $text(text));
      var mover, munder;
      while (t.octave > 0) {
        var dot = $xhtml('mo', $text('\u22c5'));
        mover = $xhtml('mover', note, dot);
        note = mover;
        --t.octave;
      }
      if (t.shift || t.dots > 0) {
        var mrow = $xhtml('mrow', note);
        if (t.shift) {
          var shift = $xhtml('msup',
            $xhtml('mi'),
            $xhtml('mo', $text(t.shift))
          );
          mrow.insertBefore(shift, note);
        }
        if (t.dots > 0) {
          var dots = $xhtml('text',
            $text('\u22c5'.repeat(t.dots)));
          mrow.appendChild(dots);
        }
        note = mrow;
      }
      needTie = lastUl === undefined || t.ul || lastUl;
      lastUl = t.ul;
      while (t.ul > 0) {
        var line = $xhtml('mo', $text('_')); //'\u0332'
        munder = $xhtml('munder', note, line);
        note = munder;
        --t.ul;
      }
      while (t.octave < 0) {
        var dot = $xhtml('mo', $text('\u22c5'));
        munder = $xhtml('munder', note, dot);
        note = munder;
        ++t.octave;
      }
    } else if (t.type == SPACE) {
      note = $xhtml('mi', $text('\u00a0'));
    } else if (t.type == BAR) {
      note = $xhtml('mo', $text('|'));
    }

    if (!tieBegin) {
      frag.appendChild(note);
    } else if (t.type == TIE) {
      tieBegin = false;
      if (needTie) {
        needTie = false;
        frag.appendChild(tie);
      } else {
        frag.appendChild(tieBody);
      }
      frag.appendChild(note);
    } else {
      tieBody.appendChild(note);
    }
    if (t.tie) {
      tieBegin = true;
      tieBody = $xhtml('mrow');
      tie = $xhtml('mover',
        tieBody,
        $xhtml('mo', $text('\u23dc'))
      );
    }
  }
  return $xhtml('math', frag);
}

function parse(str) {
  return parser(lexer(str));
}

// ---- search document for delimeters ----

function parseNode(node) {
  var str = node.nodeValue;
  var uniqStr = 'e7ae80e8b0b1';
  if (!str) return 0;
  var escaped = false;
  str = str.replace(Jesc, function() {
    escaped = true; return uniqStr;
  }); // this is a problem??

  var arr = str.split(Jdelim);
  if (arr.length > 1 || escaped) {
    var frag = document.createDocumentFragment();
    var toParse = false;
    for (var i = 0; i < arr.length; ++i) {
      arr[i] = arr[i].replace(RegExp(uniqStr, 'g'), Jdelim);
      if (toParse) {
        //for (d of AM.define)
          //arr[i] = arr[i].replace(d[0], d[1]);
        frag.appendChild(parse(arr[i]));
      } else {
        frag.appendChild(document.createTextNode(arr[i]));
      }
      toParse = !toParse;
    }
    if (!toParse)
      console.warn('score not closed:', str);
    node.parentNode.replaceChild(frag, node);
    return arr.length-1;
  }
  return 0;
}

function render(node) {
  if (node.nodeName == 'math' || node.nodeType == 8 // comment element
      || /form|textarea/i.test(node.parentNode.nodeName)
  ) return 0;

  if (node.childNodes.length > 0)
    for (var i = 0; i < node.childNodes.length; i++)
      i += render(node.childNodes[i]);

  return parseNode(node);
}

function autorender(node) {
  render(document.body);
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

setupOnload(autorender);

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

