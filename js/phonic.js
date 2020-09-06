(function(){

var words = document.getElementsByClassName('word');
for (w of words) {
	// 暂且对多个汉字的注音作此处理
	var r1 = /(.)\((.+?)\)/g;
	var r2 = /(.{2})\(2([^\d].*?)\)/g;
	var r3 = /(.{3})\(3([^\d].*?)\)/g;
	var r4 = /(.{4})\(4([^\d].*?)\)/g;
	var s = w.innerText;
	var matched = false;
	var replace_str = '<span class="char" phonic="$2">$1</span>';
	if (r4.test(s)) {
		matched = true;
		s = s.replace(r4, replace_str);
	}
	if (r3.test(s)) {
		matched = true;
		s = s.replace(r3, replace_str);
	}
	if (r2.test(s)) {
		matched = true;
		s = s.replace(r2, replace_str);
	}
	if (r1.test(s)) {
		matched = true;
		s = s.replace(r1, replace_str);
	}
	if (matched)
		w.innerHTML = s;
}
var char = document.getElementsByClassName('char');
for (k of char) {
	var phonic = document.createElement('span');
	phonic.innerText = k.getAttribute('phonic');
	phonic.classList.add('phonic');
	k.appendChild(phonic);
}

})();
