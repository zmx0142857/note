'use strict';

var asciimath;

(function(window) {

// ---- globals ----

var doc = window.document;
var body = doc.body;
var explorer = navigator.userAgent;
var url;    // 'A2', '%234', '3-1'
var filename; // 'A2', '#4',   '3-1'  // replace leading '%23' with '#'
var abbr;   // 'A',  '#',    '3-'
var urlAbbr;  // 'A',  '%234', '3-'
var index;    // 2,    4,      1
var scripts = doc.getElementsByTagName('script');
var scriptName = scripts[scripts.length-1].getAttribute('src');
var prefix = scriptName.slice(0, scriptName.indexOf('js'));

// 重定向到首页
if (window.parent === window) {
  var replaced = location.pathname
    .replace(/(\/note\/|\/)/, '$1#')
    .replace(/\.html$/, '')
  location.href = replaced
  console.log('redirect to index')
}

if (typeof asciimath == 'undefined')
    asciimath = {};
if (typeof asciimath.katexpath == 'undefined')
  asciimath.katexpath = prefix + 'js/katex.min.js';


// ---- functions ----

// 假装在用 jquery
function $(str, children) {
  if (typeof(str) == 'string') {
    var len = str.length;
    if (str[0] == '#')
      return doc.getElementById(str.slice(1));
    if (str[0] == '.')
      return doc.getElementsByClassName(str.slice(1));
    if (str[0] == '<' && str[len-1] == '>') {
      var elem = doc.createElement(str.slice(1,len-1));
      if (typeof(children) == 'string')
        elem.innerHTML = children;
      else if (children instanceof Node)
        elem.appendChild(children);
      else if (children instanceof Array) {
        for (c of children)
          elem.appendChild(c);
      }
      return elem;
    }
    if (len > 0)
      return doc.getElementsByTagName(str);
  }
  if (typeof(str) == 'undefined') {
    return doc.createDocumentFragment();
  }
}

function $text(str) {
  return doc.createTextNode(str);
}

function getParams(str) {
  var ret = {};
  var i = str.indexOf('?');
  if (i != -1) {
    var strs = str.substr(i+1).split("&");
    for (var i = 0; i < strs.length; ++i) {
      var splits = strs[i].split('=');
      // decodeURI() doesn't work
      ret[splits[0]] = unescape(splits[1]);
    }
  }
  return ret;
}

function init() {
  url = window.location.href.split('/');
  url = url[url.length-1].split('.')[0];
  filename = unescape(url);

  // locate first digit, or the first char after '-'
  var indexOfMinus = filename.indexOf('-');
  var i = filename.search(/[0-9]/);
  if (indexOfMinus > i) {
    i = indexOfMinus + 1;
  }

  abbr = filename.substring(0, i);
  urlAbbr = (abbr === '#' ? '%23' : abbr);
  index = parseInt(filename.substring(i));
}

function loadMath() {
  var newScript = $('<script>');
  newScript.src = prefix + 'js/asciimath.js';
  body.appendChild(newScript);
}

function loadComment () {
  var vcomments = $('<div>')
  vcomments.id = 'vcomments'
  body.appendChild(vcomments)
  loadScript('https://unpkg.com/valine/dist/Valine.min.js', function () {
    new Valine({
      el: '#vcomments',
      appId: 'Tcw3DWs4zVh0M2U3LCQhYjGY-gzGzoHsz',
      appKey: 'DJRTO1w97BJxyEq01LRXuBys',
      placeholder: '欢迎留言! 支持 **markdown** 和 asciimath 公式: \\`a^2 + b^2 = c^2\\`'
    })
    renderComment()
  }, true) // defer
}

// Valine 官方未提供 API, 故采用轮询方式渲染公式
function renderComment() {
  var renderInterval = setInterval(function () {
    var commentDOM = doc.querySelector('#vcomments .vcards')
    if (commentDOM) {
      console.log('render comment')
      doc.querySelector('#vcomments .vsubmit')
         .addEventListener('click', renderComment)
      setTimeout(() => {
        asciimath.render(commentDOM)
      }, 1000)
      clearInterval(renderInterval)
    }
  }, 1000)
}

function loadScript(url, callback, defer) {
  var script = doc.createElement('script')
  script.type = 'application/javascript'
  script.src = url;
  if (!defer) {
    script.onload = callback
  } else {
    script.setAttribute('async', 'true') // defer 对于动态 script 是无效的
    script.onload = function () {
      if (typeof window.onload == 'function') {
        var existing = window.onload
        window.onload = function() {
          existing()
          callback()
        }
      } else {
        window.onload = callback
      }
    }
  }
  body.appendChild(script);
}

function makeModified() {
  var modified = $('<span>');
  modified.id = 'last-modified';
  modified.innerHTML = doc.lastModified;
  body.insertBefore(modified, body.firstChild);
}

function makeH1() {
  var zhname = {
    '#': '附录篇',
    'A': '分析篇',
    'AL': '算法篇',
    'D': '离散篇',
    'E': '方程篇',
    'G': '几何篇',
    'I': '代数篇',
    'S': '概率统计篇'
  };
  var h1 = $('<h1>');
  var title = $('title');
  if (title[0].classList.contains('nonu')) {
    h1.innerHTML = doc.title;
  } else {
    h1.innerHTML = zhname[abbr] || '';
    h1.innerHTML += filename + ' ' + doc.title;
  }
  var toc = $('<ul>');
  toc.id = 'toc';
  toc.classList.add('toc');
  body.insertBefore(toc, body.firstChild);
  makeModified();
  body.insertBefore(h1, body.firstChild);
}

function alignLabel() {
  var labels = $('.label');
  for (var i = 0; i < labels.length; ++i) {
    var p = labels[i].parentElement;
    var labelPhantom = $('<span>');
    labelPhantom.className = 'label-phantom';
    labelPhantom.innerHTML = labels[i].innerHTML;
    p.insertBefore(labelPhantom, p.firstChild);
  }
}

var Sname = function() {
  return $text(filename);
};

var Sname_num = function(word, i) {
  var newItem = $('<b>');
  newItem.innerHTML = word + filename + '-' + (i+1);
  return newItem;
};

var Snum = function(word, i) {
  var newItem = $('<b>');
  newItem.innerHTML = word + (i+1);
  return newItem;
};

var Svoid = function(word) {
  var newItem = $('<b>');
  newItem.innerHTML = word;
  return newItem;
};

var Slarge = function(word) {
  var newItem = $('<span>');
  newItem.style.fontSize = '2em';
  newItem.innerHTML = word;
  return newItem;
};

var Sformula = function(word, i) {
  return '(' + filename + '-' + (i+1) + ')';
};

function decorate(list) {
  for (var i = 0; i < list.length; ++i) {
    var elem = ( list[i].getBy === 'class'
      ? doc.getElementsByClassName(list[i].name)
      : doc.getElementsByTagName(list[i].name)
    );

    if (list[i].style === Sformula) {
      for (var j = 0; j < elem.length; ++j) {
        if (!elem[j].innerText) {
          elem[j].innerText = list[i].style(list[i].word, j);
        }
        elem[j].caption = elem[j].innerText
      }
    } else {
      for (var j = 0; j < elem.length; ++j) {
        if (elem[j].classList.contains('nonu')) {
          continue;
        }
        var newNode = list[i].style(list[i].word, j);
        elem[j].caption = newNode.innerHTML;
        if (list[i].placeAfter) {
          elem[j].appendChild(newNode);
          newNode.innerHTML += ' ' + elem[j].title
        } else {
          var space = $text(' ');
          elem[j].insertBefore(space, elem[j].firstChild);
          elem[j].insertBefore(newNode, elem[j].firstChild);
        }
      }
    }
  }
}

function decorateHeading(maxLevel) {
  if (maxLevel < 2)
    return;
  if (maxLevel > 6)
    maxLevel = 6;
  var select = "h2,h3,h4,h5,h6".substr(0, (maxLevel-2)*3 + 2);
  //console.log(select);
  var elem = doc.querySelectorAll(select);

  var i = 0;
  var toc = $('#toc');
  if (elem.length == 0) {
    return toc.classList.remove('toc');
  }
  var level = parseInt(elem[i].nodeName[1]);
  var nums = [filename];

  function decorateH(lastLevel, parentNode) {
    var cnt = 0;
    if (level > lastLevel) {
      nums.push(cnt);
      decorateH(lastLevel+1, parentNode);
    }
    while (level == lastLevel) {
      var li;
      if (!elem[i].classList.contains('nonu')) {
        var space = $text(' ');
        elem[i].insertBefore(space, elem[i].firstChild);
        var newNode = $('<b>');
        elem[i].caption = newNode.innerHTML
          = nums.join('-') + '-' + (++cnt);
        elem[i].insertBefore(newNode, elem[i].firstChild);
        elem[i].id = elem[i].caption

        var a = $('<a>', elem[i].innerText);
        a.setAttribute('href', '#' + elem[i].id);
        li = $('<li>', a);
        parentNode.appendChild(li);
        //console.log(elem[i]);
      }
      ++i;
      if (i == elem.length) return;
      level = parseInt(elem[i].nodeName[1]);
      if (level > lastLevel) {
        nums.push(cnt);
        var ul = $('<ul>');
        if (li) {
          li.appendChild(ul);
        }
        decorateH(lastLevel+1, ul);
      }
    }
    nums.pop();
  }
  decorateH(2, toc);
}

/* select text on click
function selectText(id) {
  var text = doc.getElementById(id);
  var range;
  if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(text);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    range = doc.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
element.onclick = function() {
   selectText("output");
}
*/

function enableCopyCode()
{
  function copyCode(pre)
  {
    return function() {
      var textarea = $('<textarea>');
      textarea.value = pre.innerText;
      body.appendChild(textarea);
      textarea.select();
      doc.execCommand('copy');
      body.removeChild(textarea);
      var notify = $('<div>');
      notify.innerText = '复制成功';
      notify.id = 'notify';
      body.appendChild(notify);
      setTimeout(function(){body.removeChild(notify)}, 1000);
    }
  }

  var pres = $('pre');
  for (var i = 0; i < pres.length; ++i) {
    pres[i].ondblclick = copyCode(pres[i]);
    pres[i].title = '双击复制';
  }
}

function hideAnswer(list) {
  for (var i = 0; i < list.length; ++i) {
    var answers = doc.getElementsByClassName(list[i].name);
    for (var j = 0; j < answers.length; ++j) {
      var button = $('<button>');
      var id = answers[j].id;
      if (!id) {
        id = list[i].name + '-' + filename + '-' + (j+1);
        answers[j].id = id;
      }
      button.onclick = toggleShowAnswer(id);
      button.innerHTML = list[i].word;
      button.classList.add('toggle-answer');
      answers[j].parentElement.insertBefore(button, answers[j]);
      answers[j].classList.add('hidden');
    }
  }
}

function toggleShowAnswer(id) {
  var box = doc.getElementById(id);
  return function() {
    this.classList.toggle('answer-shown');
    box.classList.toggle('hidden');
    /*
    if (box.classList.contains('hidden')) {
      box.style.height = '0'
    } else {
      box.style.height = box.scrollHeight + 'px' // scrollHeight 动画有性能问题
    }
    */
  };
}

function refPreview(elem, refed) {
  var div = $('<div>');
  var preview = $('<div>');
  elem.onmouseover = function(e) {
    if (refed.classList.contains('img')) {
      div.classList.add('img');
      div.innerHTML = refed.innerHTML;
    } else {
      div.classList.remove('img');
      div.innerHTML = '';
      div.appendChild(refed.cloneNode(true));
    }
    preview.appendChild(div);
    preview.classList.add('ref-preview');
    preview.style.left = e.clientX + 'px';
    if (window.innerHeight - e.clientY < 200) {
      preview.style.top = e.clientY - 50 + 'px';
      preview.classList.add('ref-preview-top');
      preview.classList.remove('ref-preview-bottom');
    } else {
      preview.style.top = e.clientY + 'px';
      preview.classList.add('ref-preview-bottom');
      preview.classList.remove('ref-preview-top');
    }
    body.appendChild(preview);
  };
  elem.onmouseout = function() {
    if (preview) {
      body.removeChild(preview);
    }
  };
}

function makeReference() {
  var refs = $('.ref');
  for (var i = 0; i < refs.length; ++i) {
    var j = refs[i].href.indexOf('#');
    var id = refs[i].href.substring(j+1);
    var refed = doc.getElementById(id);
    if (refed) {
      refs[i].innerHTML = refed.caption || '??';
      if (refed.classList.contains('label')) {
        refPreview(refs[i], refed.parentNode);
      } else {
        refPreview(refs[i], refed);
      }
    } else {
      console.warn('reference "' + id + '" not found');
    }
  }
}

function setDefaults(elem, dict) {
  for (var attr in dict) {
    if (!elem.getAttribute(attr))
      elem.setAttribute(attr, dict[attr]);
  }
}

function makeSvg() {
  var rects = $('rect');
  for (var i = 0; i < rects.length; ++i) {
    setDefaults(rects[i], {
      height: '30',
      width: '80',
      rx: '10',
      ry: '10'
    });
  }
}

/*
function wrapIOS() {
  if (/iphone|ipad|ipod/i.test(explorer)) {
    // move everything into wrapper
    var wrapper = doc.createElement('div');
    wrapper.id = 'ios-wrapper';
    var node;
    while (node = body.firstChild) {
      wrapper.appendChild(node);
    }
    body.appendChild(wrapper);
  }
}

function toggleHideHeader() {
  var prevScrollTop = doc.docElement.scrollTop
    || body.scrollTop;
  var threshod = 100;
  var prevHide = false;
  var button = parent.doc.getElementById('toggle-show-header');
  if (parent != window) {
    body.onscroll = function() {
      var scrollTop = doc.documentElement.scrollTop
        || body.scrollTop;
      var hide = (scrollTop >= prevScrollTop);
      if (hide != prevHide)
        button.onclick(hide);
      prevScrollTop = scrollTop;
      prevHide = hide;
    };
  }
}
*/

// make formula/table scrollable on overflow
function wrap(L) {
  for (var i = 0; i < L.length; ++i) {
    var div = $('<div>');
    div.className = 'scroll-wrapper';
    L[i].parentElement.insertBefore(div, L[i]);
    div.appendChild(L[i]);
  }
}

// span.formula.align ---> span.formula > span.align
function makeAlign() {
  doc.querySelectorAll('.formula.align').forEach(span => {
    var wrap = $('<span>');
    wrap.classList.add('formula');
    span.parentNode.replaceChild(wrap, span);
    wrap.appendChild(span);
    span.classList.remove('formula');
  })
}

// ---- data & function call ----

var params = getParams(scriptName);
//console.log(params);

init();
//makeNav();
makeH1();   // call makeH1() before decorate()

decorateHeading(3);
makeSvg();

alignLabel(); // call alignLabel() before decorate()

decorate([
  //{name:'read-important',getBy:'class',word:'&#x1f4d6;',style:Slarge},
  {name:'title', getBy:'tag', word:'', style:Sname},
  {name:'example', getBy:'class', word:'例', style:Sname_num},
  {name:'remark', getBy:'class', word:'注', style:Sname_num},
  {name:'question', getBy:'class', word:'问题', style:Sname_num},
  {name:'conjecture', getBy:'class', word:'猜想', style:Sname_num},
  {name:'hypothesis', getBy:'class', word:'假设', style:Sname_num},
  {name:'theorem', getBy:'class', word:'定理', style:Sname_num},
  {name:'proposition', getBy:'class', word:'命题', style:Sname_num},
  {name:'definition', getBy:'class', word:'定义', style:Sname_num},
  {name:'lemma', getBy:'class', word:'引理', style:Sname_num},
  {name:'corollary', getBy:'class', word:'推论', style:Sname_num},
  {name:'algorithm', getBy:'class', word:'算法', style:Sname_num},
  {name:'data-structure', getBy:'class', word:'数据结构', style:Sname_num},
  {name:'construction',getBy:'class', word:'作图', style:Sname_num},
  {name:'img', getBy:'class', word:'图', style:Sname_num, placeAfter:true},
  {name:'principle', getBy:'class', word:'原理', style:Sname_num},
  {name:'axiom', getBy:'class', word:'公理', style:Sname_num},
  {name:'property', getBy:'class', word:'性质', style:Sname_num},
  {name:'label', getBy:'class', word:'', style:Sformula},
  {name:'label-phantom', getBy:'class', word:'', style:Sformula},
]);

hideAnswer([
  {name:'proof', word:'证'},
  {name:'solution', word:'解'},
  {name:'answer', word:'答'},
  {name:'collapse', word:'&nbsp;'},
  {name:'toc', word:'目录'},
]);

//if (params.type == 'math' || params.loadmath) {
  loadMath();
//}

//if (params.type == 'cs') {
  enableCopyCode();
//}

makeReference(); // call makeReference() after decorate()
//wrapIOS(); // call this after decorate()
//toggleHideHeader();
wrap($('.formula'));
wrap($('table'));
makeAlign();

// event handler from parent window
//doc.onkeyup = window.handleKeyboard || null;
/*
doc.onkeyup = function (e) {
  if (e.keyCode == 'D'.charCodeAt(0)) {
    body.classList.toggle('dark')
  }
}*/

// 在 load math 之后调用
if (/^https?:$/.test(location.protocol) && location.hostname !== 'localhost')
  loadComment()

})(window);
