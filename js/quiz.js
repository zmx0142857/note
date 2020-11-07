var Quiz;

(function(){

// imitate jquery (迫真)
function $(str, child) {
  if (typeof(str) == 'string') {
    if (str[0] == '.')
      return document.getElementsByClassName(str.slice(1));
    if (str[0] == '<' && str.slice(-1) == '>') {
      str = str.slice(1,-1);
      var el = document.createElement(str);
      if (typeof child == 'string')
        el.appendChild(document.createTextNode(child));
      else if (child instanceof Node)
        el.appendChild(child);
      return el;
    }
  } else if (typeof(str) == 'undefined') {
    return document.createDocumentFragment();
  }
}

// TODO: 为不同 quiz 的 localStorage 引入不同的 UUID
Quiz = function(el, generator, uid) {
    this.generator = generator;
    this.initDom(el);

    var UUID = 'io.zmx0142857.' + uid + '.';
    function getStorage(key, defaultVal) {
        return localStorage[UUID+key] || defaultVal;
    }
    function setStorage(key, value) {
        localStorage[UUID+key] = value;
    }
    this.info = {
        correctCnt: parseInt(getStorage('correctCnt', 0)),
        mistakeCnt: parseInt(getStorage('mistakeCnt', 0)),
        mistakes: JSON.parse(getStorage('mistakes', '{}')),
        addCorrect: function() {
            ++this.correctCnt;
            setStorage('correctCnt', this.correctCnt);
        },
        addMistake: function() {
            ++this.mistakeCnt;
            setStorage('mistakeCnt', this.mistakeCnt);
        },
        addQuestion: function(question) {
            if (this.mistakes[question])
                ++this.mistakes[question];
            else
                this.mistakes[question] = 1;
            // 低效
            setStorage('mistakes', JSON.stringify(this.mistakes));
        }
    };
}

// <button class="quiz-start" onclick="startTest()">开始测试</button>
// <p class="quiz-question"></p>
// <p class="quiz-choices">
//  <button class="quiz-choice"></button>
//  ...
// </p>
// <p class="quiz-message"></p>
// <button class="quiz-next" onclick="next()">下一个</button>
// ...
// <button class="quiz-stat" onclick="stat()">统计</button>
Quiz.prototype.initDom = function(el) {
    this.$start = $('<button>', '开始测试');
    this.$question = $('<p>');
    this.$choice = $('<p>');
    this.$message = $('<p>');
    this.$next = $('<button>', '下一个');
    this.$stat = $('<button>', '统计');
    this.$start.classList.add('quiz-start');
    this.$question.classList.add('quiz-question');
    this.$choice.classList.add('quiz-choices');
    this.$message.classList.add('quiz-message');
    this.$next.classList.add('quiz-next');
    this.$stat.classList.add('quiz-stat');
    el.appendChild(this.$start);
    el.appendChild(this.$question);
    el.appendChild(this.$choice);
    el.appendChild(this.$message);
    el.appendChild(this.$next);
    el.appendChild(this.$stat);
    var _this = this;
    this.$start.onclick = function() {
        this.style.display = 'none';
        _this.next();
    }
    this.$next.style.display = 'none';
    this.$next.onclick = this.next.bind(this);
    document.onkeydown = onKeyDown.bind(this);
    this.$stat.onclick = this.stat.bind(this);
}

Quiz.prototype.getMessage = function() {
    return '答案: ' + this.value.choices
        .filter(function(c){ return c.isAnswer })
        .map(function(c){ return c.label })
        .join(', ');
}

Quiz.prototype.showNextButton = function() {
    this.$next.style.display = 'inline';
    var buttons = $('.quiz-choice');
    for (var i = 0; i < buttons.length; ++i) {
        buttons[i].onclick = null;
    }
}

Quiz.prototype.choose = function(i) {
	if (this.value.choices[i].isAnswer) {
        this.onCorrect && this.onCorrect(); // hook
        //this.$message.style.color = '#080';
        //this.$message.innerHTML = '正确!';
        this.info.addCorrect();
        this.next();
        this.lastCorrect = true;
	} else {
        this.onMistake && this.onMistake(); // hook
        this.$message.style.color = '#800';
        this.$message.innerHTML = this.getMessage();
        this.info.addMistake();
        this.info.addQuestion(this.value.question);
        this.showNextButton();
        this.lastCorrect = false;
	}
}

Quiz.prototype.next = function() {
    var data = this.generator.next(); // {value: ??, done: ??}
    if (data.done) return false;

	this.$message.innerHTML = '';
	this.$choice.innerHTML = '';
	this.$next.style.display = 'none';

    // {question: ??, choices: [ {label: ??, isAnswer: ??}... ]}
    this.value = data.value;
	var frag = $();
    var _this = this;
    this.$question.innerHTML = this.value.question;
    this.value.choices.forEach(function(c, i) {
		var button = $('<button>', c.label);
        button.classList.add('quiz-choice');
		button.onclick = function() { _this.choose(i) };
		frag.appendChild(button);
    });
	this.$choice.appendChild(frag);
    this.onQuestionLoad && this.onQuestionLoad(); // hook
    return true;
}

function onKeyDown(e) {
    if (this.lastCorrect == false) {
        if (e.code == 'Enter') {
            this.next();
        }
        this.lastCorrect = true;
    } else { // undefined, true
        var i = e.keyCode - 49; // 1, 2, 3, 4 -> 0, 1, 2, 3
        if (0 <= i && i <= 3) {
            this.choose(i);
        }
    }
}

Quiz.prototype.stat = function() {
    console.log({
        correctCnt: this.info.correctCnt,
        mistakeCnt: this.info.mistakeCnt,
        mistakes: this.info.mistakes
    });
}

// static util functions

Quiz.shuffle = function(arr) {
    arr.sort(function(){return 0.5-Math.random()});
}

Quiz.alpha = function(n) {
    return String.fromCharCode(65+n); // A=0, B=1
}

Quiz.pick = function(arr, n) {
    return [];
}

})();
