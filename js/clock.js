"use strict";

/* ===== 时钟指针角度 ===== */
(function clockHands(){
  const $ = id => document.getElementById(id);
  const hEl = $('ckH'), mEl = $('ckM'), sEl = $('ckS');
  const liveChk = $('ckLive');
  const HANDS = {
    H: { clock: $('ckHc'), math: $('ckHm'), line: $('ckHandH') },
    M: { clock: $('ckMc'), math: $('ckMm'), line: $('ckHandM') },
    S: { clock: $('ckSc'), math: $('ckSm'), line: $('ckHandS') }
  };

  // 表盘：60 个刻度 + 12/3/6/9 数字（构建一次）
  (function buildFace(){
    const NS = 'http://www.w3.org/2000/svg', C = 150, R = 139;
    const g = $('ckTicks');
    for (let i = 0; i < 60; i++) {
      const a = i * Math.PI / 30, major = i % 5 === 0;
      const r1 = R, r2 = R - (major ? 12 : 6);
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', (C + r1 * Math.sin(a)).toFixed(2));
      line.setAttribute('y1', (C - r1 * Math.cos(a)).toFixed(2));
      line.setAttribute('x2', (C + r2 * Math.sin(a)).toFixed(2));
      line.setAttribute('y2', (C - r2 * Math.cos(a)).toFixed(2));
      line.setAttribute('stroke', major ? '#1d2126' : '#d4cfc0');
      line.setAttribute('stroke-width', major ? 2 : 1);
      g.appendChild(line);
    }
    [['12', 150, 32], ['3', 268, 150], ['6', 150, 271], ['9', 32, 150]].forEach(([t, x, y]) => {
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', x); text.setAttribute('y', y);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '15');
      text.setAttribute('fill', '#8a8577');
      text.textContent = t;
      g.appendChild(text);
    });
  })();

  const norm360 = a => ((a % 360) + 360) % 360;
  const toMath = clockA => norm360(90 - clockA); // 12 点方向即数学 90°
  const fmt = a => (Math.round(a * 10000) / 10000) + '°';
  const read = (el, min, max) => {
    const v = parseFloat(el.value);
    return Math.min(max, Math.max(min, Number.isNaN(v) ? 0 : v));
  };

  function update(){
    const h = read(hEl, 0, 23), m = read(mEl, 0, 59), s = read(sEl, 0, 59);
    // 三针连续转动：时针 30°/h 并随分秒推进，分针 6°/min 并随秒推进，秒针 6°/s
    const angles = {
      H: norm360((h % 12) * 30 + m * 0.5 + s / 120),
      M: norm360(m * 6 + s * 0.1),
      S: norm360(s * 6)
    };
    for (const k of Object.keys(angles)) {
      const a = angles[k];
      HANDS[k].clock.textContent = fmt(a);
      HANDS[k].math.textContent = fmt(toMath(a));
      HANDS[k].line.setAttribute('transform', 'rotate(' + a + ' 150 150)');
    }
  }

  function fillNow(){
    const d = new Date();
    hEl.value = d.getHours(); mEl.value = d.getMinutes(); sEl.value = d.getSeconds();
  }

  for (const el of [hEl, mEl, sEl]) {
    el.addEventListener('input', update);
    el.addEventListener('change', () => { el.value = read(el, +el.min, +el.max); });
  }

  let timer = null;
  function syncLive(){
    if (liveChk.checked) {
      hEl.disabled = mEl.disabled = sEl.disabled = true;
      fillNow(); update();
      timer = setInterval(() => { fillNow(); update(); }, 250);
    } else {
      hEl.disabled = mEl.disabled = sEl.disabled = false;
      if (timer) { clearInterval(timer); timer = null; }
    }
  }
  liveChk.addEventListener('change', syncLive);
  $('ckNow').addEventListener('click', () => {
    liveChk.checked = false; syncLive();
    fillNow(); update();
  });

  update();
})();
