/**
 * Motor de Audio Sintetizado Retro Web Audio API (8-bit / NES Style)
 * 100% autónomo sin archivos externos, garantizando carga instantánea y cero fallos 404.
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicMuted: boolean = false;
  private sfxVolume: number = 0.3;
  private musicVolume: number = 0.2;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentStep: number = 0;

  constructor() {
    // Inicialización perezosa al primer gesto del usuario
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.initContext();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else if (!this.musicMuted) {
      this.startMusic();
    }
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopMusic();
    } else if (!this.isMuted) {
      this.startMusic();
    }
    return !this.musicMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public isBgmActive(): boolean {
    return !this.musicMuted && !this.isMuted && this.isMusicPlaying;
  }

  // --- EFECTOS DE SONIDO (SFX) ---

  // Sonido de puñetazo ligero
  public playPunch(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(this.sfxVolume * 0.9, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  // Sonido de puñetazo pesado / gancho
  public playHeavyPunch(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Oscilador de tono bajo
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    oscGain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    // Ruido blanco de impacto
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start();
    noise.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  // Sonido de patada
  public playKick(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  // Sonido de salto estilo NES
  public playJump(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // Sonido al recibir daño
  public playHurt(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(this.sfxVolume * 0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  // Ataque especial (Furia Callejera / Dragón)
  public playSpecial(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gain.gain.setValueAtTime(this.sfxVolume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Romper caja o barril
  public playSmash(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  // Agarrar comida o moneda (Arpegio C-E-G brillante)
  public playPickup(isFood: boolean = true): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = isFood ? [523.25, 659.25, 783.99, 1046.50] : [587.33, 880.00, 1174.66];
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.05;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.09);
    });
  }

  // Sonido de K.O. / Derrota de enemigo arcade
  public playKO(): void {
    if (this.isMuted) return;
    this.playHeavyPunch();
  }

  // Enemigo K.O.
  public playKOSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Sonido de clic / selección en menú
  public playMenuBeep(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }

  // Blip retro cuando suelta una frase basada
  public playTextBlip(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // --- MÚSICA CHIPTUNE 8-BIT DE FONDO ---

  public startMusic(): void {
    if (this.isMuted || this.musicMuted || this.isMusicPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.currentStep = 0;

    // Patrón musical estilo Double Dragon / River City Ransom (Tempo ~ 138 BPM, step = 108ms)
    const melodyNotes = [
      // Compás 1
      220, 261.63, 293.66, 329.63, 293.66, 261.63, 220, 0,
      // Compás 2
      196, 246.94, 293.66, 329.63, 293.66, 246.94, 196, 0,
      // Compás 3
      174.61, 220, 261.63, 293.66, 261.63, 220, 174.61, 220,
      // Compás 4 (remate)
      246.94, 293.66, 329.63, 392.00, 440, 392.00, 329.63, 246.94
    ];

    const bassNotes = [
      110, 110, 110, 110, 110, 110, 110, 110,
      98,  98,  98,  98,  98,  98,  98,  98,
      87.3, 87.3, 87.3, 87.3, 87.3, 87.3, 87.3, 87.3,
      123.47, 123.47, 123.47, 123.47, 110, 110, 123.47, 146.83
    ];

    const stepDuration = 115; // ms por semicorchea

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted || this.musicMuted) return;
      const now = this.ctx.currentTime;
      const step = this.currentStep % melodyNotes.length;

      // 1. Melodía Lead (Onda Cuadrada retro)
      const leadFreq = melodyNotes[step];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(this.musicVolume * 0.22, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(now);
        leadOsc.stop(now + 0.1);
      }

      // 2. Línea de Bajo (Onda Triangular profunda estilo NES DPCM/Triangle)
      const bassFreq = bassNotes[step];
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(this.musicVolume * 0.35, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.11);
      }

      // 3. Percusión retro (Hi-hat en tiempos impares, caja/snare en 4 y 12)
      if (step % 2 === 0) {
        this.playRetroHat(step % 4 === 2);
      }

      this.currentStep++;
    }, stepDuration);
  }

  private playRetroHat(isSnare: boolean): void {
    if (!this.ctx || this.isMuted || this.musicMuted) return;
    const now = this.ctx.currentTime;
    const dur = isSnare ? 0.06 : 0.02;

    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    const vol = isSnare ? this.musicVolume * 0.25 : this.musicVolume * 0.1;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Sonido de agarre (Clinch)
  public playClinch(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(this.sfxVolume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  }

  // Sonido de lanzamiento / azotar contra el suelo (Throw / Slam)
  public playSlam(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Tono grave explosivo
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    gain.gain.setValueAtTime(this.sfxVolume * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Ruido sordo (thud)
    const bufSize = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(this.sfxVolume * 0.8, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    noise.connect(nGain);
    nGain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.26);
  }

  // Sonido de corte de espada Katana (Carlos Miyamoto)
  public playKatanaSlash(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  }

  // Sonido de ataque giratorio (Spinning Clothesline / Whirlwind)
  public playWhirlwind(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + i * 40, t);
      osc.frequency.linearRampToValueAtTime(380 + i * 50, t + 0.07);
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  // --- MÚSICA DE TÍTULO (ATTRACT THEME / MENÚ PRINCIPAL) ---

  public startTitleMusic(): void {
    if (this.isMuted || this.musicMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopMusic();
    this.isMusicPlaying = true;
    this.currentStep = 0;

    // Tema épico de introducción estilo Capcom Arcade 1993 (Final Fight / Street Fighter)
    const titleNotes = [
      146.83, 0, 146.83, 174.61, 196.00, 0, 174.61, 220.00,
      196.00, 0, 174.61, 146.83, 130.81, 0, 146.83, 0,
      164.81, 0, 164.81, 196.00, 220.00, 0, 196.00, 246.94,
      220.00, 0, 196.00, 164.81, 146.83, 0, 174.61, 220.00
    ];

    const titleBass = [
      73.42, 73.42, 73.42, 73.42, 87.31, 87.31, 87.31, 87.31,
      98.00, 98.00, 98.00, 98.00, 65.41, 65.41, 73.42, 73.42,
      82.41, 82.41, 82.41, 82.41, 98.00, 98.00, 98.00, 98.00,
      110.0, 110.0, 110.0, 110.0, 73.42, 73.42, 87.31, 110.0
    ];

    const stepDuration = 140; // ms

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted || this.musicMuted) return;
      const now = this.ctx.currentTime;
      const step = this.currentStep % titleNotes.length;

      const note = titleNotes[step];
      if (note > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note, now);
        gain.gain.setValueAtTime(this.musicVolume * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      }

      const bass = titleBass[step];
      if (bass > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bass, now);
        bGain.gain.setValueAtTime(this.musicVolume * 0.35, now);
        bGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(now);
        bOsc.stop(now + 0.13);
      }

      if (step % 2 === 0) {
        this.playRetroHat(step % 4 === 2);
      }

      this.currentStep++;
    }, stepDuration);
  }

  public stopMusic(): void {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const retroAudio = new RetroAudioEngine();
