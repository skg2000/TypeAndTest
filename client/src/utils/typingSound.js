let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration = 0.04, gain = 0.06, type = "square") {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export const sounds = {
  keypress: () => playTone(600 + Math.random() * 100, 0.035, 0.05),
  error:    () => playTone(200, 0.08, 0.07, "sawtooth"),
  countdownBeep: () => playTone(880, 0.12, 0.1, "sine"),
  go:       () => { playTone(1046, 0.15, 0.12, "sine"); setTimeout(() => playTone(1318, 0.2, 0.1, "sine"), 100); },
  finish:   () => { [523,659,784,1046].forEach((f, i) => setTimeout(() => playTone(f, 0.18, 0.1, "sine"), i * 100)); },
};

let muted = false;
export const setMuted = (v) => { muted = v; };
export const isMuted = () => muted;
export const playSound = (name) => { if (!muted && sounds[name]) sounds[name](); };
