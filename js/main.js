'use strict';

// 'A2.html', '2-1.html'
var filename = window.location.href.split('/');
filename = filename[filename.length-1].split('.')[0];

// replace '%23' with '#'
if (filename.substring(0, 3) === '%23')
	filename = '#' + filename.substring(3);

// filename[i] is the first digit or the first char after '-'
var i = filename.search(/[0-9]/);
if (filename.indexOf('-') > i) {
	i = filename.indexOf('-') + 1;
}

// other globals
var abbr = filename.substring(0, i);		// 'A' or ''
var n = parseInt(filename.substring(i));	// 2 in 'A2' or 1 in '2-1'
var zhname = '';
if (abbr != '') {
	if (abbr == '#')
		zhname = '附录篇';
	else if (abbr == 'A')
		zhname = '分析篇';
	else if (abbr == 'AL')
		zhname = '算法篇';
	else if (abbr == 'D')
		zhname = '离散篇';
	else if (abbr == 'E')
		zhname = '方程篇';
	else if (abbr == 'G')
		zhname = '几何篇';
	else if (abbr == 'I')
		zhname = '代数篇';
	else if (abbr == 'S')
		zhname = '概率统计篇';
	else
		zhname = abbr;
}
zhname += n;

function style_name() {
	return document.createTextNode(filename);
}

function style_name_num(word, i) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word + filename + '-' + (i+1);
	return newItem;
}

function style_num(word, i) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word + (i+1);
	return newItem;
}

function style_void(word) {
	var newItem = document.createElement('b');
	newItem.innerHTML = word;
	return newItem;
}

function style_formula(word, i) {
	return '(' + filename + '-' + (i+1) + ')';
}

function decorate(name, word, style=style_name_num, get_by='class') {
	var elem;
	if (get_by === 'class') {
		elem = document.getElementsByClassName(name);
	} else {
		elem = document.getElementsByTagName(name);
	}

	var i;
	if (style === style_formula) {
		for (i = 0; i < elem.length; i++)
			elem[i].innerHTML = style(word, i);
	} else {
		for (i = 0; i < elem.length; i++) {
			if (!elem[i].classList.contains("nonu")) {
				var space = document.createTextNode(' ');
				elem[i].insertBefore(space, elem[i].firstChild);
				elem[i].insertBefore(style(word, i), elem[i].firstChild);
			}
		}
	}
}

function make_h1() {
	var h1 = document.createElement('h1');
	h1.innerHTML = (zhname == 'NaN' ? document.title
			: zhname + ': ' + document.title);
	document.body.insertBefore(h1, document.body.firstChild);
}

/*	<div id="nav">
		<a href="prev.html" id="prev">&lt;&lt;&lt;</a>
		<a href="index.html" target="_blank">· · ·</a>
		<a href="next.html" id="next">&gt;&gt;&gt;</a>
	</div>
*/
function make_nav() {
	var nav = document.createElement('div');
	nav.id = 'nav';
	document.body.insertBefore(nav, document.body.firstChild);

	var prev = document.createElement('a');
	prev.id = 'prev';
	prev.innerHTML = '&lt;&lt;&lt;';
	if (n > 1) {
		prev.href = (abbr === '#' ? '%23' : abbr) + (n-1) + '.html';
	} else {
		prev.style="color: rgba(0,0,0,0)";
	}
	nav.appendChild(prev);

	var index = document.createElement('a');
	index.href = 'index.html';
	index.target = '_blank';
	index.innerHTML = '· · ·';
	nav.appendChild(index);

	var next = document.createElement('a');
	next.href = (abbr === '#' ? '%23' : abbr) + (n+1) + '.html';
	next.id = 'next';
	next.innerHTML = '&gt;&gt;&gt;';
	nav.appendChild(next);
}

function hideAnswers(classNames) {
	for (var className of classNames) {
		console.log(className);
		var answers = document.getElementsByClassName(className);
		for (var i = 0; i < answers.length; ++i) {
			var button = document.createElement('button');
			var id = className + '-' + filename + '-' + (i+1);
			button.innerHTML = '+';
			button.onclick = toggleShowAnswer(button, id);
			button.style = "width: 18px; height: 18px; border: none; border-radius: 9px; text-align: center; line-height: 18px; color: white; font-size: 16px; background: rgba(0, 0, 0, 0.5)";
			document.body.insertBefore(nav, document.body.firstChild);
			answers[i].parentElement.insertBefore(button, answers[i]);
			answers[i].hidden = 'true';
			answers[i].id = id;
		}
	}
}

function toggleShowAnswer(button, id) {
	return function() {
		console.log(id);
		var answer = document.getElementById(id);
		if (button.innerHTML == '+') {
			button.innerHTML = '-';
			answer.removeAttribute('hidden');
		} else {
			button.innerHTML = '+';
			answer.hidden = 'true';
		}
	};
}

make_h1();
make_nav();
decorate('title', '', style_name, 'tag');
decorate('h2', '', style_name_num, 'tag');
decorate('theorem', '定理');
decorate('definition', '定义');
decorate('lemma', '引理');
decorate('corollary', '推论');
decorate('example', '例');
decorate('note', '注');
decorate('method', '法', style_num); // place this before '证' and '解'. got problem with the numbering.
decorate('label', '', style_formula);
decorate('prove', '证', style_void);
decorate('solve', '解', style_void);
decorate('answer', '答', style_void);
hideAnswers(['prove', 'solve', 'answer', 'collapse']);
