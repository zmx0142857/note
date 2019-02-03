'use strict';

// ---- globals & initiation ----

var url;		// 'A2', '%234', '3-1'
var filename;	// 'A2', '#4',   '3-1'	// replace leading '%23' with '#'
var abbr;		// 'A',  '#',    '3-'
var url_abbr;   // 'A',  '%234', '3-'
var fileindex;  // 2,    4,      1

function init() {
	url = window.location.href.split('/');
	url = url[url.length-1].split('.')[0];

	filename = ( url.substring(0, 3) === '%23'
		? '#' + url.substring(3)
		: url
	);

	// locate first digit, or the first char after '-'
	var index_of_minus = filename.indexOf('-');
	var i = filename.search(/[0-9]/);
	if (index_of_minus > i) {
		i = index_of_minus + 1;
	}

	abbr = filename.substring(0, i);
	url_abbr = (abbr === '#' ? '%23' : abbr);
	fileindex = parseInt(filename.substring(i));
}

init();

// ---- functions ----

function make_h1() {
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
		? document.title
		: zhname[abbr] + ': ' + document.title
	);
	document.body.insertBefore(h1, document.body.firstChild);
}

/*
	<div id="nav">
		<a href="prev.html" style="float:left">&lt;&lt;&lt;</a>
		<a href="index.html" target="_blank">· · ·</a>
		<a href="next.html" style="float:right">&gt;&gt;&gt;</a>
	</div>
*/
function make_nav() {
	var nav = document.createElement('div');
	nav.id = 'nav';
	document.body.insertBefore(nav, document.body.firstChild);

	var prev = document.createElement('a');
	prev.style.float = 'left';
	prev.innerHTML = '&lt;&lt;&lt;';
	if (fileindex > 1) {
		prev.href = url_abbr + (fileindex-1) + '.html';
	} else {
		prev.style.color = 'rgba(0,0,0,0)';
	}
	nav.appendChild(prev);

	var index = document.createElement('a');
	index.href = '../index.html';
	index.target = '_blank';
	index.innerHTML = '· · ·';
	nav.appendChild(index);

	var next = document.createElement('a');
	next.href = url_abbr + (fileindex+1) + '.html';
	next.style.float = 'right';
	next.innerHTML = '&gt;&gt;&gt;';
	nav.appendChild(next);
}

function decorate(list) {
	for (var i = 0; i < list.length; ++i) {
		var elem = ( list[i].get_by === 'class'
			? document.getElementsByClassName(list[i].name)
			: document.getElementsByTagName(list[i].name)
		);

		if (list[i].style === style_formula) {
			for (var j = 0; j < elem.length; j++) {
				elem[j].innerHTML = list[i].style(list[i].word, j);
			}
		} else {
			for (var j = 0; j < elem.length; j++) {
				if (elem[j].classList.contains('nonu')) {
					continue;
				}
				var space = document.createTextNode(' ');
				elem[j].insertBefore(space, elem[j].firstChild);
				elem[j].insertBefore(
					list[i].style(list[i].word, j), elem[j].firstChild
				);
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
			refs[i].innerHTML = refed.firstChild.innerHTML;
		} else {
			console.warn('reference "' + id + '" not found');
		}
	}
}

// ---- data & function call ----

make_h1();
make_nav();

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
	{name:'title', word:'', style:style_name, get_by:'tag'},
	{name:'h2', word:'', style:style_name_num, get_by:'tag'},
	{name:'theorem', word:'定理', style:style_name_num, get_by:'class'},
	{name:'definition', word:'定义', style:style_name_num, get_by:'class'},
	{name:'lemma', word:'引理', style:style_name_num, get_by:'class'},
	{name:'corollary', word:'推论', style:style_name_num, get_by:'class'},
	{name:'example', word:'例', style:style_name_num, get_by:'class'},
	{name:'algorithm', word:'算法', style:style_name_num, get_by:'class'},
	{name:'construction', word:'作图', style:style_name_num, get_by:'class'},
	{name:'graph', word:'图', style:style_name_num, get_by:'class'},
	{name:'note', word:'注', style:style_name_num, get_by:'class'},
	// place this before '证' and '解'. got problem with the numbering.
	{name:'method', word:'法', style:style_num, get_by:'class'},
	{name:'label', word:'', style:style_formula, get_by:'class'},
]);

hideAnswer([
	{name:'proof', word:'证'},
	{name:'solution', word:'解'},
	{name:'answer', word:'答'},
	{name:'collapse', word:''},
]);

// call makeReference() after decorate()
makeReference();
