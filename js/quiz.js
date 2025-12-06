// import 'ui.js'
class Quiz {

  constructor ({ el, uid }) {
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
    this.queue = []
  }

  // 产生下一题的 id
  poll () {
    if (this.needUpdate()) {
      console.log('reset queue')
      this.queue = this.gen()
    }
    this.questionId = this.queue.shift()
    return this.questionId
  }

  // 产生下一题
  next () {
    const questionId = this.poll()
    return this.mapper(questionId)
  }

  onMistake (userChoice) {
    // 加入两个待复习的错题
    this.queue.push(this.questionId)
    this.queue.push(this.questionId)
    Quiz.shuffle(this.queue)
  }

  // <button class="quiz-start" onclick="startTest()">开始测试</button>
  // <p class="quiz-question"></p>
  // <p class="quiz-choices">
  //  <button class="quiz-choice"></button>
  //  ...
  // </p>
  // <p class="quiz-message"></p>
  // <button class="quiz-next" onclick="showNext()">下一个</button>
  // ...
  // <button class="quiz-stat" onclick="stat()">统计</button>
  initDom (el) {
    this.$start = $('<button>', {
      innerText: '开始测试',
      className: ['btn', 'quiz-start'],
      onclick: () => {
        this.$start.style.display = 'none'
        this.showNext()
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
      onclick: this.showNext.bind(this)
    })
    this.$stat = $('<button>', {
      className: ['btn', 'quiz-stat'],
      innerText: '统计',
      onclick: this.stat.bind(this)
    })
    this.$modal = $('<div>', {
      id: 'quiz-stat-modal',
      style: {
        display: 'none'
      }
    })
    appendChildren(el, [
      this.$start,
      this.$question,
      this.$choice,
      this.$message,
      this.$next,
      this.$stat,
      this.$modal,
    ])
    this.$modal = new Modal('quiz-stat-modal')

    document.onkeydown = (e) => {
      if (this.lastCorrect == false) {
        if (e.code == 'Enter') {
          this.showNext()
        }
        this.lastCorrect = true
      } else { // undefined, true
        const i = e.keyCode - 49 // 1, 2, 3, 4 -> 0, 1, 2, 3
        if (0 <= i && i <= 3) {
          this.choose(i)
        }
      }
    }
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
      this.onCorrect && this.onCorrect(i) // hook
      this.$message.classList.remove('wrong')
      //this.$message.style.color = '#080'
      //this.$message.innerHTML = '正确!'
      this.info.addCorrect()
      this.showNext()
      this.lastCorrect = true
    } else {
      this.onMistake && this.onMistake(i) // hook
      this.$message.classList.add('wrong')
      this.$message.innerHTML = this.getMessage()
      this.info.addMistake()
      this.info.addQuestion(this.value.question)
      this.showNextButton()
      this.lastCorrect = false
    }
  }

  showNext () {
    this.value = this.next()
    if (!this.value) {
      alert('恭喜，您已完成最后一题！')
      return false
    }

    this.$message.innerHTML = ''
    this.$message.classList.remove('wrong')
    this.$choice.innerHTML = ''
    this.$next.style.display = 'none'

    // this.value: {
    //   question: string,
    //   choices: [{ label: string, isAnswer: boolean }]
    // }
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
    arr.sort(() => 0.5-Math.random())
  }

  static alpha (n) {
    return String.fromCharCode(65+n) // A=0, B=1
  }

  /**
   * 从 0 ~ n-1 中随机抽取 k 个不重复的数字,
   * 要求含有 include 中的数字, 但不含 exclude 中的数字
   * @param {Number} n
   * @param {Number} k
   * @param {Array} include
   * @param {Array} exclude
   */
  static sample (n, k = 1, include = [], exclude = []) {
    const ret = include.slice()
    const len = n
    n -= include.length + exclude.length
    k -= include.length
    for (let i = 0; i < len; ++i) {
      if (exclude.indexOf(i) > -1 || include.indexOf(i) > -1) continue
      if (Math.random() < k/n) {
        ret.push(i)
        if (--k === 0) break
      }
      --n
    }
    Quiz.shuffle(ret)
    return ret
  }
}
