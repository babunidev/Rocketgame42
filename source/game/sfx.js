/* Tiny SFX helper. Browser requires a user gesture before the first play. */
(() => {
  'use strict';
  const unlocked = { ok: false };
  const cache = new Map();

  function load(name) {
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(`sounds/${name}`);
      audio.preload = 'auto';
      cache.set(name, audio);
    }
    return audio;
  }

  function play(name, { volume = 0.7 } = {}) {
    try {
      const base = load(name);
      const shot = base.cloneNode();
      shot.volume = volume;
      const p = shot.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* ignore missing/blocked audio */
    }
  }

  function unlock() {
    if (unlocked.ok) return;
    unlocked.ok = true;
    // Warm buffers after the first gesture.
    load('roket-explosion.ogg');
    load('seeker-explosion.ogg');
  }

  window.RaketenspielSfx = {
    play,
    unlock,
    playRoketExplosion: () => play('roket-explosion.ogg'),
    playSeekerExplosion: () => play('seeker-explosion.ogg', { volume: 0.35 })
  };
  window.addEventListener('pointerdown', unlock, { once: true, capture: true });
  window.addEventListener('keydown', unlock, { once: true, capture: true });
})();
