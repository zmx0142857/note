/* usage:
 * <span class="phonic-words">
 *   骨髓{suǐ} 给{gěi}以 憎恨{2zēnghèn}
 * </span>
 *
 * or:
 * <span class="phonic-word">骨髓{suǐ}</span>
 * <span class="phonic-word">给{gěi}以</span>
 * <span class="phonic-word">憎恨{2zēnghèn}</span>
 *
 * or:
 * <!-- '骨' 和 <span> 之间不要有空白 -->
 * <span class="phonic-word">
 *   骨<span class="phonic-char">
 *    髓 <span class="phonic">suǐ</span>
 *   </span>
 * </span>
 * <!-- <span> 和 '以' 之间也不要有空白 -->
 * <span class="phonic-word">
 *   <span class="phonic-char">
 *     给 <span class="phonic">gěi</span>
 *   </span>以
 * </span>
 * <span class="phonic-word">
 *   <span class="phonic-char">
 *  憎恨 <span class="phonic">zēnghèn</span>
 *   </span>
 * </span>
 *
 * to input literal {}, use {{}}
 */
(function(){

function process(className, callback) {
    var list = document.getElementsByClassName(className);
    for (var i = 0; i < list.length; ++i) {
        var el = list[i];
        // 这里如用 innerText, 汉字间的换行符会消失
        el.innerHTML = callback(el.innerHTML, el);
    }
}

function words(s) {
    return s.replace(/(\S+)/g, '<span class="phonic-word">$1</span>');
}

function word(s, el) {
    // 保留 <center> 标签中的换行符
    if (el.tagName.toLowerCase() == 'center') {
        s = s.replace(/\n/g, '<br>');
    }
    // 暂且对多个汉字的注音作此处理
    var regs = [
        /(.{4}){4([^\d].*?)}/g,
        /(.{3}){3([^\d].*?)}/g,
        /(.{2}){2([^\d].*?)}/g,
        /([^{]){([^{]*?)}/g,
    ];
    var replace_str = '<span class="phonic-char" phonic="$2">$1</span>';
    for (var i = 0; i < regs.length; ++i) {
        if (regs[i].test(s)) {
            s = s.replace(regs[i], replace_str);
        }
    }
    s = s.replace(/\n/g, '<br>') // 还原换行符
         .replace(/{{/g, '{')    // 花括号转义
         .replace(/}}/g, '}');
    return s;
}

function char(s, el) {
    var phonic = el.getAttribute('phonic');
    if (phonic) {
        return '<span class="phonic">' + phonic + '</span>' + s;
    } else {
        return s;
    }
}

process('phonic-words', words);
process('phonic-word', word);
process('phonic-text', word);
process('phonic-char', char);

})();
