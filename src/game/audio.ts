class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.8;
  private musicVolume = 0.5;
  private isMuted = false;
  private bgmNode: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmInterval: number | null = null;

  constructor() {
    // AudioContext created on demand after first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(this.musicVolume * 0.15, this.ctx.currentTime, 0.1);
    }
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light', enabled = true) {
    if (!enabled || !('vibrate' in navigator)) return;
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(15);
          break;
        case 'medium':
          navigator.vibrate(30);
          break;
        case 'heavy':
          navigator.vibrate([40, 20, 40]);
          break;
        case 'success':
          navigator.vibrate([30, 50, 60, 50, 100]);
          break;
        case 'warning':
          navigator.vibrate([80, 40, 80]);
          break;
      }
    } catch {
      // Ignore vibration errors on unsupported devices
    }
  }

  public playClick() {
    this.initCtx();
    if (!this.ctx || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playSwimRipple() {
    this.initCtx();
    if (!this.ctx || this.sfxVolume <= 0) return;

    // Filtered noise bubble sound
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400 + Math.random() * 200, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  public playWallBump() {
    this.initCtx();
    if (!this.ctx || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playWrongExit() {
    this.initCtx();
    if (!this.ctx || this.sfxVolume <= 0) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(320, now);
    osc1.frequency.setValueAtTime(280, now + 0.15);
    osc2.frequency.setValueAtTime(315, now);
    osc2.frequency.setValueAtTime(275, now + 0.15);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  public playLevelWin() {
    this.initCtx();
    if (!this.ctx || this.sfxVolume <= 0) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }

  public playHintSound() {
    this.initCtx();
    if (!this.ctx || this.sfxVolume <= 0) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public startAmbientBGM() {
    this.initCtx();
    if (!this.ctx || this.musicVolume <= 0 || this.bgmInterval !== null) return;

    // Ambient relaxing zen water scales (Pentatonic scale notes)
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    let noteIdx = 0;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.musicVolume * 0.12, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    const playAmbientNote = () => {
      if (!this.ctx || !this.bgmGain || this.musicVolume <= 0) return;

      const freq = scale[Math.floor(Math.random() * scale.length)];
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.08 * this.musicVolume, this.ctx.currentTime + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);

      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.2);
    };

    this.bgmInterval = window.setInterval(playAmbientNote, 1600);
  }

  public stopAmbientBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
