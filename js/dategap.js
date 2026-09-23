"use strict";

/* ===== 日期间隔与中点 ===== */
(function dateGap(){
  const $ = id => document.getElementById(id);
  const nums = [$('dtM1'), $('dtD1'), $('dtM2'), $('dtD2')];
  const btnLeap = $('dtLeap'), btnNoLeap = $('dtNoLeap');
  const spanEl = $('dtSpan'), daysEl = $('dtDays'), midEl = $('dtMid');
  const noteEl = $('dtNote'), errEl = $('dtErr');
  const g = {
    ticks: $('dtTicks'), arc: $('dtArc'),
    line1: $('dtMidL1'), line2: $('dtMidL2'),
    dotA: $('dtDotA'), dotB: $('dtDotB'), dotM1: $('dtDotM1'), dotM2: $('dtDotM2')
  };

  // 抽象年历：闰年模式两端年份都按 366 天（含 2/29），平年模式都按 365 天
  let leap = true;
  const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365]; // 平年各月末的累计天数（末项为全年天数）
  const yearLen = () => leap ? 366 : 365;
  const dim = m => m === 2 ? (leap ? 29 : 28) : CUM[m] - CUM[m - 1];
  const doy = (m, d) => CUM[m - 1] + d + (leap && m >= 3 ? 1 : 0);
  const fromDoy = n => { // n ∈ 1..年长 → {m, d}
    for (let m = 12; m >= 1; m--) {
      const c = CUM[m - 1] + (leap && m >= 3 ? 1 : 0);
      if (n > c) return { m, d: n - c };
    }
  };
  const fmtDate = (m, d) => m + '月' + d + '日';

  // 年环几何：1 月 1 日在正上方，顺时针排布
  const C = 150, R_ARC = 116;
  const pt = (n, r) => {
    const a = (n - 1) / yearLen() * 2 * Math.PI;
    return [C + r * Math.sin(a), C - r * Math.cos(a)];
  };

  // 年环刻度：每日一刻，月初加长，月中标月份数字；闰年模式下 2/29 用红刻度标出
  function buildFace(){
    g.ticks.textContent = '';
    const NS = 'http://www.w3.org/2000/svg';
    const line = (n, r1, r2, color, w) => {
      const [x1, y1] = pt(n, r1), [x2, y2] = pt(n, r2);
      const el = document.createElementNS(NS, 'line');
      el.setAttribute('x1', x1.toFixed(2)); el.setAttribute('y1', y1.toFixed(2));
      el.setAttribute('x2', x2.toFixed(2)); el.setAttribute('y2', y2.toFixed(2));
      el.setAttribute('stroke', color); el.setAttribute('stroke-width', w);
      g.ticks.appendChild(el);
    };
    for (let m = 1; m <= 12; m++) {
      const start = doy(m, 1), len = dim(m);
      const [lx, ly] = pt(start + (len - 1) / 2, 131);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', lx.toFixed(1)); t.setAttribute('y', ly.toFixed(1));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'central');
      t.setAttribute('font-size', '10');
      t.setAttribute('fill', '#8a8577');
      t.textContent = m;
      g.ticks.appendChild(t);
      for (let d = 1; d <= len; d++) {
        const n = start + d - 1;
        if (d === 1) line(n, 139, 128, '#1d2126', 2);
        else if (leap && m === 2 && d === 29) line(n, 139, 133.5, '#c94f4f', 1.3);
        else line(n, 139, 136.5, '#d4cfc0', .8);
      }
    }
  }

  const readInt = el => {
    const v = Number(el.value);
    return Number.isInteger(v) ? v : NaN;
  };
  const hide = el => { el.style.display = 'none'; };
  const show = el => { el.style.display = ''; };
  const placeDot = (el, n) => {
    const [x, y] = pt(n, R_ARC);
    el.setAttribute('cx', x.toFixed(2)); el.setAttribute('cy', y.toFixed(2)); show(el);
  };
  const placeLine = (el, n) => {
    const [x, y] = pt(n, 103);
    el.setAttribute('x1', C); el.setAttribute('y1', C);
    el.setAttribute('x2', x.toFixed(2)); el.setAttribute('y2', y.toFixed(2));
    show(el);
  };

  function update(){
    const [M1, D1, M2, D2] = nums.map(readInt);

    // 依次校验，只报第一条错误
    let bad = null;
    const check = (m, d, tag) => {
      if (bad) return;
      if (Number.isNaN(m) || m < 1 || m > 12) bad = tag + '月份需在 1–12 之间';
      else if (Number.isNaN(d) || d < 1 || d > 31) bad = tag + '日期需在 1–31 之间';
      else if (d > dim(m)) bad = (leap || m !== 2)
        ? tag + '日期无效：' + m + ' 月只有 ' + dim(m) + ' 天'
        : '平年没有 2 月 29 日，可切换到「考虑闰年」';
    };
    check(M1, D1, '起始'); check(M2, D2, '结束');

    if (bad) {
      errEl.textContent = bad; errEl.hidden = false;
      spanEl.textContent = midEl.textContent = daysEl.innerHTML = '—';
      noteEl.textContent = '';
      hide(g.arc);
      [g.dotA, g.dotB, g.dotM1, g.dotM2, g.line1, g.line2].forEach(hide);
      return;
    }
    errEl.hidden = true;

    const L = yearLen();
    const da = doy(M1, D1), db = doy(M2, D2);
    const wrap = db < da;
    const diff = wrap ? db + L - da : db - da;

    spanEl.textContent = fmtDate(M1, D1) + ' → ' + (wrap ? '次年 ' : '') + fmtDate(M2, D2);
    daysEl.innerHTML = diff + ' 天<small>含首尾共 ' + (diff + 1) + ' 天</small>';
    noteEl.textContent = wrap ? '结束日期的月日在起始之前，已按次年理解。' : '';

    // 闭区间 [起始, 结束] 的正中：相差偶数天恰 1 天，奇数天有 2 天
    const mids = diff % 2 === 0 ? [da + diff / 2] : [da + (diff - 1) / 2, da + (diff + 1) / 2];
    const fmtDoy = n => { const p = fromDoy(((n - 1) % L) + 1); return fmtDate(p.m, p.d); };
    midEl.innerHTML = mids.map(fmtDoy).join(' · ') +
      '<small>区间正中' + (mids.length === 1 ? '恰 1 天' : '有 2 天') + '</small>';

    // 年环图形：绿弧为区间，墨点为两端日期，红点（带圆心引线）为中点
    const [ax, ay] = pt(da, R_ARC), [bx, by] = pt(db, R_ARC);
    if (diff > 0) {
      g.arc.setAttribute('d', 'M' + ax.toFixed(2) + ' ' + ay.toFixed(2) +
        ' A' + R_ARC + ' ' + R_ARC + ' 0 ' + (diff * 2 > L ? 1 : 0) + ' 1 ' +
        bx.toFixed(2) + ' ' + by.toFixed(2));
      show(g.arc);
    } else hide(g.arc);
    placeDot(g.dotA, da); placeDot(g.dotB, db);
    placeDot(g.dotM1, mids[0]); placeLine(g.line1, mids[0]);
    if (mids.length === 2) { placeDot(g.dotM2, mids[1]); placeLine(g.line2, mids[1]); }
    else { hide(g.dotM2); hide(g.line2); }
  }

  for (const el of nums) {
    el.addEventListener('input', update);
    el.addEventListener('change', () => {
      const v = Number(el.value);
      el.value = Number.isInteger(v) ? Math.min(+el.max, Math.max(+el.min, v)) : +el.min;
      update();
    });
  }

  function setLeap(v){
    leap = v;
    btnLeap.classList.toggle('on', v);
    btnNoLeap.classList.toggle('on', !v);
    buildFace(); update();
  }
  btnLeap.addEventListener('click', () => setLeap(true));
  btnNoLeap.addEventListener('click', () => setLeap(false));

  buildFace();
  update();
})();
