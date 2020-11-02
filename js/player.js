var Player;

(function(){

// time
var times = {};

// pitch
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

// tone
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

var defaultNote = {
    time: times['8'],
    pitch: A4,
    volume: 0.5,
    tone: tones.sin
};

// sample & audio
var audioServer = null;
var SAMPLE_RATE = 8000;
var hasAudio = true;
var isPlaying = false;
var sample = [];
var userTrack = [];
var track = [];
var trackPos = 0;
var trackReady = false;

function initServer() {
    if (audioServer)
        return;
    audioServer = new XAudioServer(
        1,                // channels
        SAMPLE_RATE,      // sample rate
        SAMPLE_RATE / 4,  // buffer_low
        SAMPLE_RATE * 2,  // buffer_size
        generator,        // callback when samples remaining < buffer_low
        1,                // volume
        failureCallback   // callback when brower has no audio API
    );

    setInterval(function() {
        if (isPlaying) {
            audioServer.executeCallback();
        }
    }, 20);
}

function sum(arr) {
    return arr.reduce(function(x,y) {return x+y}, 0);
}

function makeSample(note) {
    var duration = SAMPLE_RATE * note.time / 1000;
    if (note.pitch instanceof Array) {
        var omega = note.pitch.map(function(x) {
            return 2 * x / SAMPLE_RATE;
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
        var omega = 2 * note.pitch / SAMPLE_RATE;
        for (var i = 0; i < duration; ++i) {
            sample.push(note.tone(i * omega) * note.volume);
        }
    }
}

function generator(need) {
    var ret;
    if (need <= 0) {
        isPlaying = false;
        ret = [];
    } else if (sample.length < need) {
        while (trackPos < track.length && sample.length < need) {
            makeSample(track[trackPos++]);
        }
        ret = sample;
        sample = [];
    } else {
        ret = sample.slice(0, need);
        sample = sample.slice(need);
    }
    return ret;
}

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

function setTime(note, i) {
    if (typeof note.time === 'string') {
        var ratio = 1;
        if (/^(\d*\.)?\d+b$/.test(note.time)) { // unit: beat
            note.time = parseFloat(note.time) * times['4'];
            return;
        } else if (/^\d+\/\d+$/.test(note.time)) { // ratio
            var ratio = note.time.split('/');
            note.time = parseInt(ratio[0]) / parseInt(ratio[1]) * times['4'];
            return;
        } else {
            if (note.time.slice(-1) == '.') { // dot
                note.time = note.time.slice(0, -1);
                ratio = 1.5;
            }
            if (!(note.time in times))
                console.warn('track[' + i + ']: invalid time');
            note.time = times[note.time] * ratio;
        }
    }
    if (!note.time && note.time !== 0) {
        note.time = defaultNote.time;
    }
}

function setVolume(note, i) {
    if (!note.volume && note.volume !== 0) {
        note.volume = defaultNote.volume;
    } else {
        note.volume = between(note.volume, 0, 1);
    }
}

function setTone(note, i) {
    if (typeof note.tone === 'string') {
        note.tone = tones[note.tone];
        if (!(note.tone in tones))
            console.warn('track[' + i + ']: invalid tone');
    }
    if (!note.tone) {
        note.tone = defaultNote.tone;
    }
}

function processPitch(pitch, i) {
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
        pitch = defaultNote.pitch;
    } else {
        pitch = between(pitch, 20, 10000);
    }
    return pitch;
}

function buildTrack() {
    //console.log('buildTrack');
    track = userTrack; // pass by reference
    if (track.length == 0)
        return;
    // append 1s of silence lest the browser keeps beeping
    if (track[track.length-1].volume !== 0) {
        track.push({time: 1000, pitch: 'A4', volume: 0});
    }

    track.forEach(function(note, i) {
        setTime(note, i);
        setVolume(note, i);
        setTone(note, i);
        if (note.pitch instanceof Array) {
            note.pitch.forEach(function(p, j) {
                note.pitch[j] = processPitch(p, i);
            });
        } else {
            note.pitch = processPitch(note.pitch, i);
        }
    });
    //console.log(track);
    trackReady = true;
}

function stop() {
    isPlaying = false;
    sample = [];
    if (audioServer)
        audioServer.changeVolume(0);
}

function play() {
    stop();
    if (!audioServer)
        initServer();
    if (!trackReady)
        buildTrack();
    if (track.length > 0) {
        isPlaying = true;
        trackPos = 0;
        audioServer.changeVolume(1);
    }
}

Player = function(getTrack) {
    this.play = play;
    this.stop = stop;
    this.initServer = initServer;
    this.getTrack = getTrack; // callback that returns user input track
};

Player.prototype.updateTrack = function() {
    trackReady = false;
    userTrack = this.getTrack();
}

Player.prototype.setBpm = function(bpm) {
    //console.log('setBpm = ' + bpm);
    var quarter = 60000 / bpm;
    times = {
        '16': quarter / 4,
        '8': quarter / 2,
        '4': quarter,
        '2': quarter * 2,
        '1': quarter * 4,
    };
    defaultNote.time = times['8'];
    this.updateTrack();
}

})();

