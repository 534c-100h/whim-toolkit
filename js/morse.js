"use strict";

/* ===== 摩斯电码圆环（原工具移植）===== */
(function morseRing(){
  // ITU 标准摩斯电码表
  const MORSE = {
    A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....',
    I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.',
    Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-',
    Y:'-.--', Z:'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....',
    '6':'-....','7':'--...','8':'---..','9':'----.',
    '.':'.-.-.-', ',':'--..--', '?':'..--..', "'":'.----.', '!':'-.-.--',
    '/':'-..-.', '(':'-.--.', ')':'-.--.-', '&':'.-...', ':':'---...',
    ';':'-.-.-', '=':'-...-', '+':'.-.-.', '-':'-....-', '_':'..--.-',
    '"':'.-..-.', '$':'...-..-', '@':'.--.-.'
  };

  const SIZE = 720;
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.style.width = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const CX = SIZE / 2, CY = SIZE / 2;

  const $ = id => document.getElementById(id);
  const els = {
    text: $('text'), radius: $('radius'), stroke: $('stroke'), gap: $('gap'),
    radiusNum: $('radiusNum'), strokeNum: $('strokeNum'), gapNum: $('gapNum'),
    phaseRows: $('phaseRows'),
    refCircle: $('refCircle'),
    transparent: $('transparent'),
    btnCW: $('btnCW'), btnCCW: $('btnCCW'), marker: $('marker'),
    btnGapMid: $('btnGapMid'), btnSymStart: $('btnSymStart'),
    btnButt: $('btnButt'), btnRound: $('btnRound'),
    morseText: $('morseText'), unitInfo: $('unitInfo'), skippedInfo: $('skippedInfo'),
    save: $('save')
  };
  let clockwise = true;
  let roundCap = false;
  let seamMid = true; // true: 初相位位于接缝间隔正中；false: 初相位即首个符号的起点
  let phases = [0];   // 每圈独立的初相位（°），圈序即文字行序（自外向内）

  // 圈数变化时重建每圈的初相位输入行，已有值尽量保留
  let phaseEls = [];
  function syncPhaseRows(n) {
    while (phases.length < n) phases.push(0);
    phases.length = n;
    if (phaseEls.length === n) return;
    els.phaseRows.innerHTML = '';
    phaseEls = [];
    for (let i = 0; i < n; i++) {
      const row = document.createElement('div');
      row.className = 'p-row';
      const tag = document.createElement('span');
      tag.className = 'p-tag';
      tag.textContent = '圈' + (i + 1);
      const range = document.createElement('input');
      range.type = 'range'; range.min = 0; range.max = 360; range.step = 1; range.value = phases[i];
      const num = document.createElement('input');
      num.type = 'number'; num.min = 0; num.max = 360; num.step = 1; num.value = phases[i];
      num.setAttribute('aria-label', '第' + (i + 1) + '圈初相位数值');
      row.append(tag, range, num);
      els.phaseRows.appendChild(row);
      phaseEls.push({ range, num });
      const commit = v => { phases[i] = v; draw(); };
      range.addEventListener('input', () => { num.value = range.value; commit(+range.value); });
      num.addEventListener('input', () => {
        const v = parseFloat(num.value);
        if (Number.isNaN(v)) return;
        range.value = Math.min(360, Math.max(0, v));
        commit(+range.value);
      });
      num.addEventListener('change', () => { num.value = range.value; phases[i] = +range.value; });
    }
  }

  // 文本 → 摩斯时间单位序列：dot=1、dash=3、符号间隔=1、字母间隔=3、词间隔=7
  function encode(text) {
    const segments = [];
    const skipped = new Set();
    const words = text.toUpperCase().split(/\s+/).filter(Boolean);
    const morseWords = [];
    for (let w = 0; w < words.length; w++) {
      if (w > 0) segments.push({ kind: 'gap', units: 7 });
      const letters = [];
      for (const ch of words[w]) {
        const code = MORSE[ch];
        if (!code) { skipped.add(ch); continue; }
        if (letters.length) segments.push({ kind: 'gap', units: 3 });
        letters.push(code);
        for (let i = 0; i < code.length; i++) {
          if (i) segments.push({ kind: 'gap', units: 1 });
          segments.push({ kind: code[i] === '.' ? 'dot' : 'dash', units: code[i] === '.' ? 1 : 3 });
        }
      }
      if (letters.length) morseWords.push(letters.join(' '));
    }
    // 圆环接缝：末符号与首符号在起点处相邻，补一段间隔把它们断开
    // （多词时接缝是词边界取 7，单词时是字母边界取 3）
    let seam = 0;
    if (segments.length) { seam = words.length > 1 ? 7 : 3; segments.push({ kind: 'gap', units: seam }); }
    return { segments, seam, skipped: [...skipped], morseText: morseWords.join(' / ') };
  }

  function draw() {
    const R = +els.radius.value;          // 最外圈（第 1 行）的半径
    const strokeW = +els.stroke.value;    // 所有圈共用的笔画粗细
    const gapPx = +els.gap.value;         // 相邻圈边缘间隔（px），决定圈距
    const dir = clockwise ? 1 : -1;

    const lines = els.text.value.split('\n').map(s => s.trim()).filter(Boolean);
    const encs = lines.map(encode);
    const totalOf = e => e.segments.reduce((s, g) => s + g.units, 0);
    // 只保留能编码出内容的行；每圈独立铺满自己的 360°
    const rings = encs.map(e => ({ e, total: totalOf(e) })).filter(o => o.total > 0);
    syncPhaseRows(rings.length);

    els.morseText.textContent = rings.map(o => o.e.morseText).join('\n');
    const skipped = new Set();
    encs.forEach(o => o.skipped.forEach(ch => skipped.add(ch)));
    const warns = [];
    if (skipped.size) warns.push('已忽略无法编码的字符：' + [...skipped].join(' '));

    ctx.clearRect(0, 0, SIZE, SIZE);
    // 透明底导出：跳过白色填充；画布上的白底来自 CSS，仅用于预览，不影响导出像素
    if (!els.transparent.checked) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    if (!rings.length) {
      ctx.fillStyle = '#8a8577';
      ctx.font = '15px system-ui, "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('请输入可编码的文字（字母 / 数字 / 常用标点）', CX, CY);
      els.unitInfo.textContent = '';
      els.skippedInfo.textContent = warns.join('；');
      syncImg();
      return;
    }

    const pitch = strokeW + gapPx; // 相邻圈的圆心距
    const radii = rings.map((o, i) => R - i * pitch);
    const drawn = [];
    for (let i = 0; i < radii.length; i++) {
      if (radii[i] > strokeW / 2) drawn.push(i);
      else { warns.push('圈数过多：第 ' + (i + 1) + ' 圈起半径不足，已省略'); break; }
    }
    els.skippedInfo.textContent = warns.join('；');

    els.unitInfo.textContent = rings.length === 1
      ? '共 ' + rings[0].total + ' 个时间单位，每单位 ' + (360 / rings[0].total).toFixed(2) + '°，总角 360°'
      : '共 ' + rings.length + ' 圈（自外向内）· 每圈铺满 360° · 单位数 ' + rings.map(o => o.total).join(' / ');

    // 底层参考圆，便于看出每圈被铺满（可开关）
    if (els.refCircle.checked) {
      ctx.strokeStyle = 'rgba(29,33,38,.10)';
      ctx.lineWidth = 1;
      for (const i of drawn) {
        ctx.beginPath();
        ctx.arc(CX, CY, radii[i], 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // 各圈共用的角度换算：初相位按圈独立，单位圆约定 0° 在 3 点钟方向、逆时针增加
    const baseOf = (i, unit) =>
      -phases[i] * Math.PI / 180 + (seamMid ? dir * rings[i].e.seam * unit / 2 : 0);

    ctx.strokeStyle = '#1d2126';
    ctx.fillStyle = '#1d2126';
    ctx.lineWidth = strokeW;
    ctx.lineCap = roundCap ? 'round' : 'butt';
    for (const i of drawn) {
      const rk = radii[i];
      const unit = 2 * Math.PI / rings[i].total;
      const base = baseOf(i, unit);
      let cum = 0;
      for (const g of rings[i].e.segments) {
        if (g.kind !== 'gap') {
          const a0 = base + dir * cum * unit;
          const a1 = base + dir * (cum + g.units) * unit;
          // 圆角下符号弧长不超过笔画宽度时，收短后的弧画不下端帽：
          // 退化为与笔画等粗的圆珠，保证点划粗细一致（墨迹略超出名义单位、间隔稍窄）
          if (roundCap && g.units * unit * rk <= strokeW) {
            const mid = (a0 + a1) / 2;
            ctx.beginPath();
            ctx.arc(CX + Math.cos(mid) * rk, CY + Math.sin(mid) * rk,
              strokeW / 2, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            let s0 = a0, s1 = a1;
            if (roundCap) {
              // 圆角端帽会在弧两端各延伸半个笔宽，将弧等量收短，
              // 使墨迹（含端帽）角宽仍精确等于名义时间单位
              const half = strokeW / (2 * rk);
              s0 += dir * half;
              s1 -= dir * half;
            }
            ctx.beginPath();
            // 逆时针阅读时 s1 < s0，必须传 anticlockwise=true 才沿阅读方向绘制
            ctx.arc(CX, CY, rk, s0, s1, !clockwise);
            ctx.stroke();
          }
        }
        cum += g.units;
      }
    }

    if (els.marker.checked) {
      // 多圈时红刻度随各圈相位分开放置，长度收缩到不越过圈间空隙
      const ext = rings.length > 1 ? Math.max(4, Math.min(16, (pitch - strokeW) / 2 + 4)) : 16;
      ctx.strokeStyle = '#c94f4f';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (const i of drawn) {
        const rk = radii[i];
        const base = baseOf(i, 2 * Math.PI / rings[i].total);
        const x = Math.cos(base), y = Math.sin(base);
        ctx.beginPath();
        ctx.moveTo(CX + x * (rk - strokeW / 2 - ext), CY + y * (rk - strokeW / 2 - ext));
        ctx.lineTo(CX + x * (rk + strokeW / 2 + ext), CY + y * (rk + strokeW / 2 + ext));
        ctx.stroke();
      }
    }

    syncImg();
  }

  // 移动端长按保存：触屏设备上用 <img> 呈现同一画面（canvas 无法长按存图），
  // 每次重绘后把画布导出为 data URL；桌面端 img 隐藏，不做无用导出
  const coarsePointers = window.matchMedia('(pointer: coarse)');
  const morseImg = $('morseImg');
  function syncImg(){
    if (coarsePointers.matches) morseImg.src = canvas.toDataURL('image/png');
  }
  if (coarsePointers.addEventListener) coarsePointers.addEventListener('change', syncImg);

  els.text.addEventListener('input', draw);
  els.marker.addEventListener('change', draw);
  els.refCircle.addEventListener('change', draw);
  els.transparent.addEventListener('change', draw);

  bindSize(els.radius, els.radiusNum, draw);
  bindSize(els.stroke, els.strokeNum, draw);
  bindSize(els.gap, els.gapNum, draw);
  els.btnCW.addEventListener('click', () => {
    clockwise = true;
    els.btnCW.classList.add('on'); els.btnCCW.classList.remove('on');
    draw();
  });
  els.btnCCW.addEventListener('click', () => {
    clockwise = false;
    els.btnCCW.classList.add('on'); els.btnCW.classList.remove('on');
    draw();
  });
  els.btnButt.addEventListener('click', () => {
    roundCap = false;
    els.btnButt.classList.add('on'); els.btnRound.classList.remove('on');
    draw();
  });
  els.btnRound.addEventListener('click', () => {
    roundCap = true;
    els.btnRound.classList.add('on'); els.btnButt.classList.remove('on');
    draw();
  });
  els.btnGapMid.addEventListener('click', () => {
    seamMid = true;
    els.btnGapMid.classList.add('on'); els.btnSymStart.classList.remove('on');
    draw();
  });
  els.btnSymStart.addEventListener('click', () => {
    seamMid = false;
    els.btnSymStart.classList.add('on'); els.btnGapMid.classList.remove('on');
    draw();
  });
  els.save.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = 'morse-ring.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  draw();
})();
