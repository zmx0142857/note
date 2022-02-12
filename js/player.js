// import 'resampler', 'XAudioServer'
var Player

(function(){

function sum(arr) {
  return arr.reduce((x, y) => x + y, 0)
}

function between(x, lo, hi) {
  if (x < lo) return lo
  if (x > hi) return hi
  return x
}

function mod (x, period) {
  x = x % period
  return x < 0 ? x + period : x
}

class AudioService {

  constructor ({ sampleRate, getNode }) {
    this.hasAudio = true
    this.sample = []
    this.sampleRate = sampleRate
    this.getNode = getNode
    this.isPlaying = false
    this.server = new XAudioServer(
      1,              // channels
      sampleRate,     // sample rate
      sampleRate / 4, // buffer_low
      sampleRate * 2, // buffer_size
      this.generate.bind(this), // callback when samples.length < buffer_low
      1,                   // volume
      this.failureCallback.bind(this) // callback when brower has no audio API
    )
    setInterval(this.streaming.bind(this), 20)
  }

  play () {
    this.isPlaying = true
    this.server.changeVolume(1)
  }

  stop () {
    this.sample = []
    this.isPlaying = false
    this.server.changeVolume(0)
  }

  failureCallback () {
    if (this.hasAudio) {
      // alert only once
      alert("Sorry your browser is unable to play the audio on this page.")
    }
    this.hasAudio = false
  }

  streaming () {
    if (this.isPlaying) {
      this.server.executeCallback()
    }
  }

  // note: { pitch, time, volume, tone }
  makeSample (note) {
    const duration = this.sampleRate * note.time / 1000
    if (Array.isArray(note.pitch)) {
      const omega = note.pitch.map(x => 2 * x / this.sampleRate)
      const volume = note.volume / Math.sqrt(note.pitch.length)
      for (let i = 0; i < duration; ++i) {
        this.sample.push(
          sum(omega.map(x => note.tone(i * x))) * volume
        )
      }
    } else {
      const omega = 2 * note.pitch / this.sampleRate
      for (let i = 0; i < duration; ++i) {
        this.sample.push(note.tone(i * omega) * note.volume)
      }
    }
  }

  generate (need) {
    let ret
    if (need <= 0) {
      this.isPlaying = false
      ret = []
    } else if (this.sample.length < need) {
      while (this.sample.length < need) {
        const node = this.getNode()
        if (node) this.makeSample(node)
        else break
      }
      ret = this.sample
      this.sample = []
    } else {
      ret = this.sample.slice(0, need)
      this.sample = this.sample.slice(need)
    }
    return ret
  }
}

class PlayerClass {

  // 音色
  static tones = { // period = 2
    sin (x) {
      return Math.sin(Math.PI * x)
    },
    rect (x) {
      return mod(x, 2) < 1 ? 1 : -1
    },
    saw (x) {
      x = mod(x + 0.5, 2)
      return x < 1 ? 1 - 2 * x : 2 * x - 3
    },
  }

  // 音调
  static pitches = (function initPitches () {
    const A4 = 440, A0 = 27.5, C1 = A0 * Math.pow(2, 1 / 4)
    const names = ['C', '#C', 'D', '#D', 'E', 'F', '#F', 'G', '#G', 'A', '#A', 'B']
    const convert = { '#C': 'bD', '#D': 'bE', '#F': 'bG', '#G': 'bA', '#A': 'bB' }
    const pitches = {}
    names.forEach((name, i) => {
      const cname = convert[name] || name
      pitches[cname + '1'] = pitches[name + '1'] = C1 * Math.pow(2, i / 12)
      for (let j = 2; j < 7; ++j) {
        pitches[cname + j] = pitches[name + j] = pitches[name + (j - 1)] * 2
      }
    })
    return pitches
  })()

  // 节拍
  static getTimes (bpm) {
    const quarter = 60000 / bpm
    return {
      '16': quarter / 4,
      '8': quarter / 2,
      '4': quarter,
      '2': quarter * 2,
      '1': quarter * 4,
    }
  }

  constructor (getTrack) {
    this.defaultNote = {
      pitch: PlayerClass.pitches.A4,
      volume: 0.5,
      tone: PlayerClass.tones.sin
    }
    this.setBpm(120)

    this.getTrack = getTrack  // callback that returns userTrack
    this.userTrack = []       // user input track
    this.track = []           // track being played
    this.trackPos = 0         // current playing position
    this.trackBuilt = false
  }

  initService () {
    this.audioService = new AudioService({
      sampleRate: 8000,
      getNode: () => this.track[this.trackPos++]
    })
  }

  setTime (note, i) {
    if (typeof note.time === 'string') {
      if (/^(\d*\.)?\d+b$/.test(note.time)) { // unit: beat
        note.time = parseFloat(note.time) * this.times['4']
        return
      } else if (/^\d+\/\d+$/.test(note.time)) { // ratio
        const ratio = note.time.split('/')
        note.time = parseInt(ratio[0]) / parseInt(ratio[1]) * this.times['4']
        return
      } else {
        let ratio = 1
        if (note.time.slice(-1) === '.') { // dot
          note.time = note.time.slice(0, -1)
          ratio = 1.5
        }
        if (!(note.time in this.times))
          console.warn('track[' + i + ']: invalid time')
        note.time = this.times[note.time] * ratio
      }
    }
    if (!note.time && note.time !== 0) {
      note.time = this.defaultNote.time
    }
  }

  setVolume (note, i) {
    if (!note.volume && note.volume !== 0) {
      note.volume = this.defaultNote.volume
    } else {
      note.volume = between(note.volume, 0, 1)
    }
  }

  setTone (note, i) {
    const { tones } = PlayerClass
    if (typeof note.tone === 'string') {
      note.tone = tones[note.tone]
      if (!(note.tone in tones))
        console.warn('track[' + i + ']: invalid tone')
    }
    if (!note.tone) {
      note.tone = this.defaultNote.tone
    }
  }

  processPitch (pitch, i) {
    const { pitches } = PlayerClass
    if (typeof pitch === 'string') {
      pitch = pitches[pitch]
      if (!pitch)
        console.warn('track[' + i + ']: invalid pitch')
    }
    if (!pitch && pitch !== 0) {
      pitch = this.defaultNote.pitch
    } else {
      pitch = between(pitch, 20, 10000)
    }
    return pitch
  }

  setPitch (note, i) {
    if (Array.isArray(note.pitch)) {
      note.pitch = note.pitch.map(pitch => this.processPitch(pitch, i))
    } else {
      note.pitch = this.processPitch(note.pitch, i)
    }
  }

  buildTrack () {
    this.track = this.userTrack // pass by reference
    if (this.track.length === 0) return

    // append 1s of silence lest the browser keeps beeping
    if (this.track[this.track.length - 1].volume !== 0) {
      this.track.push({ time: 1000, pitch: 'A4', volume: 0 })
    }

    this.track.forEach((note, i) => {
      this.setTime(note, i)
      this.setVolume(note, i)
      this.setTone(note, i)
      this.setPitch(note, i)
    })
    this.trackBuilt = true
  }

  stop () {
    this.audioService && this.audioService.stop()
  }

  play () {
    this.stop()
    if (!this.audioService) this.initService()
    if (!this.trackUpdated) this.updateTrack()
    if (!this.trackBuilt) this.buildTrack()
    if (this.track.length > 0) {
      this.trackPos = 0
      this.audioService.play()
    }
  }

  updateTrack () {
    this.userTrack = this.getTrack()
    this.trackUpdated = true
    this.trackBuilt = false
  }

  setBpm (bpm) {
    this.times = PlayerClass.getTimes(bpm)
    this.defaultNote.time = this.times['8']
    this.trackUpdated = false
  }
}

Player = PlayerClass

})()
