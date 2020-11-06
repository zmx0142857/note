var Player;

(function(){

/* pitch */

var A4 = 440, A0 = 27.5, C1 = A0 * Math.pow(2, 1/4);
var names = ['C', '#C', 'D', '#D', 'E', 'F', '#F', 'G', '#G', 'A', '#A', 'B'];
var nameConversion = {
    'bD': '#C',
    'bE': '#D',
    'bG': '#F',
    'bA': '#G',
    'bB': '#A',
};
var pitches = {};
for (var i = 0; i < names.length; ++i) {
    pitches[names[i] + '1'] = C1 * Math.pow(2, i/12);
    for (var j = 2; j < 7; ++j) {
        pitches[names[i] + j] = pitches[names[i] + (j-1)] * 2;
    }
}
//console.log(pitches);

/* tone */

var mod = function(x, period) {
    x = x % period;
    return x < 0 ? x + period : x;
}

var tones = { // period = 2
    sin: function(x) {
        return Math.sin(Math.PI * x);
    },
    rect: function(x) {
        return mod(x, 2) < 1 ? 1 : -1;
    },
    saw: function(x) {
        x = mod(x + 0.5, 2);
        return x < 1 ? 1-2*x : 2*x-3;
    },
};

/* util functions */

function getTimes(bpm) {
    var quarter = 60000 / bpm;
    return {
        '16': quarter / 4,
        '8': quarter / 2,
        '4': quarter,
        '2': quarter * 2,
        '1': quarter * 4,
    };
}

function sum(arr) {
    return arr.reduce(function(x,y) {return x+y}, 0);
}

function makeSample(note, sampleRate, sample) {
    var duration = sampleRate * note.time / 1000;
    if (note.pitch instanceof Array) {
        var omega = note.pitch.map(function(x) {
            return 2 * x / sampleRate;
        });
        var volume = note.volume / Math.sqrt(note.pitch.length);
        for (var i = 0; i < duration; ++i) {
            sample.push(
                sum(omega.map(function(x) {
                    return note.tone(i * x);
                })) * volume
            );
        }
    } else {
        var omega = 2 * note.pitch / sampleRate;
        for (var i = 0; i < duration; ++i) {
            sample.push(note.tone(i * omega) * note.volume);
        }
    }
}

var hasAudio = true;
function failureCallback() {
    if (hasAudio) {
        // alert only once
        alert("Sorry your browser is unable to play the audio on this page.");
    }
    hasAudio = false;
}

function between(x, lo, hi) {
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
}

Player = function(getTrack) {
    this.getTrack = getTrack; // callback that returns user input track
    this.times = getTimes(120);
    this.defaultNote = {
        time: this.times['8'],
        pitch: A4,
        volume: 0.5,
        tone: tones.sin
    };
    this.audioServer = null;
    this.sampleRate = 8000;
    this.isPlaying = false;
    this.sample = [];
    this.userTrack = [];
    this.track = [];
    this.trackPos = 0;
    this.trackBuilt = false;
};


Player.prototype.initServer = function() {
    var _this = this;
    this.audioServer = new XAudioServer(
        1,                    // channels
        this.sampleRate,      // sample rate
        this.sampleRate / 4,  // buffer_low
        this.sampleRate * 2,  // buffer_size
        // callback when samples remaining < buffer_low
        function(need) {
            var ret;
            if (need <= 0) {
                _this.isPlaying = false;
                ret = [];
            } else if (_this.sample.length < need) {
                while (_this.trackPos < _this.track.length &&
                       _this.sample.length < need) {
                    makeSample(
                        _this.track[_this.trackPos++],
                        _this.sampleRate,
                        _this.sample
                    );
                }
                ret = _this.sample;
                _this.sample = [];
            } else {
                ret = _this.sample.slice(0, need);
                _this.sample = _this.sample.slice(need);
            }
            return ret;
        },
        1,                 // volume
        failureCallback    // callback when brower has no audio API
    );
    setInterval(function() {
        if (_this.isPlaying) {
            _this.audioServer.executeCallback();
        }
    }, 20);
}

Player.prototype.setTime = function(note, i) {
    if (typeof note.time === 'string') {
        var ratio = 1;
        if (/^(\d*\.)?\d+b$/.test(note.time)) { // unit: beat
            note.time = parseFloat(note.time) * this.times['4'];
            return;
        } else if (/^\d+\/\d+$/.test(note.time)) { // ratio
            var ratio = note.time.split('/');
            note.time = parseInt(ratio[0]) / parseInt(ratio[1]) * this.times['4'];
            return;
        } else {
            if (note.time.slice(-1) == '.') { // dot
                note.time = note.time.slice(0, -1);
                ratio = 1.5;
            }
            if (!(note.time in this.times))
                console.warn('track[' + i + ']: invalid time');
            note.time = this.times[note.time] * ratio;
        }
    }
    if (!note.time && note.time !== 0) {
        note.time = this.defaultNote.time;
    }
}

Player.prototype.setVolume = function(note, i) {
    if (!note.volume && note.volume !== 0) {
        note.volume = this.defaultNote.volume;
    } else {
        note.volume = between(note.volume, 0, 1);
    }
}

Player.prototype.setTone = function(note, i) {
    if (typeof note.tone === 'string') {
        note.tone = tones[note.tone];
        if (!(note.tone in tones))
            console.warn('track[' + i + ']: invalid tone');
    }
    if (!note.tone) {
        note.tone = this.defaultNote.tone;
    }
}

Player.prototype.processPitch = function(pitch, i) {
    if (typeof pitch === 'string') {
        // flat note
        if (pitch[0] == 'b') {
            pitch = nameConversion[pitch.slice(0,2)] + pitch.slice(2);
        }
        if (!(pitch in pitches))
            console.warn('track[' + i + ']: invalid pitch');
        pitch = pitches[pitch];
    }
    if (!pitch && pitch !== 0) {
        pitch = this.defaultNote.pitch;
    } else {
        pitch = between(pitch, 20, 10000);
    }
    return pitch;
}

Player.prototype.buildTrack = function() {
    //console.log('buildTrack');
    this.track = this.userTrack; // pass by reference
    if (this.track.length == 0)
        return;
    // append 1s of silence lest the browser keeps beeping
    if (this.track[this.track.length-1].volume !== 0) {
        this.track.push({time: 1000, pitch: 'A4', volume: 0});
    }

    var _this = this;
    this.track.forEach(function(note, i) {
        _this.setTime(note, i);
        _this.setVolume(note, i);
        _this.setTone(note, i);
        if (note.pitch instanceof Array) {
            note.pitch.forEach(function(p, j) {
                note.pitch[j] = _this.processPitch(p, i);
            });
        } else {
            note.pitch = _this.processPitch(note.pitch, i);
        }
    });
    //console.log(this.track);
    this.trackBuilt = true;
}

Player.prototype.stop = function() {
    this.isPlaying = false;
    this.sample = [];
    if (this.audioServer)
        this.audioServer.changeVolume(0);
}

Player.prototype.play = function() {
    this.stop();
    if (!this.audioServer)
        this.initServer();
    if (!this.trackUpdated)
        this.updateTrack();
    if (!this.trackBuilt)
        this.buildTrack();
    if (this.track.length > 0) {
        this.isPlaying = true;
        this.trackPos = 0;
        this.audioServer.changeVolume(1);
    }
}

Player.prototype.updateTrack = function() {
    //console.log('updateTrack');
    this.userTrack = this.getTrack();
    this.trackUpdated = true;
    this.trackBuilt = false;
}

Player.prototype.setBpm = function(bpm) {
    //console.log('setBpm = ' + bpm);
    this.times = getTimes(bpm);
    this.defaultNote.time = this.times['8'];
    this.trackUpdated = false;
}

})();

