// เสียงประกอบฉาก Made in Heaven สังเคราะห์สดในเบราว์เซอร์ทั้งหมด: เข็มนาฬิกา ลม คลื่นระเบิดก้องกังวาน กลองใหญ่
// คอร์ดเครื่องเป่าและเสียงประสาน เสียงโหมก่อนบิ๊กแบง และเช้าของจักรวาลใหม่
import { BOOMS, END, MORNING, RUSH_END, ticks, WHITE_FULL } from "./heaven";

/** schedules the whole soundtrack from now; call from a press, and call the result to silence it */
export function playHeaven(): () => void {
  // older Safari knows it by another name; with no sound at all the show still plays
  const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) return () => {};
  const audio = new Context();
  void audio.resume?.()?.catch(() => {});
  const start = audio.currentTime + 0.05;
  const master = audio.createGain();
  master.gain.value = 0.32;
  // keeps the great blasts from clipping
  const limit = audio.createDynamicsCompressor();
  limit.threshold.value = -14;
  limit.ratio.value = 12;
  limit.attack.value = 0.004;
  limit.release.value = 0.35;
  const out = audio.createGain();
  out.gain.value = 0.85;
  master.connect(limit).connect(out).connect(audio.destination);

  /** two seconds of hiss, the stuff of wind and thunder */
  const noise = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  // a vast hall: dying hiss, different in each ear, that the loud things echo in
  const hall = audio.createConvolver();
  const echo = audio.createBuffer(2, Math.floor(audio.sampleRate * 3.2), audio.sampleRate);
  for (let ear = 0; ear < 2; ear++) {
    const tail = echo.getChannelData(ear);
    for (let i = 0; i < tail.length; i++) tail[i] = (Math.random() * 2 - 1) * (1 - i / tail.length) ** 3;
  }
  hall.buffer = echo;
  const wet = audio.createGain();
  wet.gain.value = 0.45;
  hall.connect(wet).connect(master);
  /** sends a sound both straight out and into the hall */
  const wide = audio.createGain();
  wide.connect(master);
  wide.connect(hall);

  /** one oscillator with its own loudness curve: [seconds, level] points */
  const voice = (type: OscillatorType, from: number, to: number, levels: [number, number][], pitch: [number, number][], into: AudioNode = master, detune = 0) => {
    const source = audio.createOscillator();
    const gain = audio.createGain();
    source.type = type;
    source.detune.value = detune;
    source.frequency.setValueAtTime(pitch[0][1], start + from);
    for (const [at, hertz] of pitch.slice(1)) source.frequency.exponentialRampToValueAtTime(hertz, start + at);
    gain.gain.setValueAtTime(0, start + from);
    for (const [at, level] of levels) gain.gain.linearRampToValueAtTime(level, start + at);
    source.connect(gain).connect(into);
    source.start(start + from);
    source.stop(start + to);
  };

  // the clock: a sharp tick and a lower tock in turn
  // loud while time is running away, then only a whisper under the space scenes
  ticks().forEach((at, i) => {
    const level = 0.16 * Math.max(0.2, 1 - Math.max(0, at - RUSH_END) / 8);
    voice("square", at, at + 0.05, [[at + 0.003, level], [at + 0.04, 0]], [[at, i % 2 ? 1500 : 2100]]);
  });

  /** filtered hiss with its own loudness and colour over time */
  const hiss = (from: number, to: number, type: BiquadFilterType, tone: [number, number][], levels: [number, number][], into: AudioNode = master) => {
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    source.buffer = noise;
    source.loop = true;
    filter.type = type;
    filter.frequency.setValueAtTime(tone[0][1], start + from);
    for (const [at, hertz] of tone.slice(1)) filter.frequency.exponentialRampToValueAtTime(hertz, start + at);
    gain.gain.setValueAtTime(0, start + from);
    for (const [at, level] of levels) gain.gain.linearRampToValueAtTime(level, start + at);
    source.connect(filter).connect(gain).connect(into);
    source.start(start + from);
    source.stop(start + to);
  };

  /** a blast: a crack, a roar that darkens, a deep drop that shakes, and thunder rolling after */
  const boom = (at: number, power: number) => {
    const long = 1.6 + power * 2;
    hiss(at, at + 0.4, "highpass", [[at, 1800]], [[at + 0.008, 0.5 * power], [at + 0.35, 0]], wide);
    hiss(at, at + long, "lowpass", [[at, 3200], [at + 0.5, 420], [at + long, 55]], [[at + 0.025, 1.1 * power], [at + 0.35, 0.7 * power], [at + long, 0]], wide);
    voice("sine", at, at + long, [[at + 0.02, 1 * power], [at + 0.5, 0.65 * power], [at + long, 0]], [[at, 105], [at + 0.25, 52], [at + long, 24]], wide);
    voice("triangle", at, at + long * 0.6, [[at + 0.015, 0.5 * power], [at + long * 0.55, 0]], [[at, 190], [at + long * 0.5, 40]], wide);
    for (let k = 1; k <= 3; k++) {
      const next = at + k * 0.38 * (0.8 + power * 0.3);
      hiss(next, next + 0.9, "lowpass", [[next, 380], [next + 0.85, 70]], [[next + 0.06, (0.5 * power) / k], [next + 0.85, 0]], wide);
    }
  };
  BOOMS.forEach(({ at, power }) => boom(at, power));
  // the new universe answers itself, wave after wave
  [0.75, 1.55].forEach((later, i) => boom(WHITE_FULL + later, 0.75 - i * 0.2));

  /** a great drum */
  const drum = (at: number, level: number) => {
    voice("sine", at, at + 0.9, [[at + 0.008, level], [at + 0.85, 0]], [[at, 150], [at + 0.12, 70], [at + 0.8, 48]], wide);
    hiss(at, at + 0.25, "lowpass", [[at, 600]], [[at + 0.005, level * 0.5], [at + 0.22, 0]], wide);
  };
  // the march quickens as the ages pass
  [18, 18.9, 19.6, 20, 22.6, 24.4, 26.2, 28, 29.8, 31.4, 33.6, 35, 36.2, 37, 39.6, 40.4, 42.4, 45.6, 46.8, 47.6, 48.2, 48.6].forEach((at, i) => drum(at, 0.22 + (i % 4 === 0 ? 0.14 : 0)));

  /** an orchestra of detuned voices: brass when sharp-edged, a choir when soft */
  const chord = (from: number, to: number, notes: number[], type: OscillatorType, level: number, rise: number) => {
    const soften = audio.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.setValueAtTime(500, start + from);
    soften.frequency.linearRampToValueAtTime(type === "sawtooth" ? 1900 : 3200, start + from + rise);
    soften.connect(wide);
    for (const hertz of notes) for (const cents of [-9, 0, 8]) voice(type, from, to, [[from + rise, level / 3], [to - 1.2, level / 4], [to, 0]], [[from, hertz]], soften, cents);
  };
  chord(20.4, 23.4, [73.4, 110, 146.8, 220], "sawtooth", 0.1, 0.7);
  ([[22.8, [110, 164.8, 220, 329.6]], [28.2, [123.5, 185, 246.9, 370]], [33.6, [98, 146.8, 233.1, 293.7]], [39.6, [87.3, 130.8, 174.6, 261.6]], [45.4, [73.4, 110, 146.8, 174.6]]] as const).forEach(([from, notes]) => {
    chord(from, from + 6.6, [...notes], "sawtooth", 0.055, 2.4);
    chord(from + 0.4, from + 6.6, notes.map((hertz) => hertz * 2), "triangle", 0.045, 2.8);
    voice("sine", from - 0.4, from + 1.2, [[from, 0.13], [from + 1.1, 0]], [[from - 0.4, 900], [from + 1.1, 90]], wide);
  });
  // everything draws in its breath, then a heartbeat of silence before the bang
  hiss(WHITE_FULL - 3.4, WHITE_FULL - 0.18, "bandpass", [[WHITE_FULL - 3.4, 300], [WHITE_FULL - 0.25, 7000]], [[WHITE_FULL - 0.35, 0.9], [WHITE_FULL - 0.2, 0]], wide);
  voice("sawtooth", WHITE_FULL - 3.4, WHITE_FULL - 0.18, [[WHITE_FULL - 0.4, 0.16], [WHITE_FULL - 0.22, 0]], [[WHITE_FULL - 3.4, 110], [WHITE_FULL - 0.25, 880]], wide);
  // morning: the choir, warm and bright, and bells above it
  chord(MORNING - 1.4, END + 0.4, [261.6, 329.6, 392, 523.3], "triangle", 0.12, 1.6);
  [1046.5, 1318.5, 1568, 2093].forEach((hertz, i) => {
    const from = MORNING + 0.5 + i * 0.35;
    voice("sine", from, from + 2, [[from + 0.01, 0.09], [from + 1.9, 0]], [[from, hertz]], wide);
  });

  // a low drone that climbs as time runs away
  const muffle = audio.createBiquadFilter();
  muffle.type = "lowpass";
  muffle.frequency.setValueAtTime(220, start);
  muffle.frequency.exponentialRampToValueAtTime(3800, start + WHITE_FULL);
  muffle.connect(master);
  for (const detune of [1, 1.007, 1.5]) {
    voice("sawtooth", 0, WHITE_FULL + 0.1, [[4, 0.05], [WHITE_FULL - 0.5, 0.12], [WHITE_FULL - 0.2, 0]], [[0, 55 * detune], [RUSH_END, 98 * detune], [WHITE_FULL, 440 * detune]], muffle);
  }

  // wind: filtered noise rising with the speed
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
  loud.gain.linearRampToValueAtTime(0.04, start + 5);
  loud.gain.linearRampToValueAtTime(0.28, start + RUSH_END + 2);
  loud.gain.linearRampToValueAtTime(0.12, start + 30);
  loud.gain.linearRampToValueAtTime(0.42, start + WHITE_FULL - 0.4);
  loud.gain.linearRampToValueAtTime(0, start + WHITE_FULL - 0.18);
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
