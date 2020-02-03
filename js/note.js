'use strict';

(function() {

// ---- globals ----

var explorer = navigator.userAgent;
var url;		// 'A2', '%234', '3-1'
var filename;	// 'A2', '#4',   '3-1'	// replace leading '%23' with '#'
var abbr;		// 'A',  '#',    '3-'
var urlAbbr;	// 'A',  '%234', '3-'
var index;		// 2,    4,      1

// ---- functions ----

function getQuery() {
	var theRequest = new Object();
	var scripts = document.getElementsByTagName('script');
	var scriptName = scripts[scripts.length-1].getAttribute('src');
	var i = scriptName.indexOf('?');
	if (i != -1) {
		var strs = scriptName.substr(i+1).split("&");
		for (var i = 0; i < strs.length; ++i) {
			var splits = strs[i].split('=');
			// decodeURI() doesn't work
			theRequest[splits[0]] = unescape(splits[1]);
      }
   }
   return theRequest;
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
	var foundFirefox = explorer.indexOf('Firefox') >= 0;
	var foundChrome = explorer.indexOf('Chrome') >= 0;
	var foundSafari = explorer.indexOf('Safari') >= 0;

	if (foundFirefox || (foundSafari && !foundChrome)) {
		// firefox and safari
		var newScript = document.createElement('script');
		newScript.src = '../js/AMsymbols.js';
		document.body.appendChild(newScript);
		newScript = document.createElement('script');
		newScript.src = '../js/asciimath.js';
		document.body.appendChild(newScript);
	} else { // other browser
		/* former use of MathJaX
		var newScript = document.createElement('script');
		newScript.src = '../js/mathjax-config.js';
		document.body.appendChild(newScript);
		newScript = document.createElement('script');
		newScript.type = 'text/x-mathjax-config';
		newScript.innerHTML = 'mathJaxConfig();'
		document.body.appendChild(newScript);
		newScript = document.createElement('script');
		newScript.async = true;
		newScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML-full';
		document.body.appendChild(newScript);
		*/
		// KaTeX renders math faster!
		var link = document.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		// local fonts cause CORS error
		link.setAttribute('href', 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css');
		document.body.appendChild(link);

		function loadScript(url, callback) {
			var script = document.createElement('script');
			script.type = 'application/javascript';
			if (typeof(callback) != 'undefined') {
				if (script.readyState) { // IE
					script.onreadystatechange = function() {
						if (script.readyState == 'loaded'
								|| script.readyState == 'complete') {
							script.onreadystatechange = null;
							callback();
						}
					}
				} else { // others
					script.onload = function() { callback(); }
				}
			}
			script.src = url;
			document.body.appendChild(script);
		}
		loadScript('../js/AMsymbols.js', function(){
		loadScript('../js/katex.min.js', function() {
		loadScript('../js/asciimath-katex.js', function() {});
		}); });
	}
}

function makeModified() {
	var modified = document.createElement('p');
	modified.id = 'last-modified';
	modified.innerHTML = document.lastModified;
	document.body.insertBefore(modified, document.body.firstChild);
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
	var h1 = document.createElement('h1');
	var title = document.getElementsByTagName('title');
	if (title[0].classList.contains('nonu')) {
		h1.innerHTML = document.title;
	} else {
		h1.innerHTML = zhname[abbr] || '';
		h1.innerHTML += filename + ' ' + document.title;
	}
	document.body.insertBefore(h1, document.body.firstChild);
}

/*
	<div id="nav">
		<a href="prev.html" style="float:left">&lt;&lt;&lt;</a>
		<a href="index.html" target="_blank">· · ·</a>
		<a href="next.html" style="float:right">&gt;&gt;&gt;</a>
	</div>

function makeNav() {
	var nav = document.createElement('div');
	nav.id = 'nav';
	document.body.insertBefore(nav, document.body.firstChild);

	var prev = document.createElement('a');
	prev.style.float = 'left';
	prev.innerHTML = '&lt;&lt;&lt;';
	if (index > 1) {
		prev.href = urlAbbr + (index-1) + '.html';
	} else {
		prev.style.color = 'rgba(0,0,0,0)';
	}
	nav.appendChild(prev);

	var indexPage = document.createElement('a');
	indexPage.href = '../index.html';
	indexPage.target = '_blank';
	indexPage.innerHTML = '· · ·';
	nav.appendChild(indexPage);

	var buttonToc = document.createElement('a');
	buttonToc.innerHTML = '· · ·';
	buttonToc.onclick = function() {
		var toc = document.getElementById('toc');
		if (toc.hidden) {
			toc.removeAttribute('hidden');
		} else {
			toc.hidden = true;
		}
	}
	nav.appendChild(buttonToc);

	var next = document.createElement('a');
	next.href = urlAbbr + (index+1) + '.html';
	next.style.float = 'right';
	next.innerHTML = '&gt;&gt;&gt;';
	nav.appendChild(next);

	// table of contents
	var toc = document.createElement('iframe');
	toc.id = 'toc';
	toc.hidden = true;
	toc.src = '../index.html';
	document.body.insertBefore(toc, document.body.firstChild);
}
*/

function alignLabel() {
	var labels = document.getElementsByClassName('label');
	for (var i = 0; i < labels.length; ++i) {
		var p = labels[i].parentElement;
		var labelPhantom = document.createElement('span');
		labelPhantom.className = 'label-phantom';
		labelPhantom.innerHTML = labels[i].innerHTML;
		p.insertBefore(labelPhantom, p.firstChild);
	}
}

var Sname = function() {
	return document.createTextNode(filename);
};

var Sname_num = function(word, i) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word + filename + '-' + (i+1);
	return newItem;
};

var Snum = function(word, i) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word + (i+1);
	return newItem;
};

var Svoid = function(word) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word;
	return newItem;
};

