"use strict";

/* ===== 共用小工具 ===== */
const escHtml = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function downloadFont(fileName, b64, mime){
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// 滑块与数字输入框双向同步：数字框输入会夹取到滑块范围内
function bindSize(range, num, onChange){
  range.addEventListener('input', () => { num.value = range.value; onChange(); });
  num.addEventListener('input', () => {
    const v = parseFloat(num.value);
    if (Number.isNaN(v)) return;
    range.value = Math.min(+num.max, Math.max(+num.min, v));
    onChange();
  });
  num.addEventListener('change', () => { num.value = range.value; });
}

function bindBg(lightBtn, darkBtn, stage){
  lightBtn.addEventListener('click', () => {
    stage.classList.remove('dark');
    lightBtn.classList.add('on'); darkBtn.classList.remove('on');
  });
  darkBtn.addEventListener('click', () => {
    stage.classList.add('dark');
    darkBtn.classList.add('on'); lightBtn.classList.remove('on');
  });
}
