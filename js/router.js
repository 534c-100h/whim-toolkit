"use strict";

/* ===== 路由（#/、#/morse、#/pigpen、#/ascii、#/clock）=====
   视图自动识别：凡 .view 区块 id 形如 view-<名称> 即可路由，新增工具无需在此登记 */
(function router(){
  const VIEWS = Array.from(document.querySelectorAll('.view'), el => el.id.replace(/^view-/, ''));
  const navLinks = document.querySelectorAll('[data-nav]');
  function route(){
    let h = location.hash.replace(/^#\/?/, '');
    if (!VIEWS.includes(h)) h = 'home';
    VIEWS.forEach(v => document.getElementById('view-' + v).classList.toggle('active', v === h));
    navLinks.forEach(a => a.classList.toggle('on', a.dataset.nav === h));
    // 右上角导航仅在工具页显示，主页隐藏
    document.querySelector('.topbar nav').classList.toggle('hide', h === 'home');
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
