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

function processWords(className) {
    var list = document.getElementsByClassName(className);
    for (item of list) {
        // 这里如用 innerText, 汉字间的换行符会消失
        item.innerHTML = item.innerHTML.replace(
            /(\S+)/g, '<span class="phonic-word">$1</span>'
        );
    }
}

function processWord(className) {
    var list = document.getElementsByClassName(className);
    for (item of list) {
        // 暂且对多个汉字的注音作此处理
        var r1 = /([^{]){([^{].*?)}/g;
        var r2 = /(.{2}){2([^\d].*?)}/g;
        var r3 = /(.{3}){3([^\d].*?)}/g;
        var r4 = /(.{4}){4([^\d].*?)}/g;
        var matched = false;
        var replace_str = '<span class="phonic-char" phonic="$2">$1</span>';
        // 保留 <center> 标签中的换行符
        if (item.tagName.toLowerCase() == 'center') {
            item.innerHTML = item.innerHTML.replace(/\n/g, '<br>');
        }

        var s = item.innerText;
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
        s = s.replaceAll('\n', '<br>') // 还原换行符
             .replaceAll('{{', '{')
             .replaceAll('}}', '}');
        if (matched) {
            item.innerHTML = s
        }
    }
}

function processChar(className) {
    var list = document.getElementsByClassName(className);
    for (item of list) {
        var phonicText = item.getAttribute('phonic');
        var baseText = item.innerText;
        if (phonicText) {
            item.innerHTML =
                '<span class="phonic">' + phonicText + '</span>' + baseText;
        }
    }
}

processWords('phonic-words');
processWord('phonic-word');
processWord('phonic-text');
processChar('phonic-char');

})();
