"use strict";

/* ===== ASCII 二进制字体试用 ===== */
(function asciiLab(){
  const VARIANTS = {
    square:  { family: "'Vertical ASCII'",         ttf: 'asciiTtf',   woff: 'asciiWoff',   base: 'VerticalASCII-Regular' },
    rounded: { family: "'Vertical ASCII Rounded'", ttf: 'roundedTtf', woff: 'roundedWoff', base: 'VerticalASCIIRounded-Regular' }
  };
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let variant = 'square';

  const text = document.getElementById('abText');
  const size = document.getElementById('abSize');
  const sizeNum = document.getElementById('abSizeNum');
  const sample = document.getElementById('abSample');
  const stage = document.getElementById('abStage');
  const map = document.getElementById('abMap');
  const sqBtn = document.getElementById('abSq');
  const rdBtn = document.getElementById('abRd');
  const ttfBtn = document.getElementById('abDlTtf');
  const woffBtn = document.getElementById('abDlWoff');

  function cell(glyph, label, family){
    const style = family ? ' style="font-family:' + family + '"' : '';
    return '<div class="cm-cell"><span class="g"' + style + '>' + escHtml(glyph) +
      '</span><span class="k">' + escHtml(label) + '</span></div>';
  }

  function render(){
    const v = VARIANTS[variant];
    sample.style.fontFamily = v.family;
    sample.style.fontSize = size.value + 'px';
    sample.style.lineHeight = '2.1';
    sample.style.letterSpacing = '.04em';
    sample.textContent = text.value;
  }

  function renderMap(){
    const v = VARIANTS[variant];
    let html = '';
    for (const ch of CHARS) html += cell(ch, ch, v.family);
    html += cell('␣', '空格', null);
    map.innerHTML = html;
  }

  function updateButtons(){
    const v = VARIANTS[variant];
    ttfBtn.textContent = '下载 TTF · ' + v.base + '.ttf';
    woffBtn.textContent = '下载 WOFF · ' + v.base + '.woff';
  }

  function setVariant(name){
    variant = name;
    sqBtn.classList.toggle('on', name === 'square');
    rdBtn.classList.toggle('on', name === 'rounded');
    render(); renderMap(); updateButtons();
  }

  sqBtn.addEventListener('click', () => setVariant('square'));
  rdBtn.addEventListener('click', () => setVariant('rounded'));
  text.addEventListener('input', render);
  bindSize(size, sizeNum, render);
  bindBg(document.getElementById('abLight'), document.getElementById('abDark'), stage);
  ttfBtn.addEventListener('click', () => { const v = VARIANTS[variant]; downloadFont(v.base + '.ttf', FONT_B64[v.ttf], 'font/ttf'); });
  woffBtn.addEventListener('click', () => { const v = VARIANTS[variant]; downloadFont(v.base + '.woff', FONT_B64[v.woff], 'font/woff'); });

  render(); renderMap(); updateButtons();
})();
