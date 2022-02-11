class Quiz {

  constructor (el, generator, uid) {
    this.generator = generator
    this.initDom(el)

    const UUID = 'io.zmx0142857.' + uid + '.'
    function getStorage(key, defaultVal) {
      return localStorage[UUID+key] || defaultVal
    }
    function setStorage(key, value) {
      localStorage[UUID+key] = value
    }
    this.info = {
      correctCnt: parseInt(getStorage('correctCnt', 0)),
      mistakeCnt: parseInt(getStorage('mistakeCnt', 0)),
      mistakes: JSON.parse(getStorage('mistakes', '{}')),
      clear () {
        this.correctCnt = 0
        this.mistakeCnt = 0
        this.mistakes = {}
        setStorage('correctCnt', 0)
        setStorage('mistakeCnt', 0)
        setStorage('mistakes', '{}')
      },
      addCorrect () {
        ++this.correctCnt;
        setStorage('correctCnt', this.correctCnt);
      },
      addMistake () {
        ++this.mistakeCnt;
        setStorage('mistakeCnt', this.mistakeCnt);
      },
      addQuestion (question) {
        if (this.mistakes[question])
          ++this.mistakes[question];
        else
          this.mistakes[question] = 1;
        // 低效
        setStorage('mistakes', JSON.stringify(this.mistakes))
      }
    }
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
  initDom (el) {
    this.$start = $('<button>', {
      innerText: '开始测试',
      className: ['btn', 'quiz-start'],
      onclick: () => {
        this.$start.style.display = 'none'
        this.next()
      },
    })
    this.$question = $('<p>', {
      className: 'quiz-question'
    })
    this.$choice = $('<p>', {
      className: 'quiz-choices',
    })
    this.$message = $('<p>', {
      className: 'quiz-message'
    })
    this.$next = $('<button>', {
      className: ['btn', 'quiz-next'],
      innerText: '下一个',
      style: {
        display: 'none',
      },
      onclick: this.next.bind(this)
    })
    this.$stat = $('<button>', {
      className: ['btn', 'quiz-stat'],
      innerText: '统计',
      onclick: this.stat.bind(this)
    })
    appendChildren(el, [
      this.$start,
      this.$question,
      this.$choice,
      this.$message,
      this.$next,
      this.$stat
    ])
    document.onkeydown = (e) => {
      if (this.lastCorrect == false) {
        if (e.code == 'Enter') {
          this.next()
        }
        this.lastCorrect = true
      } else { // undefined, true
        const i = e.keyCode - 49 // 1, 2, 3, 4 -> 0, 1, 2, 3
        if (0 <= i && i <= 3) {
          this.choose(i)
        }
      }
    }

    this.$modal = new Modal('quiz-stat-modal')
  }

  getMessage () {
    return '答案: ' + this.value.choices
      .filter(function(c){ return c.isAnswer })
      .map(function(c){ return c.label })
      .join(', ')
  }

  showNextButton () {
    this.$next.style.display = 'inline'
    const buttons = $('.quiz-choice')
    for (let i = 0; i < buttons.length; ++i) {
      buttons[i].onclick = null
    }
  }

  choose (i) {
    if (this.value.choices[i].isAnswer) {
      this.onCorrect && this.onCorrect() // hook
      this.$message.classList.remove('wrong')
      //this.$message.style.color = '#080'
      //this.$message.innerHTML = '正确!'
      this.info.addCorrect()
      this.next()
      this.lastCorrect = true
    } else {
      this.onMistake && this.onMistake() // hook
      this.$message.classList.add('wrong')
      this.$message.innerHTML = this.getMessage()
      this.info.addMistake()
      this.info.addQuestion(this.value.question)
      this.showNextButton()
      this.lastCorrect = false
    }
  }

  next () {
    const data = this.generator.next() // {value: ??, done: ??}
    if (data.done) return false

    this.$message.innerHTML = ''
    this.$message.classList.remove('wrong')
    this.$choice.innerHTML = ''
    this.$next.style.display = 'none'

    // {question: ??, choices: [ {label: ??, isAnswer: ??}... ]}
    this.value = data.value
    this.$question.innerHTML = this.value.question
    appendChildren(this.$choice, this.value.choices.map((c, i) => {
      return $('<button>', {
        innerText: c.label,
        className: ['btn', 'quiz-choice'],
        onclick: () => this.choose(i)
      })
    }))
    this.onQuestionLoad && this.onQuestionLoad() // hook
    return true
  }

  stat () {
    this.$modal.toggle()
    this.$modal.elem.innerHTML = `
      <div class="quiz-stat-wrap">
        <button class="quiz-stat-clear">清空统计</button>
        <p>正确: ${this.info.correctCnt}</p>
        <p>错误: ${this.info.mistakeCnt}</p>
        <ul class="quiz-stat-list">
          ${Object.keys(this.info.mistakes).map(q => {
            return `<li>${q} (${this.info.mistakes[q]})</li>`
          }).join('')}
        </ul>
      </div>
    `
    const clearBtn = this.$modal.elem.querySelector('.quiz-stat-clear')
    clearBtn.onclick = () => {
      if (confirm('确定要清空统计吗？')) {
        this.info.clear()
        this.$modal.toggle()
      }
    }
  }

  static shuffle (arr) {
    arr.sort(function(){return 0.5-Math.random()})
  }

  static alpha (n) {
    return String.fromCharCode(65+n) // A=0, B=1
  }

  static pick (arr, n) {
    return []
  }
}
