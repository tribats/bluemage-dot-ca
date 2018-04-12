var Sequencer = {
  isPlaying: false,
  steps: 16,
  bpm: 120,
  audioContext: new AudioContext(),
  worker: new Worker("assets/sequencerWorker.js"),
  lookahead: 25.0,
  nextNoteTime: 0.0,
  currentNote: 0,
  noteLength: 0.05,
  scheduleAheadTime: 0.1,
  parent: null,
  wave: "sine",
  distortionValue: 0,
  distortion: null,
  filter: null,

  init: function (parent) {
    this.parent = parent;

    for (var i = 0; i < Sequencer.steps; i++) {
      var div = document.createElement("div");
      div.className = "step";
      var input = document.createElement("input");
      input.className = "step_" + i;
      input.type = "range";
      input.min = 100;
      input.max = 2000;
      input.value = 440;
      var noteLength = document.createElement("input");
      noteLength.className = "length_" + i;
      noteLength.type = "range";
      noteLength.min = 0.0;
      noteLength.max = 0.5;
      noteLength.step = 0.01;
      noteLength.value = 0.05;
      div.appendChild(input);
      div.appendChild(noteLength);
      parent.appendChild(div);
    }

    this.worker.onmessage = function (e) {
      if (e.data == "tick") {
        // console.log('tick!');
        Sequencer.scheduler();
      } else {
        // console.log('message: ' + e.data);
      }
    };

    this.distortion = Sequencer.audioContext.createWaveShaper();
    this.distortion.curve = this.makeDistortionCurve(this.distortionValue);

    this.filter = this.audioContext.createBiquadFilter();
    this.filter.type = "lowshelf";
    this.filter.frequency.value = 1000;
    this.filter.gain.value = 25;

    this.worker.postMessage({ interval: this.lookahead });
  },

  play: function () {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.currentNote = 0;
      this.nextNoteTime = Sequencer.audioContext.currentTime;
      Sequencer.worker.postMessage("start");
      return "stop";
    } else {
      Sequencer.worker.postMessage("stop");
      return "play";
    }
  },

  changeBpm: function (bpm) {
    this.bpm = bpm;
  },

  changeWave: function (wave) {
    this.wave = wave;
  },

  changeDistortionCurve: function (amount) {
    console.log("dist: " + amount);
    this.distortion.curve = this.makeDistortionCurve(amount);
    console.log(this.distortion.curve);
  },

  changeFilter: function (filter) {
    this.filter.type = filter;
  },

  changeFilterQ: function (amount) {
    this.filter.q.value = parseFloat(amount);
  },

  changeFilterGain: function (amount) {
    this.filter.gain.value = parseInt(amount);
  },

  changeFilterFrequency: function (frequency) {
    this.filter.frequency.value = parseInt(frequency);
  },

  nextNote: function () {
    var secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.currentNote++;
    if (this.currentNote === this.steps) {
      this.currentNote = 0;
    }
  },

  scheduleNote: function (beatNumber, time) {
    var osc = Sequencer.audioContext.createOscillator();
    osc.type = this.wave;
    osc.frequency.value = parseInt(
      this.parent.getElementsByClassName("step_" + beatNumber)[0].value
    );

    osc.connect(this.filter);
    this.filter.connect(this.distortion);
    this.distortion.connect(Sequencer.audioContext.destination);

    osc.start(time);
    osc.stop(
      time +
        parseFloat(
          this.parent.getElementsByClassName("length_" + beatNumber)[0].value
        )
    );
  },

  scheduler: function () {
    // console.log(this.nextNoteTime);
    // console.log(Sequencer.audioContext.currentTime + this.scheduleAheadTime);
    while (
      this.nextNoteTime <
      Sequencer.audioContext.currentTime + this.scheduleAheadTime
    ) {
      // console.log('ok');
      this.scheduleNote(this.currentNote, this.nextNoteTime);
      this.nextNote();
    }
  },

  makeDistortionCurve: function (amount) {
    k = parseInt(amount);
    var n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;

    for (; i < n_samples; ++i) {
      x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    console.log(curve);
    return curve;
  },
};

window.addEventListener(
  "load",
  Sequencer.init(document.getElementById("sequencer"))
);
document.getElementById("play").addEventListener("click", function (event) {
  if (Sequencer.isPlaying) {
    document.getElementById("play_control").innerHTML = "play_circle_outline";
  } else {
    document.getElementById("play_control").innerHTML = "pause_circle_outline";
  }
  Sequencer.play();
});
document.getElementById("bpm").addEventListener("change", function (event) {
  Sequencer.changeBpm(event.target.value);
});
document.getElementById("wave").addEventListener("change", function (event) {
  Sequencer.changeWave(event.target.value);
});
document
  .getElementById("distortion")
  .addEventListener("change", function (event) {
    Sequencer.changeDistortionCurve(event.target.value);
  });

document
  .getElementById("filter_type")
  .addEventListener("change", function (event) {
    Sequencer.changeFilter(event.target.value);
  });

document
  .getElementById("filter_q")
  .addEventListener("change", function (event) {
    Sequencer.changeFilterQ(event.target.value);
  });

document
  .getElementById("filter_gain")
  .addEventListener("change", function (event) {
    Sequencer.changeFilterGain(event.target.value);
  });

document
  .getElementById("filter_frequency")
  .addEventListener("change", function (event) {
    Sequencer.changeFilterFrequency(event.target.value);
  });
