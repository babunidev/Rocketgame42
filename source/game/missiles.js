/* Blue heat-seekers: +1 pod every 20 Score, stockpile beside the ship, right-click launches all.
 * Flight speed & size scale with level so they keep up as the game speeds up. */
window.installMissiles = function(root, stage) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const CHARGE_SCORE = 20;
  const DOCK_DY = 318; // same height as before (ship-local)
  const DOCK_ROT = 180;
  const ROW_HALF = 100; // wide band when few pods; denser as they fill in
  const MAX_PODS = 24; // max docked at once (not a lifetime launch cap)
  const POD_SCALE = 0.41; // ~20% bigger than 0.34
  const FLY_SCALE = 0.41;
  const BLAST_SCALE = 0.45;
  // Lerp rate retuned for 48 Hz so dock slide duration matches the old 16 Hz feel.
  const DOCK_SLIDE = 1 - Math.pow(1 - 0.14, 16 / 48);
  const BLUE_FILTER =
    'hue-rotate(165deg) saturate(1.55) brightness(1.12) drop-shadow(0 0 4px #33aaff) drop-shadow(0 0 10px #66ccff)';
  const BLAST_FILTER =
    'hue-rotate(165deg) saturate(1.2) brightness(1.25) drop-shadow(0 0 6px #66ccff)';

  const layer = document.createElementNS(NS, 'g');
  layer.setAttribute('data-missiles', '1');
  layer.style.pointerEvents = 'none';
  stage.appendChild(layer);

  let seekersLaunched = 0;
  let flying = [];
  let blasts = [];
  let pods = []; // { el, dx, dy, fade }
  let layoutCount = -1;
  let neuWrapped = false;
  let rocketTemplate = null;
  let blastTemplate = null;
  let rocketCenter = null;
  let blastCenter = null;

  function displayScore() {
    return Math.floor(root.points / 10);
  }

  function dockedCount() {
    // Lifetime earned from score, minus launched — then cap how many can sit on the ship.
    // (Do NOT cap lifetime earned, or spawning stops forever after MAX_PODS launches.)
    const earned = Math.floor(displayScore() / CHARGE_SCORE);
    return Math.min(MAX_PODS, Math.max(0, earned - seekersLaunched));
  }

  function level() {
    return Math.max(1, Number(root.level) || 1);
  }

  // Constant px/tick at 48 Hz (⅓ of the old 16 Hz step) — same real-time speed.
  function flightSpeed() {
    const tick = root.TICK || 16 / 48;
    return (9 + Math.round(level() / 20) * 2) * tick;
  }

  function isTargetLive(target) {
    if (!target) return false;
    if (target.kind === 'void') return true;
    const clip = target.clip;
    if (!clip || clip._visible === false) return false;
    if (clip.good_mc && clip.good_mc._visible === false) return false;
    if (clip._alpha != null && clip._alpha <= 0) return false;
    if (target.kind === 'bonus' && root.bonusAlive === false) return false;
    if (clip._y < -40 || clip._y > 390) return false;
    return true;
  }

  function targetPos(target) {
    if (target?.clip) return { x: target.clip._x, y: target.clip._y };
    return { x: target?.x ?? 275, y: target?.y ?? 40 };
  }

  function bezierLen(x0, y0, cx, cy, x1, y1, t0, samples) {
    const n = samples || 8;
    let len = 0;
    let px = bezier(x0, cx, x1, t0);
    let py = bezier(y0, cy, y1, t0);
    for (let i = 1; i <= n; i++) {
      const t = t0 + (1 - t0) * (i / n);
      const x = bezier(x0, cx, x1, t);
      const y = bezier(y0, cy, y1, t);
      len += Math.hypot(x - px, y - py);
      px = x;
      py = y;
    }
    return Math.max(1, len);
  }

  function setArcControls(m, x1, y1, side) {
    m.ctrlX = (m.x0 + x1) / 2 + side * 80 + rand(-20, 20);
    m.ctrlY = Math.min(m.y0, y1) - 90 - rand(0, 30);
    if (Math.hypot(x1 - m.x0, y1 - m.y0) < 90) m.ctrlY = m.y0 - 130;
  }

  function retargetMissile(m) {
    const live = listTargets();
    const claimed = new Map();
    for (const f of flying) {
      if (f === m || !f.target?.clip) continue;
      claimed.set(f.target.clip, (claimed.get(f.target.clip) || 0) + 1);
    }
    live.sort(
      (a, b) =>
        (claimed.get(a.clip) || 0) - (claimed.get(b.clip) || 0) ||
        b.weight - a.weight ||
        Math.hypot(a.x - m.lastX, a.y - m.lastY) - Math.hypot(b.x - m.lastX, b.y - m.lastY)
    );
    const next =
      live.find(t => t.clip !== m.target?.clip) ||
      live[0] || {
        clip: null,
        kind: 'void',
        x: Math.max(40, Math.min(510, m.lastX + rand(-70, 70))),
        y: 30 + rand(0, 50)
      };
    m.target = next;
    m.x0 = m.lastX;
    m.y0 = m.lastY;
    m.t = 0;
    const p = targetPos(next);
    setArcControls(m, p.x, p.y, rand(-0.6, 0.6));
  }

  function forceShown(node) {
    node.style.display = '';
    node.style.visibility = 'visible';
    node.style.opacity = '1';
    node.setAttribute('visibility', 'visible');
    node.setAttribute('opacity', '1');
  }

  function snapshotTemplate(sourceEl) {
    const art = sourceEl.cloneNode(true);
    // Keep a handle to the thruster before stripping Flash instance names.
    const flame = art.querySelector('[data-instance="flammen_mc"]');
    if (flame) flame.setAttribute('data-flame', '1');
    art.removeAttribute('data-instance');
    art.querySelectorAll('[data-instance]').forEach(n => n.removeAttribute('data-instance'));
    art.removeAttribute('transform');
    forceShown(art);
    art.querySelectorAll('*').forEach(forceShown);
    const probe = document.createElementNS(NS, 'g');
    probe.setAttribute('transform', 'translate(-10000 -10000)');
    probe.appendChild(art);
    layer.appendChild(probe);
    let bbox;
    try {
      bbox = art.getBBox();
    } catch {
      bbox = { x: -10, y: -40, width: 20, height: 80 };
    }
    probe.remove();
    if (!bbox.width || !bbox.height) bbox = { x: -10, y: -40, width: 20, height: 80 };
    return { art, cx: bbox.x + bbox.width / 2, cy: bbox.y + bbox.height / 2 };
  }

  // Same flicker as pink rocket good_mc.flammen_mc (alpha 100 ↔ 22 each logic tick).
  function tickFlame(host) {
    const flame = host._flame;
    if (!flame) return;
    host._flameOn = !host._flameOn;
    const a = host._flameOn ? 1 : 0.22;
    flame.style.opacity = String(a);
    flame.setAttribute('opacity', String(a));
  }

  function ensureTemplates() {
    if (!rocketTemplate) {
      const snap = snapshotTemplate(root.roketi_mc.good_mc.element);
      rocketTemplate = snap.art;
      rocketCenter = { cx: snap.cx, cy: snap.cy };
    }
    if (!blastTemplate) {
      const snap = snapshotTemplate(root.roketi_mc.broken_mc.element);
      blastTemplate = snap.art;
      blastCenter = { cx: snap.cx, cy: snap.cy };
    }
  }

  function setArtScale(host, scale) {
    const wrap = host.firstChild;
    if (!wrap) return;
    const c = host._center || rocketCenter;
    wrap.setAttribute('transform', `translate(${-c.cx * scale} ${-c.cy * scale}) scale(${scale})`);
  }

  function cloneArt(template, center, scale, filter) {
    ensureTemplates();
    const host = document.createElementNS(NS, 'g');
    const wrap = document.createElementNS(NS, 'g');
    const art = template.cloneNode(true);
    forceShown(art);
    art.querySelectorAll('*').forEach(forceShown);
    art.style.filter = filter;
    wrap.appendChild(art);
    host.appendChild(wrap);
    host._center = center;
    host._flame = art.querySelector('[data-flame="1"]');
    host._flameOn = true;
    setArtScale(host, scale);
    host.style.opacity = '0';
    host.style.display = 'none';
    layer.appendChild(host);
    return host;
  }

  function ensureBlastPool(need) {
    ensureTemplates();
    while (blasts.length < need) {
      blasts.push({
        el: cloneArt(blastTemplate, blastCenter, BLAST_SCALE, BLAST_FILTER),
        life: 0,
        x: 0,
        y: 0
      });
    }
  }

  function setHost(el, x, y, rotDeg, alpha, visible) {
    el.style.display = visible ? '' : 'none';
    el.style.visibility = visible ? 'visible' : 'hidden';
    el.style.opacity = String(Math.max(0, Math.min(1, alpha)));
    el.setAttribute('visibility', visible ? 'visible' : 'hidden');
    el.setAttribute('opacity', String(Math.max(0, Math.min(1, alpha))));
    el.setAttribute('transform', `translate(${x} ${y}) rotate(${rotDeg})`);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // Same Y band; X spread wide when few, fills denser as count grows. Light random jitter.
  function assignDockOffsets(count) {
    const offsets = [];
    if (count <= 0) return offsets;
    if (count === 1) {
      offsets.push({ dx: 20 + rand(-8, 8), dy: DOCK_DY + rand(-3, 3) });
      return offsets;
    }
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const base = (t - 0.5) * 2 * ROW_HALF + 20;
      const jitter = Math.min(18, 28 / count);
      offsets.push({
        dx: base + rand(-jitter, jitter),
        dy: DOCK_DY + rand(-4, 4)
      });
    }
    return offsets;
  }

  function syncPods() {
    ensureTemplates();
    const want = flying.length ? 0 : dockedCount();
    while (pods.length < want) {
      const el = cloneArt(rocketTemplate, rocketCenter, POD_SCALE, BLUE_FILTER);
      // New pods start near center, then slide into their slot.
      pods.push({
        el,
        dx: 20 + rand(-10, 10),
        dy: DOCK_DY + rand(-4, 4),
        slotDx: 20,
        slotDy: DOCK_DY,
        fade: 0
      });
    }
    while (pods.length > want) {
      const p = pods.pop();
      p.el.remove();
    }
    // Relayout slot targets when stockpile size changes; pods lerp there in updateDocked.
    if (want !== layoutCount) {
      layoutCount = want;
      if (want > 0) {
        const layout = assignDockOffsets(want);
        pods.forEach((p, i) => {
          p.slotDx = layout[i].dx;
          p.slotDy = layout[i].dy;
        });
      }
    }
  }

  function listTargets() {
    const out = [];
    const push = (clip, kind, w) => {
      if (!clip || clip._visible === false) return;
      if (clip.good_mc && clip.good_mc._visible === false) return;
      if (clip._alpha != null && clip._alpha <= 0) return;
      if (clip._y < -40 || clip._y > 390) return;
      out.push({ clip, kind, weight: w, x: clip._x, y: clip._y });
    };
    push(root.gegner1_mc, 'gegner', 3);
    push(root.roketi_mc, 'roketi', 2);
    for (let i = 1; i <= 5; i++) push(root['asteroid' + i + '_mc'], 'asteroid', 1);
    if (root.bonusAlive && root.bonusType === 'red') push(root.bonus_mc, 'bonus', 1);
    out.sort((a, b) => b.weight - a.weight || a.y - b.y);
    return out;
  }

  function pickTargets(n) {
    const live = listTargets();
    const chosen = [];
    for (let i = 0; i < n; i++) {
      if (live.length) chosen.push(live[i % live.length]);
      else chosen.push({ clip: null, kind: 'void', x: root.schiff_mc._x + (i % 2 === 0 ? -40 : 40), y: 40 });
    }
    return chosen;
  }

  const AOE_RADIUS = 75;

  function bustAsteroid(clip) {
    if (!clip || clip._visible === false || !clip.good_mc || clip.good_mc._visible === false) return false;
    if (clip._alpha != null && clip._alpha <= 0) return false;
    root.points += 10;
    root.points_txt.text = 'Score: ' + Math.floor(root.points / 10);
    if (clip.schild_mc) {
      clip.schild_mc._visible = true;
      clip.schild_mc._alpha = 100;
    }
    clip.good_mc._visible = false;
    clip.broken_mc._visible = true;
    return true;
  }

  function aoeAsteroids(cx, cy, skipClip) {
    for (let i = 1; i <= 5; i++) {
      const a = root['asteroid' + i + '_mc'];
      if (!a || a === skipClip) continue;
      const dx = a._x - cx;
      const dy = a._y - cy;
      if (dx * dx + dy * dy <= AOE_RADIUS * AOE_RADIUS) bustAsteroid(a);
    }
  }

  function applyHit(target) {
    const hx = target?.clip ? target.clip._x : target?.x;
    const hy = target?.clip ? target.clip._y : target?.y;
    const clip = target?.clip;
    if (target && clip) {
      if (target.kind === 'gegner') {
        if (clip.good_mc._visible) {
          root.points += 40;
          root.points_txt.text = 'Score: ' + Math.floor(root.points / 10);
          root.g1life = Math.max(0, root.g1life - 22);
          root.gegner1_mc.schild_mc._visible = true;
          root.gegner1_mc.schild_mc._alpha = 100;
          if (root.g1life <= 0) {
            root.awardGegnerKill?.();
            root.gegner1_mc.good_mc._visible = false;
            root.gegner1_mc.broken_mc._visible = true;
          }
        }
      } else if (target.kind === 'roketi') {
        if (clip.good_mc._visible) {
          root.points += 70; // +7 Score
          root.points_txt.text = 'Score: ' + Math.floor(root.points / 10);
          root.flashStrahlImpactAt?.(clip.good_mc);
          clip.schild_mc._visible = true;
          clip.schild_mc._alpha = 100;
          window.RaketenspielSfx?.playRoketExplosion();
        }
        clip.good_mc._visible = false;
        clip.broken_mc._visible = true;
      } else if (target.kind === 'asteroid') {
        bustAsteroid(clip);
      } else if (target.kind === 'bonus') {
        if (clip.good_mc._visible) {
          root.points += 300;
          root.points_txt.text = 'Score: ' + Math.floor(root.points / 10);
          if (clip.schild_mc) {
            clip.schild_mc._visible = true;
            clip.schild_mc._alpha = 100;
          }
        }
        clip.good_mc._visible = false;
        clip.broken_mc._visible = true;
        root.bonus_mc.schild_mc._visible = false;
        root.bonus_mc.element.style.filter = '';
        root.bonusAlive = false;
      }
    }
    if (Number.isFinite(hx) && Number.isFinite(hy)) {
      aoeAsteroids(hx, hy, target?.kind === 'asteroid' ? clip : null);
    }
  }

  function spawnBlast(x, y) {
    ensureBlastPool(Math.max(3, flying.length + 2));
    const slot = blasts.find(b => b.life <= 0) || blasts[0];
    slot.x = x;
    slot.y = y;
    slot.life = 30; // was 10 at 16 Hz
    setHost(slot.el, x, y, 0, 1, true);
  }

  function bezier(a, b, c, t) {
    const u = 1 - t;
    return u * u * a + 2 * u * t * b + t * t * c;
  }

  function launch() {
    if (flying.length || root.gameover_mc._visible || root.schiff_mc._visible === false) return false;
    syncPods();
    const n = pods.length;
    if (n <= 0) return false;
    const targets = pickTargets(n);
    const sx = root.schiff_mc._x;
    const sy = root.schiff_mc._y;
    flying = pods.map((pod, i) => {
      const x0 = sx + pod.dx;
      const y0 = sy + pod.dy;
      const target = targets[i];
      const p = targetPos(target);
      const side = n <= 1 ? 0 : i / (n - 1) - 0.5;
      const m = {
        el: null,
        t: 0,
        age: 0,
        scale: FLY_SCALE,
        x0,
        y0,
        ctrlX: 0,
        ctrlY: 0,
        target,
        lastX: x0,
        lastY: y0
      };
      setArcControls(m, p.x, p.y, side);
      m.el = cloneArt(rocketTemplate, rocketCenter, FLY_SCALE, BLUE_FILTER);
      setHost(m.el, x0, y0, DOCK_ROT, 1, true);
      pod.el.remove();
      return m;
    });
    pods = [];
    seekersLaunched += n;
    return true;
  }

  function resetCharge() {
    seekersLaunched = 0;
    layoutCount = -1;
    for (const m of flying) m.el.remove();
    flying = [];
    pods.forEach(p => p.el.remove());
    pods = [];
    blasts.forEach(b => {
      b.life = 0;
      setHost(b.el, 0, 0, 0, 0, false);
    });
  }

  function maybeWrapNeu() {
    if (neuWrapped || typeof root.neu_mc.onRelease !== 'function') return;
    const inner = root.neu_mc.onRelease;
    root.neu_mc.onRelease = function() {
      inner.call(this);
      resetCharge();
    };
    neuWrapped = true;
  }

  function updateDocked() {
    if (flying.length || root.schiff_mc._visible === false || root.gameover_mc._visible) {
      pods.forEach(p => setHost(p.el, 0, 0, 0, 0, false));
      return;
    }
    syncPods();
    const sx = root.schiff_mc._x;
    const sy = root.schiff_mc._y;
    pods.forEach(p => {
      p.fade = Math.min(1, p.fade + (1 - Math.pow(1 - 0.12, 16 / 48)));
      p.dx += ((p.slotDx ?? p.dx) - p.dx) * DOCK_SLIDE;
      p.dy += ((p.slotDy ?? p.dy) - p.dy) * DOCK_SLIDE;
      const x = Math.max(8, Math.min(542, sx + p.dx));
      const y = sy + p.dy;
      tickFlame(p.el);
      setHost(p.el, x, y, DOCK_ROT, p.fade, true);
    });
  }

  const MIN_FLIGHT_AGE = 21; // 7 frames at 16 Hz → 21 at 48 Hz
  const HIT_RADIUS = 18;

  function updateFlying() {
    const next = [];
    const speed = flightSpeed();
    for (const m of flying) {
      m.age = (m.age || 0) + 1;
      if (!isTargetLive(m.target)) retargetMissile(m);
      const p = targetPos(m.target);
      if (m.target.clip) {
        m.target.x = p.x;
        m.target.y = p.y;
      }
      const rem = bezierLen(m.x0, m.y0, m.ctrlX, m.ctrlY, p.x, p.y, m.t, 8);
      // Advance by ~constant px along the remaining arc → farther = later impact.
      m.t = Math.min(1, m.t + (1 - m.t) * Math.min(1, speed / rem));
      const t = m.t;
      const x = bezier(m.x0, m.ctrlX, p.x, t);
      const y = bezier(m.y0, m.ctrlY, p.y, t);
      const dx = x - m.lastX;
      const dy = y - m.lastY;
      const rot = dx === 0 && dy === 0 ? DOCK_ROT : (Math.atan2(dy, dx) * 180) / Math.PI - 90;
      m.lastX = x;
      m.lastY = y;
      setArtScale(m.el, FLY_SCALE);
      tickFlame(m.el);
      setHost(m.el, x, y, rot, 1, true);
      const near = Math.hypot(p.x - x, p.y - y) <= HIT_RADIUS;
      if ((t >= 1 || near) && m.age >= MIN_FLIGHT_AGE) {
        applyHit(m.target);
        spawnBlast(p.x, p.y);
        window.RaketenspielSfx?.playSeekerExplosion?.();
        m.el.remove();
      } else next.push(m);
    }
    flying = next;
  }

  function updateBlasts() {
    for (const b of blasts) {
      if (b.life <= 0) {
        setHost(b.el, 0, 0, 0, 0, false);
        continue;
      }
      b.life -= 1;
      setHost(b.el, b.x, b.y, 0, b.life / 30, true);
    }
  }

  function tick() {
    maybeWrapNeu();
    if (root.gameover_mc._visible || root.schiff_mc._visible === false) {
      pods.forEach(p => setHost(p.el, 0, 0, 0, 0, false));
      for (const m of flying) m.el.remove();
      flying = [];
      updateBlasts();
      return;
    }
    updateDocked();
    updateFlying();
    updateBlasts();
  }

  const prevShip = root.schiff_mc.onEnterFrame;
  root.schiff_mc.onEnterFrame = function() {
    if (typeof prevShip === 'function') prevShip.call(this);
    tick();
  };

  root.fireMissiles = launch;
  root.resetMissiles = resetCharge;
  stage.addEventListener('contextmenu', e => e.preventDefault());
};
