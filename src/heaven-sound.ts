// เสียงประกอบฉาก Made in Heaven สังเคราะห์สดในเบราว์เซอร์ทั้งหมด: เข็มนาฬิกา ลม เสียงสูงขึ้น และเสียงจักรวาลเกิดใหม่
import { END, ticks, WHITE_FULL } from "./heaven";

/** schedules the whole soundtrack from now; call from a press, and call the result to silence it */
export function playHeaven(): () => void {
  const audio = new AudioContext();
  const start = audio.currentTime + 0.05;
  const master = audio.createGain();
  master.gain.value = 0.35;
  // keeps the loud ending from clipping
  const limit = audio.createDynamicsCompressor();
  master.connect(limit).connect(audio.destination);

  /** one oscillator with its own loudness curve: [seconds, level] points */
  const voice = (type: OscillatorType, from: number, to: number, levels: [number, number][], pitch: [number, number][], into: AudioNode = master) => {
    const source = audio.createOscillator();
    const gain = audio.createGain();
    source.type = type;
    source.frequency.setValueAtTime(pitch[0][1], start + from);
    for (const [at, hertz] of pitch.slice(1)) source.frequency.exponentialRampToValueAtTime(hertz, start + at);
    gain.gain.setValueAtTime(0, start + from);
    for (const [at, level] of levels) gain.gain.linearRampToValueAtTime(level, start + at);
    source.connect(gain).connect(into);
    source.start(start + from);
    source.stop(start + to);
  };

  // the clock: a sharp tick and a lower tock in turn
  ticks().forEach((at, i) => voice("square", at, at + 0.05, [[at + 0.003, 0.16], [at + 0.04, 0]], [[at, i % 2 ? 1500 : 2100]]));

  // a low drone that climbs as time runs away
  const muffle = audio.createBiquadFilter();
  muffle.type = "lowpass";
  muffle.frequency.setValueAtTime(220, start);
  muffle.frequency.exponentialRampToValueAtTime(3800, start + WHITE_FULL);
  muffle.connect(master);
  for (const detune of [1, 1.007, 1.5]) {
    voice("sawtooth", 0, WHITE_FULL + 0.1, [[2, 0.05], [WHITE_FULL - 0.5, 0.17], [WHITE_FULL, 0]], [[0, 55 * detune], [8, 98 * detune], [WHITE_FULL, 440 * detune]], muffle);
  }

  // wind: filtered noise rising with the speed
  const noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const wind = audio.createBufferSource();
  const band = audio.createBiquadFilter();
  const loud = audio.createGain();
  wind.buffer = noise;
  wind.loop = true;
  band.type = "bandpass";
  band.Q.value = 0.8;
  band.frequency.setValueAtTime(260, start);
  band.frequency.exponentialRampToValueAtTime(4200, start + WHITE_FULL);
  loud.gain.setValueAtTime(0, start);
  loud.gain.linearRampToValueAtTime(0.04, start + 3);
  loud.gain.linearRampToValueAtTime(0.5, start + WHITE_FULL - 0.3);
  loud.gain.linearRampToValueAtTime(0, start + WHITE_FULL + 0.05);
  wind.connect(band).connect(loud).connect(master);
  wind.start(start);
  wind.stop(start + WHITE_FULL + 0.1);

  // the new universe: one deep strike, then a bright chord that fades away
  const born = WHITE_FULL;
  voice("sine", born, born + 2.5, [[born + 0.02, 0.9], [born + 2.4, 0]], [[born, 130], [born + 1.6, 32]]);
  [261.6, 329.6, 392, 523.3, 784].forEach((hertz, i) => {
    const from = born + 0.15 + i * 0.09;
    voice("sine", from, END + 0.5, [[from + 0.4, 0.13], [END + 0.4, 0]], [[from, hertz]]);
  });

  let closed = false;
  const stop = () => {
    if (closed) return;
    closed = true;
    void audio.close();
  };
  setTimeout(stop, (END + 1) * 1000);
  return stop;
}
