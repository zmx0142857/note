'use strict';

// ---- globals & initiation ----

(function() {

var url;		// 'A2', '%234', '3-1'
var filename;	// 'A2', '#4',   '3-1'	// replace leading '%23' with '#'
var abbr;		// 'A',  '#',    '3-'
var urlAbbr;	// 'A',  '%234', '3-'
var index;		// 2,    4,      1

function init() {
	url = window.location.href.split('/');
	url = url[url.length-1].split('.')[0];

	filename = ( url.substring(0, 3) === '%23'
		? '#' + url.substring(3)
		: url
	);

	// locate first digit, or the first char after '-'
	var indexOfMinus = filename.indexOf('-');
	var i = filename.search(/[0-9]/);
	if (indexOfMinus > i) {
		i = indexOfMinus + 1;
	}

	abbr = filename.substring(0, i);
	urlAbbr = (abbr === '#' ? '%23' : abbr);
	index = parseInt(filename.substring(i));

	var explorer = window.navigator.userAgent;
	var foundFirefox = explorer.indexOf('Firefox') >= 0;
	var foundChrome = explorer.indexOf('Chrome') >= 0;
	var foundSafari = explorer.indexOf('Safari') >= 0;

	var newScript = document.createElement('script');
	if (foundFirefox || (foundSafari && !foundChrome)) {
		newScript.src = '../js/asciimathml.js';
		document.body.appendChild(newScript);
	} else {
		// bm "something" get bold-italics
		newScript.type = 'text/x-mathjax-config';
		//newScript.src = 'js/mathjax-config.js';
		newScript.innerHTML = ' MathJax.Hub.Register.StartupHook("AsciiMath Jax Config", function () { var AM = MathJax.InputJax.AsciiMath.AM; AM.symbols.push( { input:"bm", tag:"mstyle", atname:"mathvariant", atval:"bold-italic", output:"bm", tex:null, ttype:AM.TOKEN.UNARY }); AM.symbols.push({input:"==",  tag:"mo", output:"\u2550\u2550\u2550\u2550", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"====",  tag:"mo", output:"\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"////", tag:"mo", output:"\u2225", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"!//", tag:"mo", output:"\u2226", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"S=",  tag:"mo", output:"\u224C", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"!-=",  tag:"mo", output:"\u2262", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"!|", tag:"mo", output:"\u2224", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"iint",  tag:"mo", output:"\u222C", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"iiint",  tag:"mo", output:"\u222D", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"oiint", tag:"mo", output:"\u222F", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"oiiint", tag:"mo", output:"\u2230", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"laplace",  tag:"mo", output:"\u0394", tex:null, ttype:AM.TOKEN.CONST}); AM.symbols.push({input:"Sup",  tag:"mo", output:"sup", tex:null, ttype:AM.TOKEN.UNDEROVER}); AM.symbols.push({input:"inf",  tag:"mo", output:"inf", tex:null, ttype:AM.TOKEN.UNDEROVER}); AM.symbols.push({input:"bm", tag:"mstyle", atname:"mathvariant", atval:"bold-italic", output:"bm", tex:null, ttype:AM.TOKEN.UNARY}); AM.symbols.push({input:"rm", tag:"mstyle", atname:"mathvariant", atval:"serif", output:"rm", tex:null, ttype:AM.TOKEN.UNARY}); });';
		document.body.appendChild(newScript);

		newScript = document.createElement('script');
		newScript.async = true;
		newScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=AM_HTMLorMML-full';
		document.body.appendChild(newScript);
	}
}

// ---- functions ----

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
	h1.innerHTML = ( zhname[abbr] === undefined
		? ''
		: zhname[abbr]
	) + index + ': ' + document.title;
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

function decorate(list) {
	for (var i = 0; i < list.length; ++i) {
		var elem = ( list[i].getBy === 'class'
			? document.getElementsByClassName(list[i].name)
			: document.getElementsByTagName(list[i].name)
		);

		if (list[i].style === style_formula) {
			for (var j = 0; j < elem.length; j++) {
				elem[j].title = elem[j].innerHTML
					= list[i].style(list[i].word, j);
			}
		} else {
			for (var j = 0; j < elem.length; j++) {
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

function hideAnswer(list) {
	for (var i = 0; i < list.length; ++i) {
		var answers = document.getElementsByClassName(list[i].name);
		for (var j = 0; j < answers.length; ++j) {
			var button = document.createElement('button');
			var id = list[i].name + '-' + filename + '-' + (j+1);
			button.innerHTML = list[i].word + ' &#9654;';
			button.onclick = toggleShowAnswer(button, id);
			button.className = 'toggle-show-answer';
			answers[j].parentElement.insertBefore(button, answers[j]);
			answers[j].hidden = 'true';
			answers[j].id = id;
		}
	}
}

function toggleShowAnswer(button, id) {
	return function() {
		var answer = document.getElementById(id);
		if (answer.hidden) {
			answer.removeAttribute('hidden');
			button.innerHTML = button.innerHTML[0] + ' &#9660;';
			button.style.borderRadius = '0.5em 0.5em 0 0';
		} else {
			answer.hidden = true;
			button.innerHTML = button.innerHTML[0] + ' &#9654;';
			button.style.borderRadius = '0.5em';
		}
	};
}

function makeReference() {
	var refs = document.getElementsByClassName('ref');
	for (var i = 0; i < refs.length; ++i) {
		var index = refs[i].href.indexOf('#');
		var id = refs[i].href.substring(index+1);
		var refed = document.getElementById(id);
		if (refed) {
			refs[i].innerHTML = refed.title;
		} else {
			console.warn('reference "' + id + '" not found');
		}
	}
}

// ---- data & function call ----

init();
makeH1();
//makeNav();

var style_name = function() {
	return document.createTextNode(filename);
};

var style_name_num = function(word, i) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word + filename + '-' + (i+1);
	return newItem;
};

var style_num = function(word, i) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word + (i+1);
	return newItem;
};

var style_void = function(word) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word;
	return newItem;
};

var style_formula = function(word, i) {
	return '(' + filename + '-' + (i+1) + ')';
};

decorate([
	{name:'title', getBy:'tag', word:'', style:style_name},
	{name:'h2', getBy:'tag', word:'', style:style_name_num},
	{name:'theorem', getBy:'class', word:'定理', style:style_name_num},
	{name:'definition', getBy:'class', word:'定义', style:style_name_num},
	{name:'lemma', getBy:'class', word:'引理', style:style_name_num},
	{name:'corollary', getBy:'class', word:'推论', style:style_name_num},
	{name:'example', getBy:'class', word:'例', style:style_name_num},
	{name:'algorithm', getBy:'class', word:'算法', style:style_name_num},
	{name:'construction', getBy:'class', word:'作图', style:style_name_num},
	{name:'graph', getBy:'class', word:'图', style:style_name_num},
	{name:'remark', getBy:'class', word:'注', style:style_name_num},
	{name:'question', getBy:'class', word:'问题', style:style_name_num},
	{name:'principle', getBy:'class', word:'原理', style:style_name_num},
	{name:'axiom', getBy:'class', word:'公理', style:style_name_num},
	// place this before '证' and '解'. got problem with the numbering.
	{name:'method', getBy:'class', word:'法', style:style_num},
	{name:'label', getBy:'class', word:'', style:style_formula},
]);

hideAnswer([
	{name:'proof', word:'证'},
	{name:'solution', word:'解'},
	{name:'answer', word:'答'},
	{name:'collapse', word:''},
]);

// call makeReference() after decorate()
makeReference();

})();

// ---- this function will be called after asciimathml.js  ----

function genericJunior() {
	/*
	(function labelHeight() {
		var labels = document.getElementsByClassName('label');
		for (var i = 0; i < labels.length; ++i) {
			var h = labels[i].parentElement.clientHeight + 'px';
			labels[i].style.lineHeight = h;
		}
	})();
	*/
}

//setup onload function
if(typeof window.addEventListener != 'undefined'){
  //.. gecko, safari, konqueror and standard
  window.addEventListener('load', genericJunior, false);
}
else if(typeof document.addEventListener != 'undefined'){
  //.. opera 7
  document.addEventListener('load', genericJunior, false);
}
else if(typeof window.attachEvent != 'undefined'){
  //.. win/ie
  window.attachEvent('onload', genericJunior);
}else{
  //.. mac/ie5 and anything else that gets this far
  //if there's an existing onload function
  if(typeof window.onload == 'function'){
    //store it
    var existing = onload;
    //add new onload handler
    window.onload = function(){
      //call existing onload function
      existing();
      //call genericJunior onload function
      genericJunior();
    };
  }else{
    window.onload = genericJunior;
  }
}
