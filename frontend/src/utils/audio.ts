class SoundManager {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private scratchSource: AudioBufferSourceNode | null = null;
  private scratchGain: GainNode | null = null;
  private scratchFilter: BiquadFilterNode | null = null;
  private isScratching = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.createNoiseBuffer();
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser:", e);
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  // --- SCRATCHING EFFECT ---
  public startScratch() {
    this.init();
    if (!this.ctx || !this.noiseBuffer || this.isScratching) return;

    // Resume context if suspended (browser security)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    try {
      this.isScratching = true;

      // Create nodes
      this.scratchSource = this.ctx.createBufferSource();
      this.scratchSource.buffer = this.noiseBuffer;
      this.scratchSource.loop = true;

      this.scratchFilter = this.ctx.createBiquadFilter();
      this.scratchFilter.type = "bandpass";
      this.scratchFilter.Q.value = 4.0;
      this.scratchFilter.frequency.value = 1000;

      this.scratchGain = this.ctx.createGain();
      this.scratchGain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Connect graph: Source -> Filter -> Gain -> Destination
      this.scratchSource.connect(this.scratchFilter);
      this.scratchFilter.connect(this.scratchGain);
      this.scratchGain.connect(this.ctx.destination);

      this.scratchSource.start(0);
    } catch (e) {
      console.error("Error starting scratch sound:", e);
    }
  }

  public updateScratch(speed: number) {
    if (!this.ctx || !this.scratchGain || !this.scratchFilter || !this.isScratching) return;

    const now = this.ctx.currentTime;
    // Normalize speed (typically between 0 and 50)
    const normalizedSpeed = Math.min(Math.max(speed, 0), 60) / 60;

    // Map speed to volume (gain) and pitch (filter frequency)
    const targetGain = normalizedSpeed * 0.15; // Cap volume
    const targetFreq = 800 + normalizedSpeed * 1800; // 800Hz to 2600Hz

    // Smoothly transition parameters to prevent clicking/popping
    this.scratchGain.gain.setTargetAtTime(targetGain, now, 0.05);
    this.scratchFilter.frequency.setTargetAtTime(targetFreq, now, 0.05);
  }

  public stopScratch() {
    if (!this.isScratching) return;
    this.isScratching = false;

    if (this.scratchGain && this.ctx) {
      const now = this.ctx.currentTime;
      // Fade out quickly
      this.scratchGain.gain.setTargetAtTime(0, now, 0.03);
    }

    setTimeout(() => {
      if (!this.isScratching && this.scratchSource) {
        try {
          this.scratchSource.stop();
          this.scratchSource.disconnect();
          this.scratchSource = null;
        } catch (e) {
          // Source might already be stopped
        }
      }
    }, 150);
  }

  // --- RETRO COIN SOUND ---
  public playCoinSound() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Classic retro "ding-ding"
    // Note 1 (B5, 988Hz)
    osc.frequency.setValueAtTime(987.77, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.setValueAtTime(0.08, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    // Note 2 (E6, 1318Hz)
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.gain.setValueAtTime(0.08, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // --- VICTORY FANFARE ---
  public playWinSound(isBig = false) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;

    const notes = isBig
      ? [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50] // C4 - E4 - G4 - C5 - E5 - G5 - C6
      : [392.00, 523.25, 659.25, 783.99]; // G4 - C5 - E5 - G5

    const noteDuration = isBig ? 0.08 : 0.1;
    const oscType = "triangle"; // Warm 8-bit sound

    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, now + index * noteDuration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const startTime = now + index * noteDuration;
      const duration = isBig && index === notes.length - 1 ? 0.6 : 0.25;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  // --- LOSE SOUND ---
  public playLoseSound() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4); // Slide down to E2

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audio = new SoundManager();
