"use strict";

/* ===== 猪圈密码字体试用 ===== */
(function pigpenLab(){
  const FAMILY = "'Pigpen Cipher'";
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.。';
  const text = document.getElementById('pgText');
  const size = document.getElementById('pgSize');
  const sizeNum = document.getElementById('pgSizeNum');
  const sample = document.getElementById('pgSample');
  const stage = document.getElementById('pgStage');
  const map = document.getElementById('pgMap');

  function render(){
    sample.style.fontFamily = FAMILY;
    sample.style.fontSize = size.value + 'px';
    sample.style.letterSpacing = '1px';
    sample.textContent = text.value;
  }

  function renderMap(){
    let html = '';
    for (const ch of CHARS) {
      html += '<div class="cm-cell"><span class="g" style="font-family:' + FAMILY + '">' +
        escHtml(ch) + '</span><span class="k">' + escHtml(ch) + '</span></div>';
    }
    map.innerHTML = html;
  }

  text.addEventListener('input', render);
  bindSize(size, sizeNum, render);
  bindBg(document.getElementById('pgLight'), document.getElementById('pgDark'), stage);
  document.getElementById('pgDl').addEventListener('click', () =>
    downloadFont('PigpenCipher.ttf', FONT_B64.pigpenTtf, 'font/ttf'));

  render();
  renderMap();
})();
