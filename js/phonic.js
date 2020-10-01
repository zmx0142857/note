/* usage:
 * <span class="words">
 *   骨髓(suǐ) 给(gěi)以 憎恨(2zēnghèn)
 * </span>
 * 
 * or:
 * <span class="word">骨髓(suǐ)</span>
 * <span class="word">给(gěi)以</span>
 * <span class="word">憎恨(2zēnghèn)</span>
 * 
 * or:
 * <!-- '骨' 和 <span> 之间不要有空白 -->
 * <span class="word">
 *   骨<span class="char">
 * 	  髓 <span class="phonic">suǐ</span>
 *   </span>
 * </span>
 * <!-- <span> 和 '以' 之间也不要有空白 -->
 * <span class="word">
 *   <span class="char">
 *     给 <span class="phonic">gěi</span>
 *   </span>以
 * </span>
 * <span class="word">
 *   <span class="char">
 * 	憎恨 <span class="phonic">zēnghèn</span>
 *   </span>
 * </span>
 */
(function(){

var wordss = document.getElementsByClassName('words');
for (words of wordss) {
	var s = words.innerHTML; // 这里如用 innerText, 汉字间的换行符会消失
	words.innerHTML = s.replace(/(\S+)/g, '<span class="word">$1</span>');
}

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
	var phonicText = k.getAttribute('phonic');
	if (phonicText) {
		var phonic = document.createElement('span');
		phonic.innerText = phonicText;
		phonic.classList.add('phonic');
		k.appendChild(phonic);
	}
}

})();