var Slarge = function(word) {
	var newItem = document.createElement('span');
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
			? document.getElementsByClassName(list[i].name)
			: document.getElementsByTagName(list[i].name)
		);

		if (list[i].style === Sformula) {
			for (var j = 0; j < elem.length; ++j) {
				elem[j].title = elem[j].innerHTML
					= list[i].style(list[i].word, j);
			}
		} else {
			for (var j = 0; j < elem.length; ++j) {
				if (elem[j].classList.contains('nonu')) {
					continue;
				}
				var space = document.createTextNode(' ');
				elem[j].insertBefore(space, elem[j].firstChild);
				var newNode = list[i].style(list[i].word, j);
				elem[j].title = newNode.innerHTML;
				elem[j].insertBefore(newNode, elem[j].firstChild);
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
	var elem = document.querySelectorAll(select);

	var i = 0;
	if (i == elem.length) return;
	var level = parseInt(elem[i].nodeName[1]);
	var nums = [filename];
	function decorateH(lastLevel) {
		var cnt = 0;
		if (level > lastLevel) {
			nums.push(cnt);
			decorateH(lastLevel+1);
		}
		while (level == lastLevel) {
			if (!elem[i].classList.contains('nonu')) {
				var space = document.createTextNode(' ');
				elem[i].insertBefore(space, elem[i].firstChild);
				var newNode = document.createElement('b');
				elem[i].title = newNode.innerHTML
					= nums.join('-') + '-' + (++cnt);
				elem[i].insertBefore(newNode, elem[i].firstChild);
				//console.log(elem[i]);
			}
			++i;
			if (i == elem.length) return;
			level = parseInt(elem[i].nodeName[1]);
			if (level > lastLevel) {
				nums.push(cnt);
				decorateH(lastLevel+1);
			}
		}
		nums.pop();
	}
	decorateH(2);
}

/* select text on click
function selectText(id) {
	var text = document.getElementById(id);
	var range;
	if (document.body.createTextRange) {
		range = document.body.createTextRange();
		range.moveToElementText(text);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection();
		range = document.createRange();
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
	var pres = document.getElementsByTagName('pre');
	for (var i = 0; i < pres.length; ++i) {
		var button = document.createElement('button');
		var id = pres[i].id;
		if (!id) {
			id = 'pre-' + filename + '-' + (i+1);
			pres[i].id = id;
		}
		button.innerHTML = '复制';
		button.onclick = copyCode(button, id);
		button.className = 'copy-code';
		pres[i].insertBefore(button, pres[i].firstChild);
	}
}

function copyCode(button, id)
{
	return function() {
		var code = document.getElementById(id);
		var textArea = document.createElement('textarea');
		textArea.innerHTML = code.innerHTML;
		document.body.appendChild(textArea);
		textArea.select();
		document.execCommand('copy');
		document.body.removeChild(textArea);
	}
}

function hideAnswer(list) {
	for (var i = 0; i < list.length; ++i) {
		var answers = document.getElementsByClassName(list[i].name);
		for (var j = 0; j < answers.length; ++j) {
			var button = document.createElement('button');
			var id = answers[j].id;
			if (!id) {
				id = list[i].name + '-' + filename + '-' + (j+1);
				answers[j].id = id;
			}
			button.onclick = toggleShowAnswer(button, id);
			button.innerHTML = list[i].word;
			button.className = 'toggle-answer answer-hidden';
			answers[j].parentElement.insertBefore(button, answers[j]);
			answers[j].classList.add('hidden');
		}
	}
}

function toggleShowAnswer(button, id) {
	return function() {
		var answer = document.getElementById(id);
		var str = button.innerHTML;
		if (answer.classList.contains('hidden')) {
			button.classList.remove('answer-hidden');
			button.classList.add('answer-shown');
			answer.classList.remove('hidden');
		} else {
			button.classList.remove('answer-shown');
			button.classList.add('answer-hidden');
			answer.classList.add('hidden');
		}
	};
}

function makeReference() {
	var refs = document.getElementsByClassName('ref');
	for (var i = 0; i < refs.length; ++i) {
		var j = refs[i].href.indexOf('#');
		var id = refs[i].href.substring(j+1);
		var refed = document.getElementById(id);
		if (refed) {
			refs[i].innerHTML = refed.title;
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
	var rects = document.getElementsByTagName('rect');
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
		var wrapper = document.createElement('div');
		wrapper.id = 'ios-wrapper';
		var node;
		while (node = document.body.firstChild) {
			wrapper.appendChild(node);
		}
		document.body.appendChild(wrapper);
	}
}

function toggleHideHeader() {
	var prevScrollTop = document.documentElement.scrollTop
		|| document.body.scrollTop;
	var threshod = 100;
	var prevHide = false;
	var button = parent.document.getElementById('toggle-show-header');
	if (parent != window) {
		document.body.onscroll = function() {
			var scrollTop = document.documentElement.scrollTop
				|| document.body.scrollTop;
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
		var div = document.createElement('div');
		div.className = 'scroll-wrapper';
		L[i].parentElement.insertBefore(div, L[i]);
		div.appendChild(L[i]);
	}
}

// ---- data & function call ----

var args = getQuery();
//console.log(args);

init();
//makeNav();
makeModified();
makeH1();		// call makeH1() before decorate()

decorateHeading(3);
makeSvg();

alignLabel(); // call alignLabel() before decorate()

decorate([
	//{name:'read-important',getBy:'class',word:'&#x1f4d6;',style:Slarge},
	{name:'title', getBy:'tag', word:'', style:Sname},
	{name:'example', getBy:'class', word:'例', style:Sname_num},
	{name:'remark', getBy:'class', word:'注', style:Sname_num},
	{name:'question', getBy:'class', word:'问题', style:Sname_num},
	{name:'theorem', getBy:'class', word:'定理', style:Sname_num},
  {name:'proposition', getBy:'class', word:'命题', style:Sname_num},
	{name:'definition', getBy:'class', word:'定义', style:Sname_num},
	{name:'lemma', getBy:'class', word:'引理', style:Sname_num},
	{name:'corollary', getBy:'class', word:'推论', style:Sname_num},
	{name:'algorithm', getBy:'class', word:'算法', style:Sname_num},
	{name:'data-structure', getBy:'class', word:'数据结构', style:Sname_num},
	{name:'construction',getBy:'class', word:'作图', style:Sname_num},
	{name:'graph', getBy:'class', word:'图', style:Sname_num},
	{name:'principle', getBy:'class', word:'原理', style:Sname_num},
	{name:'axiom', getBy:'class', word:'公理', style:Sname_num},
	{name:'property', getBy:'class', word:'性质', style:Sname_num},
	// place this before 证 and 解. got problem with the numbering.
	{name:'method', getBy:'class', word:'法', style:Snum},
	{name:'label', getBy:'class', word:'', style:Sformula},
	{name:'label-phantom', getBy:'class', word:'', style:Sformula},
]);

hideAnswer([
	{name:'proof', word:'证'},
	{name:'solution', word:'解'},
	{name:'answer', word:'答'},
	{name:'collapse', word:'&nbsp;'},
]);

if (args.type == 'math' || args.loadmath) {
	loadMath();
}

if (args.type == 'cs') {
	enableCopyCode();
}

makeReference(); // call makeReference() after decorate()
//wrapIOS(); // call this after decorate()
//toggleHideHeader();
wrap(document.getElementsByClassName('formula'));
wrap(document.getElementsByTagName('table'));

})();

